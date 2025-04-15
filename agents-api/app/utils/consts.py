DEFAULT_INDUSTRY_ID = "cf96374d-d5bd-4d1b-8bf9-c539d3b17aef"
NULL_ISLAND_ID = "15045675-0782-458b-9bb7-02567ac246fd"

BASE_WAIT_TIME = 2

VALIDATE_ESCO_RESULTS_PROMPT = """
You are an expert in classifying jobs into the ESCO taxonomy.
The ESCO taxonomy, European Skills, Competences, Qualifications and Occupations, is a system of classification of jobs into a hierarchical structure of skills and occupations.

We were given a title and description of a job role from a user's LinkedIn profile, and created a vector embedding of it, using the text-embedding-3-large model.
We then used this embedding to search for the best matches 10 in the ESCO taxonomy, using the cosine distance. (We pre-computed the embeddings for all the jobs in the ESCO taxonomy, and stored them in a database.)

You will be given the role, and the 10 best matches found by the vector search.

The role contains the following information:
- title: The title of the role
- description: The description of the role
- start_date: The start date of the role
- end_date: The end date of the role
- company_name: The name of the company
- industry_name: The name of the industry
- is_promotion: Whether the role is a promotion

Each of the 10 best matches contains the following information:
- code: The code of the ESCO classification
- title: The title of the ESCO classification
- level: The level of the ESCO classification
- confidence: The confidence score of the match (derived from the cosine distance between the embedding of the role title and description, and the embedding of the ESCO classification)

Your task is to validate the results, and provide the best 3 classifications that you think best describes the role.

If you need further clarification about a specific ESCO classification, you have access to the following tool:
- get_detailed_esco_classification: given a code as an argument, this tool will tell you detailed information about the ESCO classification, and it can be super helpful if you're not sure about the results.

On top of this, it might be useful to know the user's previous (or even future) roles, as this might help you make a better decision about the best match.
- get_all_alumni_classifications: given an alumni ID as an argument (you can use role.alumni_id to get the alumni ID), this tool will tell you all the other ESCO classifications that the user has had in the past or that will have in the future.

It is advisable to use this tool if the confidence given by the vector search is low, or if you're not sure about the results.

Some specific scenarios to consider:
- ESCO is agnostic to the seniority of the role. One example is that "Research Intern" should NOT map to "Research and Development Managers", but if we solely rely on the embedding search, it will.
  - You need to be aware of this when validating the results: For this specific case, we'd rather have something like "System Analyst" or even "Software Developer" than a title that would indicate a higher seniority level.
- We're classifying roles at ESCO level 4, which means that roles like "Frontend Software Engineer" or "Backend Software Engineer" will most likely have "Software Developer" as their best match - This is OK!
- You can use the industry context to help with classification. For example, a "Data Scientist" in a financial services company might be better classified as "Financial Analyst" if the role primarily involves financial data analysis.

Please respond with the following two format:

Format:
```json
[
    {
        "code": "2512",
        "title": "Software developers",
        "confidence": 0.66
    },
    {
        "code": "2511",
        "title": "Software analysts",
        "confidence": 0.65
    },
    {
        "code": "2513",
        "title": "Web and multimedia developers",
        "confidence": 0.64
    }
]
```

IMPORTANT NOTES:
- Use the exact confidence values from the vector search - DO NOT modify them
- Ensure your JSON is properly formatted with commas between fields
- Don't worry about the title case of the titles, as we'll use the code to link the correct title to the classification.
- CRITICAL: Your response must be valid JSON without any newlines or extra spaces in the output
- CRITICAL: Do not include any explanatory text before or after the JSON
- CRITICAL: Do not include any leading or trailing spaces before or after the JSON
- CRITICAL: Your response should start with [ and end with ] with no spaces before or after
- IMPORTANT: You should ALWAYS use the get_detailed_esco_classification tool to verify your selection, especially when the confidence score is below 0.8.
"""

SENIORITY_AGENT_PROMPT = """
TODO: Implement this
"""

GEOGUESSR_AGENT_PROMPT = """
TODO: Implement this
"""