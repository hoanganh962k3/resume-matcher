import json
import logging
from typing import Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import ValidationError

from app.models import ProcessedResume, ProcessedJob
from app.agent import AgentManager
from app.prompt import prompt_factory
from app.schemas.json import json_schema_factory
from app.schemas.pydantic import LearningScheduleModel, LearningScheduleRequest
from .exceptions import (
    ResumeNotFoundError,
    JobNotFoundError,
    LearningScheduleGenerationError,
)

logger = logging.getLogger(__name__)


class LearningScheduleService:
    """
    Service to generate personalized learning schedules for job seekers.
    Analyzes skill gaps between processed resume and job requirements,
    then creates a structured learning plan with activities, resources, and milestones.
    """

    def __init__(self, db: AsyncSession, max_retries: int = 3):
        self.db = db
        self.max_retries = max_retries
        self.agent_manager = AgentManager(strategy="json")

    async def _get_processed_resume(self, resume_id: str) -> ProcessedResume:
        """
        Retrieve processed resume from database.
        
        Args:
            resume_id: Resume identifier
            
        Returns:
            ProcessedResume model instance
            
        Raises:
            ResumeNotFoundError: If resume is not found or not processed
        """
        result = await self.db.execute(
            select(ProcessedResume).where(ProcessedResume.resume_id == resume_id)
        )
        processed_resume = result.scalar_one_or_none()
        
        if not processed_resume:
            raise ResumeNotFoundError(
                f"Processed resume not found for resume_id: {resume_id}. "
                "Please ensure the resume has been processed first."
            )
        
        return processed_resume

    async def _get_processed_job(self, job_id: str) -> ProcessedJob:
        """
        Retrieve processed job from database.
        
        Args:
            job_id: Job identifier
            
        Returns:
            ProcessedJob model instance
            
        Raises:
            JobNotFoundError: If job is not found or not processed
        """
        result = await self.db.execute(
            select(ProcessedJob).where(ProcessedJob.job_id == job_id)
        )
        processed_job = result.scalar_one_or_none()
        
        if not processed_job:
            raise JobNotFoundError(
                f"Processed job not found for job_id: {job_id}. "
                "Please ensure the job has been processed first."
            )
        
        return processed_job

    async def generate_learning_schedule(
        self,
        request: LearningScheduleRequest
    ) -> LearningScheduleModel:
        """
        Generate a personalized learning schedule based on resume and job analysis.
        
        Args:
            request: Learning schedule request with resume_id, job_id, and preferences
            
        Returns:
            LearningScheduleModel with complete learning plan
            
        Raises:
            ResumeNotFoundError: If processed resume not found
            JobNotFoundError: If processed job not found
            LearningScheduleGenerationError: If schedule generation fails
        """
        try:
            # Fetch processed data
            processed_resume = await self._get_processed_resume(request.resumeId)
            processed_job = await self._get_processed_job(request.jobId)
            
            # Extract keywords
            resume_keywords = processed_resume.extracted_keywords or []
            job_keywords = processed_job.extracted_keywords or []
            
            # Prepare resume and job data as JSON strings
            resume_data = {
                "personal_data": processed_resume.personal_data,
                "experiences": processed_resume.experiences,
                "projects": processed_resume.projects,
                "skills": processed_resume.skills,
                "education": processed_resume.education,
            }
            
            job_data = {
                "job_title": processed_job.job_title,
                "company_profile": processed_job.company_profile,
                "key_responsibilities": processed_job.key_responsibilities,
                "qualifications": processed_job.qualifications,
                "compensation_and_benefits": processed_job.compensation_and_benfits,
            }
            
            # Format keywords as bullet lists
            resume_keywords_text = "\n".join([f"- {kw}" for kw in resume_keywords])
            job_keywords_text = "\n".join([f"- {kw}" for kw in job_keywords])
            
            # Get prompt and schema
            prompt_template = prompt_factory.get("learning_schedule")
            json_schema = json_schema_factory.get("learning_schedule")
            
            # Format prompt
            formatted_prompt = prompt_template.format(
                schedule_type=request.scheduleType.value,
                duration_weeks=request.durationWeeks,
                processed_resume_json=json.dumps(resume_data, indent=2),
                processed_job_json=json.dumps(job_data, indent=2),
                resume_keywords=resume_keywords_text,
                job_keywords=job_keywords_text,
            )
            
            logger.info(
                f"Generating learning schedule for resume_id={request.resumeId}, "
                f"job_id={request.jobId}, type={request.scheduleType.value}"
            )
            
            # Generate schedule using AI
            for attempt in range(self.max_retries):
                try:
                    raw_output = await self.agent_manager.run(prompt=formatted_prompt)
                    
                    # Log the raw output for debugging
                    logger.info(f"Raw AI output type: {type(raw_output)}")
                    logger.info(f"Raw AI output: {json.dumps(raw_output, indent=2)[:500]}...")
                    
                    # Unwrap if the response is wrapped in a root key
                    if isinstance(raw_output, dict) and 'learning_schedule' in raw_output:
                        raw_output = raw_output['learning_schedule']
                    
                    # If raw_output is a list, it means the AI returned just the schedule array
                    # We need to construct the full structure
                    if isinstance(raw_output, list):
                        logger.warning("AI returned a list instead of full schedule object, skipping this attempt")
                        if attempt == self.max_retries - 1:
                            raise LearningScheduleGenerationError(
                                f"AI consistently returns invalid format (list instead of object). "
                                "Please check the prompt and JSON schema."
                            )
                        continue
                    
                    # Validate the output with Pydantic
                    learning_schedule = LearningScheduleModel.model_validate(raw_output)
                    
                    logger.info(
                        f"Successfully generated learning schedule for resume_id={request.resumeId}"
                    )
                    
                    return learning_schedule
                    
                except ValidationError as e:
                    logger.warning(
                        f"Validation error on attempt {attempt + 1}/{self.max_retries}: {e}"
                    )
                    if attempt == self.max_retries - 1:
                        raise LearningScheduleGenerationError(
                            f"Failed to generate valid learning schedule after {self.max_retries} attempts. "
                            f"Validation error: {str(e)}"
                        )
                        
                except Exception as e:
                    logger.warning(
                        f"Generation error on attempt {attempt + 1}/{self.max_retries}: {e}"
                    )
                    if attempt == self.max_retries - 1:
                        raise
            
            raise LearningScheduleGenerationError(
                "Failed to generate learning schedule after maximum retries"
            )
            
        except (ResumeNotFoundError, JobNotFoundError) as e:
            logger.error(f"Data not found error: {e}")
            raise
            
        except LearningScheduleGenerationError as e:
            logger.error(f"Schedule generation error: {e}")
            raise
            
        except Exception as e:
            logger.error(f"Unexpected error generating learning schedule: {e}", exc_info=True)
            raise LearningScheduleGenerationError(
                f"Unexpected error during schedule generation: {str(e)}"
            )
