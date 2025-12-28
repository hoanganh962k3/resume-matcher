import uuid
import json
import logging

from typing import List, Dict, Any, Optional
from pydantic import ValidationError
from sqlalchemy import select, insert, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent import AgentManager
from app.prompt import prompt_factory
from app.schemas.json import json_schema_factory
from app.models import Job, Resume, ProcessedJob, ProcessedResume
from app.models.association import job_resume_association
from app.schemas.pydantic import StructuredJobModel
from .exceptions import JobNotFoundError

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.json_agent_manager = AgentManager()

    async def create_and_store_job(self, job_data: dict, user_id: Optional[str] = None) -> List[str]:
        """
        Stores job data in the database and returns a list of job IDs.
        
        Args:
            job_data: Dictionary containing job descriptions and resume_id
            user_id: Optional user ID to link jobs to a user (None for guest uploads)
        """
        resume_id = str(job_data.get("resume_id"))

        if not await self._is_resume_available(resume_id):
            raise AssertionError(
                f"resume corresponding to resume_id: {resume_id} not found"
            )
        
        # Check if processed resume exists
        if not await self._is_processed_resume_available(resume_id):
            logger.warning(f"Processed resume not found for resume_id: {resume_id}")

        job_ids = []
        for job_description in job_data.get("job_descriptions", []):
            job_id = str(uuid.uuid4())
            
            # Create raw job without resume_id (relationship is in association table)
            job = Job(
                job_id=job_id,
                user_id=user_id,
                content=job_description,
            )
            self.db.add(job)
            await self.db.flush()
            
            # Create association between job and resume
            await self._create_job_resume_association(job_id, resume_id)

            # Process the job and create processed_job entry
            await self._extract_and_store_structured_job(
                job_id=job_id, 
                job_description_text=job_description, 
                user_id=user_id
            )
            logger.info(f"Job ID: {job_id} created and associated with resume: {resume_id}")
            job_ids.append(job_id)

        await self.db.commit()
        return job_ids
    
    async def _create_job_resume_association(self, job_id: str, resume_id: str) -> None:
        """
        Creates an association between a job and a resume in the job_resume table.
        This allows one job to be compared with multiple resumes.
        
        Args:
            job_id: The ID of the job
            resume_id: The ID of the resume
        """
        try:
            stmt = insert(job_resume_association).values(
                job_id=job_id,
                resume_id=resume_id
            )
            await self.db.execute(stmt)
            logger.info(f"Created job-resume association: job_id={job_id}, resume_id={resume_id}")
        except Exception as e:
            logger.error(f"Failed to create job-resume association: {e}")
            raise

    async def _is_resume_available(self, resume_id: str) -> bool:
        """
        Checks if a resume exists in the database.
        """
        query = select(Resume).where(Resume.resume_id == resume_id)
        result = await self.db.scalar(query)
        return result is not None
    
    async def _is_processed_resume_available(self, resume_id: str) -> bool:
        """
        Checks if a processed resume exists in the database.
        """
        query = select(ProcessedResume).where(ProcessedResume.resume_id == resume_id)
        result = await self.db.scalar(query)
        return result is not None
    
    async def ensure_job_resume_association(self, job_id: str, resume_id: str) -> None:
        """
        Ensures that an association exists between a job and a resume.
        Creates the association if it doesn't exist.
        This should be called before comparing or improving a job with a resume.
        
        Args:
            job_id: The ID of the job
            resume_id: The ID of the resume
        """
        from sqlalchemy import and_
        
        # Check if association already exists
        query = select(job_resume_association).where(
            and_(
                job_resume_association.c.job_id == job_id,
                job_resume_association.c.resume_id == resume_id
            )
        )
        result = await self.db.execute(query)
        existing = result.first()
        
        if existing:
            logger.debug(f"Job-resume association already exists: job_id={job_id}, resume_id={resume_id}")
            return
        
        # Create new association if it doesn't exist
        await self._create_job_resume_association(job_id, resume_id)
        await self.db.commit()

    async def _extract_and_store_structured_job(
        self, job_id: str, job_description_text: str, user_id: Optional[str] = None
    ):
        """
        Extract and store structured job data in the database.
        
        Args:
            job_id: The ID of the job being processed
            job_description_text: The raw job description text
            user_id: Optional user ID
        """
        structured_job = await self._extract_structured_json(job_description_text)
        if not structured_job:
            logger.info("Structured job extraction failed.")
            return None

        processed_job = ProcessedJob(
            job_id=job_id,
            user_id=user_id,
            job_title=structured_job.get("job_title"),
            company_profile=json.dumps(structured_job.get("company_profile"))
            if structured_job.get("company_profile")
            else None,
            location=json.dumps(structured_job.get("location"))
            if structured_job.get("location")
            else None,
            date_posted=structured_job.get("date_posted"),
            employment_type=structured_job.get("employment_type"),
            job_summary=structured_job.get("job_summary"),
            key_responsibilities=json.dumps(
                {"key_responsibilities": structured_job.get("key_responsibilities", [])}
            )
            if structured_job.get("key_responsibilities")
            else None,
            qualifications=json.dumps(structured_job.get("qualifications", []))
            if structured_job.get("qualifications")
            else None,
            compensation_and_benfits=json.dumps(
                structured_job.get("compensation_and_benfits", [])
            )
            if structured_job.get("compensation_and_benfits")
            else None,
            application_info=json.dumps(structured_job.get("application_info", []))
            if structured_job.get("application_info")
            else None,
            extracted_keywords=json.dumps(
                {"extracted_keywords": structured_job.get("extracted_keywords", [])}
            )
            if structured_job.get("extracted_keywords")
            else None,
        )

        self.db.add(processed_job)
        await self.db.flush()
        await self.db.commit()

        return job_id

    async def _extract_structured_json(
        self, job_description_text: str
    ) -> Dict[str, Any] | None:
        """
        Uses the AgentManager+JSONWrapper to ask the LLM to
        return the data in exact JSON schema we need.
        """
        prompt_template = prompt_factory.get("structured_job")
        prompt = prompt_template.format(
            json.dumps(json_schema_factory.get("structured_job"), indent=2),
            job_description_text,
        )
        logger.info(f"Structured Job Prompt: {prompt}")
        raw_output = await self.json_agent_manager.run(prompt=prompt)

        try:
            structured_job: StructuredJobModel = StructuredJobModel.model_validate(
                raw_output
            )
        except ValidationError as e:
            logger.info(f"Validation error: {e}")
            error_details = []
            for error in e.errors():
                field = " -> ".join(str(loc) for loc in error["loc"])
                error_details.append(f"{field}: {error['msg']}")
            
            logger.info(f"Validation error details: {'; '.join(error_details)}")
            return None
        return structured_job.model_dump(mode="json")

    async def get_job_with_processed_data(self, job_id: str) -> Optional[Dict]:
        """
        Fetches both job and processed job data from the database and combines them.

        Args:
            job_id: The ID of the job to retrieve

        Returns:
            Combined data from both job and processed_job models

        Raises:
            JobNotFoundError: If the job is not found
        """
        job_query = select(Job).where(Job.job_id == job_id)
        job_result = await self.db.execute(job_query)
        job = job_result.scalars().first()

        if not job:
            raise JobNotFoundError(job_id=job_id)

        processed_query = select(ProcessedJob).where(ProcessedJob.job_id == job_id)
        processed_result = await self.db.execute(processed_query)
        processed_job = processed_result.scalars().first()

        combined_data = {
            "job_id": job.job_id,
            "raw_job": {
                "id": job.id,
                "content": job.content,
                "created_at": job.created_at.isoformat() if job.created_at else None,
            },
            "processed_job": None
        }

        if processed_job:
            combined_data["processed_job"] = {
                "job_title": processed_job.job_title,
                "company_profile": json.loads(processed_job.company_profile) if processed_job.company_profile else None,
                "location": json.loads(processed_job.location) if processed_job.location else None,
                "date_posted": processed_job.date_posted,
                "employment_type": processed_job.employment_type,
                "job_summary": processed_job.job_summary,
                "key_responsibilities": json.loads(processed_job.key_responsibilities).get("key_responsibilities", []) if processed_job.key_responsibilities else None,
                "qualifications": json.loads(processed_job.qualifications).get("qualifications", []) if processed_job.qualifications else None,
                "compensation_and_benfits": json.loads(processed_job.compensation_and_benfits).get("compensation_and_benfits", []) if processed_job.compensation_and_benfits else None,
                "application_info": json.loads(processed_job.application_info).get("application_info", []) if processed_job.application_info else None,
                "extracted_keywords": json.loads(processed_job.extracted_keywords).get("extracted_keywords", []) if processed_job.extracted_keywords else None,
                "processed_at": processed_job.processed_at.isoformat() if processed_job.processed_at else None,
            }

        return combined_data

    async def get_jobs_for_resume(self, resume_id: str, user_id: str) -> List[Dict]:
        """
        Fetches all jobs associated with a specific resume for a user.

        Args:
            resume_id: The ID of the resume
            user_id: The ID of the user (for authorization)

        Returns:
            List of jobs with both raw and processed data
        """
        # Get all job_ids associated with this resume from the association table
        assoc_query = select(job_resume_association.c.job_id).where(
            job_resume_association.c.resume_id == resume_id
        )
        assoc_result = await self.db.execute(assoc_query)
        job_ids = [row[0] for row in assoc_result.fetchall()]

        if not job_ids:
            return []

        # Fetch jobs that belong to the user and are in the job_ids list
        job_query = select(Job).where(
            and_(
                Job.job_id.in_(job_ids),
                Job.user_id == user_id
            )
        ).order_by(Job.created_at.desc())
        job_result = await self.db.execute(job_query)
        jobs = job_result.scalars().all()

        result = []
        for job in jobs:
            # Fetch processed job if exists
            processed_query = select(ProcessedJob).where(ProcessedJob.job_id == job.job_id)
            processed_result = await self.db.execute(processed_query)
            processed_job = processed_result.scalars().first()

            job_data = {
                "job_id": job.job_id,
                "raw_job": {
                    "id": job.id,
                    "content": job.content,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                },
                "processed_job": None,
            }

            if processed_job:
                job_data["processed_job"] = {
                    "job_title": processed_job.job_title,
                    "company_profile": json.loads(processed_job.company_profile) if processed_job.company_profile else None,
                    "location": json.loads(processed_job.location) if processed_job.location else None,
                    "date_posted": processed_job.date_posted,
                    "employment_type": processed_job.employment_type,
                    "job_summary": processed_job.job_summary,
                    "key_responsibilities": json.loads(processed_job.key_responsibilities).get("key_responsibilities", []) if processed_job.key_responsibilities else None,
                    "qualifications": json.loads(processed_job.qualifications) if processed_job.qualifications else None,
                    "compensation_and_benfits": json.loads(processed_job.compensation_and_benfits) if processed_job.compensation_and_benfits else None,
                    "application_info": json.loads(processed_job.application_info) if processed_job.application_info else None,
                    "extracted_keywords": json.loads(processed_job.extracted_keywords).get("extracted_keywords", []) if processed_job.extracted_keywords else None,
                    "processed_at": processed_job.processed_at.isoformat() if processed_job.processed_at else None,
                }

            result.append(job_data)

        return result

    async def get_all_jobs_for_user(self, user_id: str) -> List[Dict]:
        """
        Fetches all jobs associated with a user, regardless of resume association.

        Args:
            user_id: The ID of the user

        Returns:
            List of jobs with both raw and processed data
        """
        # Fetch all jobs that belong to the user
        job_query = select(Job).where(
            Job.user_id == user_id
        ).order_by(Job.created_at.desc())
        job_result = await self.db.execute(job_query)
        jobs = job_result.scalars().all()

        result = []
        for job in jobs:
            # Fetch processed job if exists
            processed_query = select(ProcessedJob).where(ProcessedJob.job_id == job.job_id)
            processed_result = await self.db.execute(processed_query)
            processed_job = processed_result.scalars().first()

            job_data = {
                "job_id": job.job_id,
                "raw_job": {
                    "id": job.id,
                    "content": job.content,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                },
                "processed_job": None,
            }

            if processed_job:
                job_data["processed_job"] = {
                    "job_title": processed_job.job_title,
                    "company_profile": json.loads(processed_job.company_profile) if processed_job.company_profile else None,
                    "location": json.loads(processed_job.location) if processed_job.location else None,
                    "date_posted": processed_job.date_posted,
                    "employment_type": processed_job.employment_type,
                    "job_summary": processed_job.job_summary,
                    "key_responsibilities": json.loads(processed_job.key_responsibilities).get("key_responsibilities", []) if processed_job.key_responsibilities else None,
                    "qualifications": json.loads(processed_job.qualifications) if processed_job.qualifications else None,
                    "compensation_and_benfits": json.loads(processed_job.compensation_and_benfits) if processed_job.compensation_and_benfits else None,
                    "application_info": json.loads(processed_job.application_info) if processed_job.application_info else None,
                    "extracted_keywords": json.loads(processed_job.extracted_keywords).get("extracted_keywords", []) if processed_job.extracted_keywords else None,
                    "processed_at": processed_job.processed_at.isoformat() if processed_job.processed_at else None,
                }

            result.append(job_data)

        return result
