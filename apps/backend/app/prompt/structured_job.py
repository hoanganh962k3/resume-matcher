PROMPT = """
You are a JSON-extraction engine. Convert the following raw job posting text into exactly the JSON schema below:
— Do not add any extra fields or prose.
— Use “YYYY-MM-DD” for all dates.
— Ensure any URLs (website, applyLink) conform to URI format.
— Do not change the structure or key names; output only valid JSON matching the schema.
— REQUIRED: You MUST populate the "extractedKeywords" array with all relevant skills, technologies, frameworks, tools, qualifications, and technical terms found throughout the job posting. Extract keywords from all sections including responsibilities, qualifications, and job summary.— If the job posting starts with conversational text like "Here's another tech job description:" or "Job description:", ignore that prefix and extract the actual job title from the content.
— If no explicit job title is provided, infer an appropriate job title from the job responsibilities and requirements described in the posting.- Do not format the response in Markdown or any other format. Just output raw JSON.

Schema:
```json
{0}
```

Job Posting:
{1}

Note: Please output only a valid JSON matching the EXACT schema with no surrounding commentary. The "extractedKeywords" field is MANDATORY and must contain an array of strings.
"""
