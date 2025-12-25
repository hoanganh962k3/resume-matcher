from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class ScheduleType(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class ActivityType(str, Enum):
    COURSE = "Course"
    TUTORIAL = "Tutorial"
    PRACTICE_PROJECT = "Practice Project"
    READING = "Reading"
    CERTIFICATION = "Certification"
    HANDS_ON_PRACTICE = "Hands-on Practice"


class Priority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class ResourceType(str, Enum):
    PLATFORM = "Platform"
    DOCUMENTATION = "Documentation"
    BOOK = "Book"
    VIDEO = "Video"
    ARTICLE = "Article"


class Complexity(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class ResourceModel(BaseModel):
    name: str = Field(..., description="Resource name")
    type: ResourceType = Field(..., description="Type of resource")
    url: Optional[str] = Field(None, description="URL to the resource")


class ActivityModel(BaseModel):
    activityType: ActivityType = Field(..., description="Type of learning activity")
    title: str = Field(..., description="Activity title")
    description: str = Field(..., description="Detailed description of the activity")
    resources: List[ResourceModel] = Field(default_factory=list, description="List of resources for this activity")
    estimatedHours: int = Field(..., description="Estimated hours to complete", ge=1)
    priority: Priority = Field(..., description="Priority level of the activity")


class SchedulePeriodModel(BaseModel):
    period: str = Field(..., description="Time period (e.g., 'Week 1', 'Month 2')")
    focus: str = Field(..., description="Main focus area for this period")
    learningGoals: List[str] = Field(default_factory=list, description="Learning goals for this period")
    activities: List[ActivityModel] = Field(default_factory=list, description="Learning activities")
    milestones: List[str] = Field(default_factory=list, description="Milestones to achieve")


class OverviewModel(BaseModel):
    skillsToLearn: List[str] = Field(default_factory=list, description="New skills to acquire")
    skillsToImprove: List[str] = Field(default_factory=list, description="Existing skills to enhance")
    estimatedTimePerWeek: str = Field(..., description="Estimated weekly time commitment")


class CertificationModel(BaseModel):
    name: str = Field(..., description="Certification name")
    provider: str = Field(..., description="Certification provider")
    relevance: str = Field(..., description="Why this certification is relevant")
    estimatedTimeMonths: int = Field(..., description="Estimated months to complete", ge=1)


class ProjectRecommendationModel(BaseModel):
    title: str = Field(..., description="Project title")
    description: str = Field(..., description="Project description")
    skillsApplied: List[str] = Field(default_factory=list, description="Skills applied in this project")
    complexity: Complexity = Field(..., description="Project complexity level")


class RecommendationsModel(BaseModel):
    certifications: List[CertificationModel] = Field(default_factory=list, description="Recommended certifications")
    projects: List[ProjectRecommendationModel] = Field(default_factory=list, description="Recommended projects")
    networking: List[str] = Field(default_factory=list, description="Networking recommendations")


class ProgressTrackingModel(BaseModel):
    weeklyCheckpoints: List[str] = Field(default_factory=list, description="Weekly progress checkpoints")
    successMetrics: List[str] = Field(default_factory=list, description="Success measurement criteria")


class LearningScheduleModel(BaseModel):
    scheduleType: ScheduleType = Field(..., description="Type of schedule (weekly or monthly)")
    totalDurationWeeks: int = Field(..., description="Total duration in weeks", ge=1)
    overview: OverviewModel = Field(..., description="Overview of learning plan")
    schedule: List[SchedulePeriodModel] = Field(default_factory=list, description="Detailed schedule periods")
    recommendations: RecommendationsModel = Field(..., description="Additional recommendations")
    progressTracking: ProgressTrackingModel = Field(..., description="Progress tracking guidelines")

    class Config:
        json_schema_extra = {
            "example": {
                "scheduleType": "weekly",
                "totalDurationWeeks": 8,
                "overview": {
                    "skillsToLearn": ["React", "TypeScript", "REST APIs"],
                    "skillsToImprove": ["Python", "SQL"],
                    "estimatedTimePerWeek": "10-15 hours"
                },
                "schedule": [
                    {
                        "period": "Week 1",
                        "focus": "React Fundamentals",
                        "learningGoals": ["Understand React basics", "Build first component"],
                        "activities": [
                            {
                                "activityType": "Course",
                                "title": "React Basics Course",
                                "description": "Complete React fundamentals",
                                "resources": [
                                    {
                                        "name": "React Documentation",
                                        "type": "Documentation",
                                        "url": "https://react.dev"
                                    }
                                ],
                                "estimatedHours": 10,
                                "priority": "High"
                            }
                        ],
                        "milestones": ["Complete first React app"]
                    }
                ],
                "recommendations": {
                    "certifications": [],
                    "projects": [],
                    "networking": ["Join React developer communities"]
                },
                "progressTracking": {
                    "weeklyCheckpoints": ["Review completed activities"],
                    "successMetrics": ["Projects completed", "Skills mastered"]
                }
            }
        }


class LearningScheduleRequest(BaseModel):
    resumeId: str = Field(..., description="Resume ID to generate schedule for")
    jobId: str = Field(..., description="Job ID to compare against")
    scheduleType: ScheduleType = Field(
        default=ScheduleType.WEEKLY,
        description="Type of schedule to generate (weekly or monthly)"
    )
    durationWeeks: Optional[int] = Field(
        default=8,
        description="Total duration in weeks (default: 8 weeks)",
        ge=1,
        le=52
    )

    class Config:
        json_schema_extra = {
            "example": {
                "resumeId": "550e8400-e29b-41d4-a716-446655440000",
                "jobId": "660e8400-e29b-41d4-a716-446655440001",
                "scheduleType": "weekly",
                "durationWeeks": 8
            }
        }
