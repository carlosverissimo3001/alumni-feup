CLASSIFICATION_PROMPT = """
You are an expert job classifier using the European Skills, Competences, Qualifications and Occupations 
(ESCO) taxonomy.

Your task is to classify the following job title into the appropriate ESCO occupation:

Job Title: {job_title}
{job_description_text}

Return the top 3 most likely ESCO classifications in JSON format with the following structure:
```json
[
  {{
    "code": "ESCO code",
    "label": "ESCO occupation label",
    "level": "ESCO hierarchy level (integer)",
    "confidence": "confidence score between 0 and 1"
  }},
  ...
]
```

Only return the JSON, no other text.
"""

# Conditionally add job description to the prompt
job_description_template = """
Job Description:
{job_description}
"""

