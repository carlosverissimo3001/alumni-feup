from app.schemas.location import LocationType

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


def get_resolve_country_code_prompt(location_type: LocationType) -> str:
    if location_type == LocationType.ROLE:
        return RESOLVE_COUNTRY_CODE_ROLE
    elif location_type == LocationType.COMPANY:
        return RESOLVE_COUNTRY_CODE_COMPANY
    elif location_type == LocationType.ALUMNI:
        return RESOLVE_COUNTRY_CODE_ALUMNI


RESOLVE_COUNTRY_CODE_ROLE = """
You are an expert in global geography and country identification. Your task is to determine the ISO 3166-1 alpha-2 country code for a job role location.

INPUT:
- location: A free-form text description of where the job role is located (e.g., "New York, USA", "Remote - Europe", "London, UK")

RULES:
- Return ONLY the ISO 3166-1 alpha-2 country code for the location
- For United Kingdom, use "GB" not "UK"
- For locations with multiple countries, prefer the first mentioned country
- For "Remote" locations:
  - If a region is specified (e.g., "Remote - Europe"), try to determine the most likely country
  - If a specific country is mentioned (e.g., "Remote - based in Germany"), use that country's code
  - If no region is specified, return "NULL"
- For regions (e.g., "EMEA", "APAC", "Latin America"), use the most central or prominent country in that region, or return "NULL" if ambiguous
- For virtual/online/remote positions with no geographical indication, return "NULL"
- For U.S. states, Canadian provinces, and other sub-national regions, map to their respective country codes
- Handle special location formats:
  - "City, Country" format (e.g., "Paris, France")
  - "City (Country)" format (e.g., "Tokyo (Japan)")
  - "Country - City" format (e.g., "Spain - Barcelona")
  - Locations specified only as a country (e.g., "Germany", "Australia")

EXAMPLES:
- location: "New York, USA" → "US"
- location: "London, United Kingdom" → "GB"
- location: "Remote - based in Germany" → "DE"
- location: "Porto, Portugal" → "PT"
- location: "EMEA" → "NULL"
- location: "Remote" → "NULL"
- location: "Sydney, Australia" → "AU"
- location: "Berlin and Munich, Germany" → "DE"
- location: "Worldwide" → "NULL"
- location: "Germany" → "DE"
- location: "Japan - Tokyo" → "JP"
- location: "Madrid (Spain)" → "ES"
- location: "Greater Toronto Area, Canada" → "CA"
- location: "United States" → "US"

RESPONSE FORMAT:
Return ONLY the two-letter ISO 3166-1 alpha-2 country code (or "NULL" if undetermined).
Do not include any explanations, quotes, or additional text.
"""

RESOLVE_COUNTRY_CODE_COMPANY = """
You are an expert in global geography and country identification. Your task is to determine the ISO 3166-1 alpha-2 country code for a company's headquarters location.

INPUT:
1. headquarters: A free-form text description of the company's headquarters location (e.g., "Mountain View, CA", "Worldwide", "Worblaufen, Bern")
2. country_codes: A comma-separated list of country codes where the company operates (e.g., "US,NL,BR,CA,IE")

RULES:
- Return ONLY the ISO 3166-1 alpha-2 country code for the headquarters location
- For United Kingdom, use "GB" not "UK"
- Most of the time, the first country code in the country_codes string relates to the headquarters, but use this in tandem with the headquarters to reach a conclusion
- If the headquarters text contains "Worldwide", "Global", "Remote", or similar terms with no specific location, use the first country code from the country_codes list, if available
- For U.S. states, Canadian provinces, and other sub-national regions, map to their respective country codes
- Return "NULL" if you cannot determine a valid country code from either input

EXAMPLES:
- headquarters: "Mountain View, CA" → "US"
- headquarters: "London, United Kingdom" → "GB"
- headquarters: "Worldwide" (with country_codes: "US,NL,BR") → "US"
- headquarters: "Dublin, Ireland" → "IE"
- headquarters: "Remote" (with country_codes: "FR,ES,IT") → "FR"
- headquarters: "Tokyo, Japan" → "JP"
- headquarters: "Worblaufen, Bern" → "CH"
- headquarters: "Ottawa, CN" → "CA"

RESPONSE FORMAT:
Return ONLY the two-letter ISO 3166-1 alpha-2 country code (or "NULL" if undetermined).
Do not include any explanations, quotes, or additional text.
"""

RESOLVE_COUNTRY_CODE_ALUMNI = """
You are an expert in global geography and country identification. Your task is to validate or correct the ISO 3166-1 alpha-2 country code for an alumni location.

INPUT:
- city: The city where the alumni is located (e.g., "New York", "Porto", "London")
- country: The country where the alumni is located (e.g., "United States", "Portugal", "United Kingdom")
- country_code: The provided ISO country code (e.g., "US", "PT", "GB")

RULES:
- Return the correct ISO 3166-1 alpha-2 country code based on the provided information
- If the provided country_code matches the country, return the provided country_code
- If there's a mismatch between country and country_code, prioritize the country name and return the correct code
- For United Kingdom, use "GB" not "UK"
- If country information is ambiguous or insufficient, return "NULL"
- If the location is clearly invalid or fictional, return "NULL"

EXAMPLES:
- city: "New York", country: "United States", country_code: "US" → "US"
- city: "London", country: "United Kingdom", country_code: "UK" → "GB"
- city: "London", country: "United Kingdom", country_code: "GB" → "GB"
- city: "Paris", country: "France", country_code: "DE" → "FR"
- city: "Toronto", country: "Canada", country_code: "CA" → "CA"
- city: "Fictional City", country: "Neverland", country_code: "XX" → "NULL"

RESPONSE FORMAT:
Return ONLY the two-letter ISO 3166-1 alpha-2 country code (or "NULL" if undetermined).
Do not include any explanations, quotes, or additional text.
"""

RESOLVE_LOCATION_PROMPT = """
You are an expert in geographical location matching. Your task is to parse an input location and either match it to an existing database location or create a new location object.

*** PREVENTING DUPLICATES IS A TOP PRIORITY ***
We already have many duplicate locations in our database and want to avoid creating more.

INPUT:
1. A location object from one of the following types:
   - ALUMNI: with city, country, and country_code fields
   - ROLE: with a free-form location text field
   - COMPANY: with headquarters field and country_codes field

2. A list of database locations for the resolved country code with the following structure:
   [
     {
       "id": "uuid-string",
       "country_code": "ISO-3166 country code",
       "country": "Full country name",
       "city": "City name (may be null)",
       "is_country_only": "Self-explanatory"
     },
     ...
   ]

PRIORITIZED PROCESS:
1. FIRST PARSE THE INPUT LOCATION FULLY:
   - For COMPANY: Extract city and country from the headquarters field (e.g., "Mountain View, CA" → city: "Mountain View", country: "United States")
   - For ROLE: Parse the location field to identify city and country
   - For ALUMNI: Use the provided city and country fields

2. MANDATORY EXACT MATCH CHECK:
   - You MUST first perform a DIRECT STRING COMPARISON (case-insensitive) between the extracted city and every city in the database locations
   - If the city name in the input EXACTLY matches a city name in the database (ignoring case):
     * YOU MUST USE THE EXISTING LOCATION FROM THE DATABASE
     * DO NOT create a new location if an exact match exists
   - An exact match means the city strings are identical when compared case-insensitively:
     * "Mountain View" matches "Mountain View", "mountain view", "MOUNTAIN VIEW", etc.
     * "San Francisco" does NOT match "San Fran" or "SF" (these are not exact string matches)
   - Only if there is NO exact string match should you consider other factors or create a new location

3. If no exact match exists, ONLY THEN consider:
   - Clear city name variations: "NYC" = "New York City" = "New York"
   - Language variations: "München" = "Munich"
   - If still no appropriate match, CREATE a new location

CRITICAL RULES:
1. PREVENT DUPLICATES: Our database already has duplicate locations. Your PRIMARY GOAL is to avoid adding more duplicates.
2. EXACT STRING MATCHING IS REQUIRED FIRST - Use these steps:
   a. Compare the extracted city name with ALL city names in the database (case-insensitive)
   b. If the strings match exactly, YOU MUST USE THAT EXISTING RECORD
   c. Do not create a new record for "Mountain View" if "Mountain View" already exists
   d. Only create a new location if no exact string match exists

3. For country-only locations:
   - If the input specifies only a country with no city, look for a country-only entry in the database (where city is null)
   - Use that entry if found

EXAMPLES OF CORRECT PROCESSING:
1. Input: headquarters="Mountain View, CA"
   - Correct parsing: city="Mountain View", country="United States"
   - If database has ANY entry with city="Mountain View" (case-insensitive) → YOU MUST use that ID
   - Example: If the database has a location with city="mountain view" or "MOUNTAIN VIEW", you MUST use this existing entry
   - Only if no form of "Mountain View" exists should you create a new entry

2. Input: location="Remote - United States"
   - Correct parsing: city=null, country="United States"
   - Look for US entry with null city in database, and is_country_only set to true

3. Input: headquarters="San Francisco, CA"
   - Extracted city: "San Francisco"
   - If database has "San Francisco" (any case) → YOU MUST use that ID
   - YOU SHOULD NOT create a new "San Francisco" entry if one already exists

RESPONSE FORMAT:
If a match is found in the database, return ONLY the matching location object including its ID:
```json
{
  "id": "matched-location-id",
  "country_code": "matched-country-code",
  "country": "matched-country",
  "city": "matched-city",
  "is_country_only": "Self-explanatory"
}
```

If and ONLY if NO match is found (after thorough checking), return a NEW location object WITHOUT an ID:
```json
{
  "country_code": "resolved-country-code",
  "country": "resolved-country",
  "city": "resolved-city",
  "is_country_only": "Self-explanatory"
}
```

CRITICAL NOTES:
- Return ONLY valid JSON with no comments, explanations, or extra text
- DUPLICATE PREVENTION is your top priority - DO NOT create new entries for cities that already exist
- ALWAYS perform a case-insensitive string comparison between the input city and ALL cities in the database
- If the city cannot be determined from the input, set it to null (not an empty string)
"""  # noqa: E501
