SCHEMA = {
    "scheduleType": "weekly | monthly",
    "totalDurationWeeks": "integer",
    "overview": {
        "skillsToLearn": [
            "string",
            "...",
        ],
        "skillsToImprove": [
            "string",
            "...",
        ],
        "estimatedTimePerWeek": "string",
    },
    "schedule": [
        {
            "period": "Week 1 | Month 1",
            "focus": "string",
            "learningGoals": [
                "string",
                "...",
            ],
            "activities": [
                {
                    "activityType": "Course | Tutorial | Practice Project | Reading | Certification | Hands-on Practice",
                    "title": "string",
                    "description": "string",
                    "resources": [
                        {
                            "name": "string",
                            "type": "Platform | Documentation | Book | Video | Article",
                            "url": "Optional[string]",
                        },
                    ],
                    "estimatedHours": "integer",
                    "priority": "High | Medium | Low",
                },
            ],
            "milestones": [
                "string",
                "...",
            ],
        },
    ],
    "recommendations": {
        "certifications": [
            {
                "name": "string",
                "provider": "string",
                "relevance": "string",
                "estimatedTimeMonths": "integer",
            },
        ],
        "projects": [
            {
                "title": "string",
                "description": "string",
                "skillsApplied": [
                    "string",
                    "...",
                ],
                "complexity": "Beginner | Intermediate | Advanced",
            },
        ],
        "networking": [
            "string",
            "...",
        ],
    },
    "progressTracking": {
        "weeklyCheckpoints": [
            "string",
            "...",
        ],
        "successMetrics": [
            "string",
            "...",
        ],
    },
}
