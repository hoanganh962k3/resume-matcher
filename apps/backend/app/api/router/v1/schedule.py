import logging
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, HTTPException, Depends, Request, status

from app.core import get_db_session
from app.services import (
    LearningScheduleService,
    ResumeNotFoundError,
    JobNotFoundError,
    LearningScheduleGenerationError,
)
from app.schemas.pydantic import (
    LearningScheduleRequest,
    LearningScheduleModel,
)

schedule_router = APIRouter()
logger = logging.getLogger(__name__)


@schedule_router.post(
    "/generate",
    response_model=LearningScheduleModel,
    summary="Generate personalized learning schedule for job seeker",
    description=(
        "Analyzes skill gaps between a processed resume and job requirements, "
        "then generates a structured learning plan with activities, resources, and milestones. "
        "Supports both weekly and monthly schedule formats."
    ),
)
async def generate_learning_schedule(
    request: Request,
    schedule_request: LearningScheduleRequest,
    db: AsyncSession = Depends(get_db_session),
) -> LearningScheduleModel:
    """
    Generate a personalized learning schedule for a job seeker.

    Args:
        request: FastAPI request object
        schedule_request: Learning schedule request containing resume_id, job_id, and preferences
        db: Database session

    Returns:
        LearningScheduleModel: Complete learning plan with schedule, activities, and recommendations

    Raises:
        HTTPException 404: If processed resume or job not found
        HTTPException 500: If schedule generation fails
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))

    try:
        logger.info(
            f"[{request_id}] Generating learning schedule for resume_id={schedule_request.resumeId}, "
            f"job_id={schedule_request.jobId}, type={schedule_request.scheduleType.value}"
        )

        # Initialize service
        schedule_service = LearningScheduleService(db)

        # Generate schedule
        learning_schedule = await schedule_service.generate_learning_schedule(
            schedule_request
        )

        logger.info(
            f"[{request_id}] Successfully generated learning schedule "
            f"with {len(learning_schedule.schedule)} periods"
        )

        return learning_schedule

    except ResumeNotFoundError as e:
        logger.error(f"[{request_id}] Resume not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except JobNotFoundError as e:
        logger.error(f"[{request_id}] Job not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except LearningScheduleGenerationError as e:
        logger.error(f"[{request_id}] Schedule generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning schedule: {str(e)}",
        )

    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error generating learning schedule: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the learning schedule.",
        )
