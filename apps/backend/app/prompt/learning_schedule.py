PROMPT = """
You are an expert career coach and learning strategist. Generate a complete learning schedule JSON object.

CRITICAL: Your response must be a JSON object with these exact top-level fields:
- scheduleType
- totalDurationWeeks
- overview
- schedule
- recommendations
- progressTracking

DO NOT return just an array. DO NOT wrap in extra keys. Return the JSON object directly.

STRICT VALIDATION RULES:
1. activityType MUST be EXACTLY one of: "Course", "Tutorial", "Practice Project", "Reading", "Certification", "Hands-on Practice"
2. priority MUST be EXACTLY one of: "High", "Medium", "Low"
3. resourceType MUST be EXACTLY one of: "Platform", "Documentation", "Book", "Video", "Article"
4. complexity MUST be EXACTLY one of: "Beginner", "Intermediate", "Advanced"
5. scheduleType MUST be EXACTLY: "{schedule_type}"
6. All field names must match exactly (case-sensitive): activityType, estimatedHours, learningGoals, etc.

Required JSON Structure:
{{
  "scheduleType": "{schedule_type}",
  "totalDurationWeeks": {duration_weeks},
  "overview": {{
    "skillsToLearn": ["skill1", "skill2"],
    "skillsToImprove": ["skill3"],
    "estimatedTimePerWeek": "10-15 hours"
  }},
  "schedule": [
    {{
      "period": "Week 1",
      "focus": "Focus area",
      "learningGoals": ["goal1"],
      "activities": [
        {{
          "activityType": "Course",
          "title": "Activity title",
          "description": "Description",
          "resources": [{{"name": "Resource name", "type": "Platform", "url": "https://..."}}],
          "estimatedHours": 5,
          "priority": "High"
        }},
        {{
          "activityType": "Practice Project",
          "title": "Build a sample project",
          "description": "Apply learned skills",
          "resources": [{{"name": "GitHub", "type": "Platform", "url": "https://github.com"}}],
          "estimatedHours": 8,
          "priority": "High"
        }}
      ],
      "milestones": ["milestone1"]
    }}
  ],
  "recommendations": {{
    "certifications": [{{"name": "Cert name", "provider": "Provider", "relevance": "Why relevant", "estimatedTimeMonths": 2}}],
    "projects": [{{"title": "Project", "description": "Desc", "skillsApplied": ["skill"], "complexity": "Intermediate"}}],
    "networking": ["Join communities"]
  }},
  "progressTracking": {{
    "weeklyCheckpoints": ["checkpoint1"],
    "successMetrics": ["metric1"]
  }}
}}

Context:
- The candidate has submitted their resume with their current skills and experience
- They are targeting a specific job that requires certain qualifications
- You need to identify skill gaps and create a structured learning plan

Instructions:
1. Analyze the Skill Gap:
   - Compare the candidate's current skills (from their resume) with the job requirements
   - Identify skills that are completely missing (skillsToLearn)
   - Identify skills they have but need to strengthen (skillsToImprove)
   - Prioritize skills based on job requirements importance

2. Create a {schedule_type} Learning Schedule:
   - Duration: {duration_weeks} weeks total
   - Structure: Break down into {schedule_type} periods
     * For weekly schedules: Use "Week 1", "Week 2", etc. for each week
     * For monthly schedules: Use "Month 1", "Month 2", etc. (group weeks into months: ~4 weeks per month)
   - Each period should have:
     * A clear focus area (1-2 main skills or concepts)
     * Specific, measurable learning goals
     * 3-5 concrete activities with estimated hours
     * Realistic milestones to achieve

3. Activity Guidelines:
   - activityType must be one of these EXACT values only:
     * "Course" - for online courses or structured learning programs
     * "Tutorial" - for guided tutorials or workshops
     * "Practice Project" - for building projects to apply skills
     * "Reading" - for documentation, books, or articles
     * "Certification" - for certification exam preparation
     * "Hands-on Practice" - for coding exercises or hands-on labs
   - Mix different activity types for variety
   - Provide specific, actionable resources (real platforms, documentation, tools)
   - Include estimated hours that total to a realistic weekly commitment (10-20 hours/week)
   - priority must be exactly: "High", "Medium", or "Low"
   - Prioritize activities based on importance and dependencies
   - Start with fundamentals before advanced topics
   - Include hands-on practice for each skill

4. Recommendations:
   - Suggest relevant certifications that would strengthen the application
   - Propose 2-3 portfolio projects that demonstrate the required skills
   - Include networking strategies (communities, events, LinkedIn groups)

5. Progress Tracking:
   - Define weekly checkpoints to measure progress
   - Provide clear success metrics (e.g., "Complete 3 React projects", "Pass TypeScript certification")

Important Constraints:
- Base recommendations on real, accessible resources (Coursera, Udemy, official documentation, YouTube, etc.)
- Ensure the schedule is realistic and achievable within the given timeframe
- Prioritize skills that are explicitly mentioned in the job requirements
- Consider the candidate's current skill level when setting learning pace
- Make sure activities build on each other progressively
- Estimate 10-20 hours per week of learning time
- For weekly schedules: create detailed week-by-week breakdown (period: "Week 1", "Week 2", etc.)
- For monthly schedules: create high-level month-by-month breakdown (period: "Month 1", "Month 2", etc.) with broader learning goals and more flexible activities

Output Format:
- ONLY output valid JSON matching the provided schema
- Do NOT include any explanations, commentary, or markdown formatting
- Ensure all arrays have at least one item (no empty arrays for critical fields)
- Use realistic time estimates and specific resource names

Processed Resume Data:
```json
{processed_resume_json}
```

Processed Job Data:
```json
{processed_job_json}
```

Resume Keywords:
{resume_keywords}

Job Keywords:
{job_keywords}

Schedule Type: {schedule_type}
Duration: {duration_weeks} weeks

Now generate the personalized learning schedule as valid JSON.
"""
