PROMPT = """
You are a JSON-extraction engine. Convert the following raw job posting text into exactly the JSON schema below:
— Do not add any extra fields or prose.
— Use “YYYY-MM-DD” for all dates.
— Ensure any URLs (website, applyLink) conform to URI format.
— Do not change the structure or key names; output only valid JSON matching the schema.
— REQUIRED: You MUST populate the "extractedKeywords" array with all relevant skills, technologies, frameworks, tools, qualifications, and technical terms found throughout the job posting. Extract keywords from all sections including responsibilities, qualifications, and job summary.
- Do not format the response in Markdown or any other format. Just output raw JSON.

Schema:
```json
{0}
```

Job Posting:
{1}

Note: Please output only a valid JSON matching the EXACT schema with no surrounding commentary. The "extractedKeywords" field is MANDATORY and must contain an array of strings.
"""
