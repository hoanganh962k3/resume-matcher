import logging
import traceback

from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, HTTPException, Depends, Request, status, Query
from fastapi.responses import JSONResponse

from app.core import get_db_session
from app.core.auth_dependencies import get_current_user_optional, get_current_user_required
from app.models.user import User
from app.services import JobService, JobNotFoundError
from app.schemas.pydantic.job import JobUploadRequest

job_router = APIRouter()
logger = logging.getLogger(__name__)


@job_router.post(
    "/upload",
    summary="stores the job posting in the database by parsing the JD into a structured format JSON",
)
async def upload_job(
    payload: JobUploadRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Accepts a job description as a MarkDown text and stores it in the database.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))

    allowed_content_types = [
        "application/json",
    ]

    content_type = request.headers.get("content-type")
    if not content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content-Type header is missing",
        )

    if content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Content-Type. Only {', '.join(allowed_content_types)} is/are allowed.",
        )

    try:
        job_service = JobService(db)
        # Get user_id if user is authenticated, None for guest uploads
        user_id = str(current_user.id) if current_user else None
        job_ids = await job_service.create_and_store_job(payload.model_dump(), user_id=user_id)

    except AssertionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{str(e)}",
        )

    return {
        "message": "data successfully processed",
        "job_id": job_ids,
        "request": {
            "request_id": request_id,
            "payload": payload,
        },
    }


@job_router.get(
    "",
    summary="Get job data from both job and processed_job models",
)
async def get_job(
    request: Request,
    job_id: str = Query(..., description="Job ID to fetch data for"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Retrieves job data from both job_model and processed_job model by job_id.

    Args:
        job_id: The ID of the job to retrieve

    Returns:
        Combined data from both job and processed_job models

    Raises:
        HTTPException: If the job is not found or if there's an error fetching data.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        if not job_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="job_id is required",
            )

        job_service = JobService(db)
        job_data = await job_service.get_job_with_processed_data(
            job_id=job_id
        )
        
        if not job_data:
            raise JobNotFoundError(
                message=f"Job with id {job_id} not found"
            )

        return JSONResponse(
            content={
                "request_id": request_id,
                "data": job_data,
            },
            headers=headers,
        )
    
    except JobNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error fetching job: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching job data",
        )


@job_router.get(
    "/resume/{resume_id}",
    summary="Get all jobs associated with a specific resume",
)
async def get_jobs_for_resume(
    resume_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_required),
):
    """
    Retrieves all jobs with their processed data associated with a specific resume.

    Args:
        resume_id: The ID of the resume to fetch jobs for

    Returns:
        List of jobs with both raw and processed data

    Raises:
        HTTPException: If user is not authenticated or if there's an error fetching data.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        job_service = JobService(db)
        jobs = await job_service.get_jobs_for_resume(resume_id=resume_id, user_id=str(current_user.id))

        return JSONResponse(
            content={
                "request_id": request_id,
                "data": jobs,
            },
            headers=headers,
        )
    
    except Exception as e:
        logger.error(f"Error fetching jobs for resume: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching jobs for resume",
        )


@job_router.get(
    "/user/all",
    summary="Get all jobs associated with the current user",
)
async def get_all_jobs_for_user(
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_required),
):
    """
    Retrieves all jobs with their processed data associated with the current user,
    regardless of resume association.

    Returns:
        List of jobs with both raw and processed data

    Raises:
        HTTPException: If user is not authenticated or if there's an error fetching data.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        job_service = JobService(db)
        jobs = await job_service.get_all_jobs_for_user(user_id=str(current_user.id))

        return JSONResponse(
            content={
                "request_id": request_id,
                "data": jobs,
            },
            headers=headers,
        )
    
    except Exception as e:
        logger.error(f"Error fetching jobs for user: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching jobs for user",
        )
