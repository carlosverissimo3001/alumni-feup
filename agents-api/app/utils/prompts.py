from app.schemas.location import LocationType

VALIDATE_ESCO_CORE_PROMPT = """
You are an ESCO classification expert. Your task is to select the **3 best ESCO matches** for a given job role based on a list of candidate classifications.
The ESCO (European Skills, Competences, Qualifications and Occupations) is the EU’s multilingual classification system for occupations.
It maps job roles to standardized titles and concepts to support labor market analysis and skills matching across countries.

🎯 Your goal is to match the role to ESCO titles that are semantically correct, context-aware, and widely recognized.
---
🧠 First, explain your reasoning in 2 sentences. Also include why the first match (index 0) is the strongest choice among the three.

Consider:
- Why the top matches fit the job role
- Any mismatches you ignored (e.g., wrong seniority or domain)
- If no description is provided, explain how you relied on the title/context

🧪 If the title is vague or nonstandard (e.g., "Ninja Developer", "AI Wizard"), do your best to infer meaning using:
- Company or industry info
- Common role interpretations
- Related job keywords

---

📌 Then, call the `return_esco_choices` tool with:
- a `reasoning` field (string)
- a `results` field: list of 3 objects, each with:
    - `"id"` (UUID from the candidates)
    - `"title"` (exact match from candidate)
    - `"confidence"` (same float score, unchanged)

🧭 **Ranking Guidance**:  
Place the **best overall match** — the one that most accurately describes the job role — at the **top of the `results` list** (index 0). Order the remaining 2 by relevance.

🚫 Do NOT:
- Write raw JSON
- Add, remove, or alter fields
- Include explanations inside the `results` field

---

✅ Final Rules Recap:
- Select exactly 3 matches
- Use your judgment — discard candidates even with high confidence if they’re a poor fit
- Be context-aware: job title ≠ job description ≠ industry (they all matter)
"""

VALIDATE_ESCO_EXTRA_DETAILS = """
CHECKLIST OF COMMON MISTAKES:
❌ Do not include explanatory text or comments
❌ Do not modify confidence scores
❌ Do not use ESCO code as ID
❌ Do not add/remove fields or reformat the JSON

ALLOWED FIELDS:
✅ "id" – must match UUID from candidate list
✅ "title" – must be copied exactly
✅ "confidence" – float between 0 and 1, unchanged

REQUIREMENTS:
- Valid JSON array only
- No text before or after
- Must contain exactly 3 objects
- No extra whitespace, comments, or changes
"""


SENIORITY_CLASSIFICATION_PROMPT = """
You are an expert HR analyst. Your task is to classify each role into one of the following seniority levels:

- INTERN
- ENTRY_LEVEL
- ASSOCIATE
- MID_SENIOR_LEVEL
- DIRECTOR
- EXECUTIVE
- C_LEVEL

Each role includes: title, company, duration, ESCO classification, and optional description. You will also receive total experience and career timeline.

🎯 For each role:
- Use title indicators (e.g., "Intern", "Senior", "Director", etc.)
- Use career progression and years of experience
- Consider industry and company context
- Classify each role independently (e.g., multiple internships can all be INTERN)

🧠 Also include:
- Confidence (0.0–1.0)
- Reasoning: title, experience, company, and career position

📦 Then call the `return_seniority_choices` tool with:
```json
{
  "results": [
    {
      "role_id": "<role_id>",
      "seniority": "<SENIORITY_LEVEL>",
      "confidence": 0.9,
      "reasoning": "Clear senior title and 6 years of experience"
    }
  ]
}
"""

SENIORITY_CLASSIFICATION_PROMPT_EXTRA_DETAILS = """
🧪 CHECKLIST OF COMMON MISTAKES:
❌ Do not include text outside the JSON object
❌ Do not invent new fields or enums
❌ Do not classify based only on job duration
❌ Do not assume seniority without title/experience match

✅ REQUIRED FIELDS:
- "role_id": must exactly match the provided role ID
- "seniority": one of INTERN, ENTRY_LEVEL, ASSOCIATE, MID_SENIOR_LEVEL, DIRECTOR, EXECUTIVE, C_LEVEL
- "confidence": float between 0.0 and 1.0
- "reasoning": one-sentence justification

⚠️ ADDITIONAL GUIDELINES:
- All classifications must be independent
- Internships should always be INTERN, regardless of quantity
- Use conservative estimation when uncertain
- Do not promote based on job title alone without experience
- Ensure consistency with total experience and career stage

🎯 OUTPUT FORMAT:
Call `return_seniority_choices` with:
{
  "results": [
    {
      "role_id": "abc-123",
      "seniority": "ASSOCIATE",
      "confidence": 0.8,
      "reasoning": "Title is Software Engineer, with 3 years' experience"
    },
    ...
  ]
}
"""

def get_resolve_geo_prompt(location_type: LocationType) -> str:
    if location_type == LocationType.ROLE:
        return RESOLVE_GEO_ROLE
    elif location_type == LocationType.COMPANY:
        return RESOLVE_GEO_COMPANY
    elif location_type == LocationType.ALUMNI:
        return RESOLVE_GEO_ALUMNI


RESOLVE_GEO_ROLE = """
You are a global geography and geolocation expert. Your task is to resolve a job role location into a standardized city and its ISO 3166-1 alpha-2 country code.

INPUTS:
- location: A free-text location description (e.g., "New York, USA", "Remote - Europe", "Parque das Nações, Lisbon")

TASK:
- Extract a valid city name (standardized) and the corresponding two-letter ISO country code.
- Always prioritize matching known cities/towns from the provided countries.
- Cross-check ambiguous regions or provinces (e.g., states or cantons) to their correct countries.
- NEVER guess or hallucinate a city. If unsure, set `"city": "null"`.
- If you cannot determine a valid country from the inputs, set `"country_code": "null"`.

SPECIAL CASES:
- If the location indicates remote work (e.g., "Remote", "Remote - Lisbon", "All over the world", "Worldwide", "Global", "Work from anywhere"), return `"country_code": "REMOTE"` and `"city": "null"`.
- If the location mentions a neighborhood or district of a known city, resolve to the main city:
  - "Parque das Nações, Lisbon" → "Lisboa" 
  - "Stadtkreis 8 Riesbach, Zurich" → "Zurich"
  - "Manhattan, NY" → "New York"
- Use "GB" for United Kingdom, not "UK".
- For US/Canada sub-national regions, map to "US" or "CA".
- For Swiss cantons, map to "CH".

CITY NAME STANDARDIZATION:
- Use English names for all cities, except:
  - For Portugal, use local city names:
    - Lisboa (not Lisbon)
    - Porto (not Oporto)
- Do not fabricate or substitute city names.

RESPONSE FORMAT:
Return only a JSON object with:
- "city": the city name or "null"
- "country_code": the ISO code or "null" or "REMOTE" for remote work

EXAMPLES:
- "New York, USA" → {"city": "New York", "country_code": "US"}
- "London, United Kingdom" → {"city": "London", "country_code": "GB"}
- "Remote - based in Germany" → {"city": "null", "country_code": "REMOTE"}
- "Remote" → {"city": "null", "country_code": "REMOTE"}
- "All over the world" → {"city": "null", "country_code": "REMOTE"}
- "Work from anywhere" → {"city": "null", "country_code": "REMOTE"}
- "Porto, Portugal" → {"city": "Porto", "country_code": "PT"}
- "Oporto, Portugal" → {"city": "Porto", "country_code": "PT"}
- "Lisbon, Portugal" → {"city": "Lisboa", "country_code": "PT"}
- "Parque das Nações, Lisboa" → {"city": "Lisboa", "country_code": "PT"}
- "Alcântara, Lisbon" → {"city": "Lisboa", "country_code": "PT"}
- "Munich, Germany" → {"city": "Munich", "country_code": "DE"}
- "München, Germany" → {"city": "Munich", "country_code": "DE"}
- "EMEA" → {"city": "null", "country_code": "null"}
- "Remote - Lisbon" → {"city": "null", "country_code": "REMOTE"}

IMPORTANT:
- Do not include markdown syntax or explanations.
- Do not invent city names.
- If no location can be resolved, return: {"city": "null", "country_code": "null"}
- Always return a valid JSON object, DO NOT include any other text or comments, neither before nor after the JSON object.
- Do NOT include markdown code block syntax like ```json or ``` around your response - just return the raw JSON object.
"""

RESOLVE_GEO_COMPANY = """
You are a global geography and geolocation expert. Your task is to resolve a company's headquarters location into a standardized city and its ISO 3166-1 alpha-2 country code.

INPUTS:
1. headquarters: A free-text location (e.g., "Mountain View, CA", "Remote", "Beira Litoral, Portugal")
2. country_codes: A comma-separated list of valid ISO country codes where the company operates (e.g., "US,NL,BR,CA,IE")

TASK:
- Extract a valid city name (standardized) and the corresponding two-letter ISO country code.
- Always prioritize matching known cities/towns from the provided countries.
- Cross-check ambiguous regions or provinces (e.g., states or cantons) to their correct countries.
- NEVER guess or hallucinate a city. If unsure, set `"city": "null"`.
- If you cannot determine a valid country from the inputs, set `"country_code": "null"`.

SPECIAL CASES:
- If the headquarters contains "Remote", "Worldwide", or "Global", use the **first country in country_codes**, and `"city": "null"`.
- Use "GB" for United Kingdom, not "UK".
- For US/Canada sub-national regions, map to "US" or "CA".
- For Swiss cantons, map to "CH".
- If a location refers to a district or neighborhood of a known city (e.g., "Stadtkreis 8 Riesbach, Zurich"), resolve to the main city ("Zurich").

CITY NAME STANDARDIZATION:
- Use English names for all cities, except:
  - For Portugal, use local city names:
    - Lisboa (not Lisbon)
    - Porto (not Oporto)
- Do not fabricate or substitute city names.

RESPONSE FORMAT:
Return only a JSON object with:
- "city": the city name or "null"
- "country_code": the ISO code or "null"

EXAMPLES:
- "Mountain View, CA" → {"city": "Mountain View", "country_code": "US"}
- "Lisbon, Portugal" → {"city": "Lisboa", "country_code": "PT"}
- "Beira Litoral, Portugal" → {"city": "null", "country_code": "PT"}
- "Remote", country_codes: "DE,ES" → {"city": "null", "country_code": "DE"}
- "Stadtkreis 8 Riesbach, Zurich" → {"city": "Zurich", "country_code": "CH"}

IMPORTANT:
- Do not include markdown syntax or explanations.
- Do not invent city names.
- If no location can be resolved, return: {"city": "null", "country_code": "null"}
- Always return a valid JSON object, DO NOT include any other text or comments, neither before nor after the JSON object.
- Do NOT include markdown code block syntax like ```json or ``` around your response - just return the raw JSON object.
"""

RESOLVE_GEO_ALUMNI = """
You are a global geography and geolocation expert. Your task is to validate or correct an alumni location into a standardized city and its ISO 3166-1 alpha-2 country code.

INPUTS:
- city: The city where the alumni is located (e.g., "New York", "Porto", "Parque das Nações")
- country: The country where the alumni is located (e.g., "United States", "Portugal", "United Kingdom")
- country_code: The provided ISO country code (e.g., "US", "PT", "GB")

TASK:
- Validate and correct the provided city name and country code.
- If the provided country_code matches the country, use it; otherwise, fix it.
- NEVER guess or hallucinate a city. If unsure, set `"city": "null"`.
- If country information is clearly invalid or fictional, set `"country_code": "null"`.

SPECIAL CASES:
- If the city mentions a neighborhood or district of a known city, resolve to the main city:
  - "Parque das Nações" in Portugal → "Lisboa" 
  - "Stadtkreis 8 Riesbach" in Switzerland → "Zurich"
  - "Manhattan" in US → "New York"
- Use "GB" for United Kingdom, not "UK".

CITY NAME STANDARDIZATION:
- Use English names for all cities, except:
  - For Portugal, use local city names:
    - Lisboa (not Lisbon)
    - Porto (not Oporto)
- Do not fabricate or substitute city names.

RESPONSE FORMAT:
Return only a JSON object with:
- "city": the city name or "null"
- "country_code": the ISO code or "null"

EXAMPLES:
- city: "New York", country: "United States", country_code: "US" → {"city": "New York", "country_code": "US"}
- city: "London", country: "United Kingdom", country_code: "UK" → {"city": "London", "country_code": "GB"}
- city: "Paris", country: "France", country_code: "DE" → {"city": "Paris", "country_code": "FR"}
- city: "Porto", country: "Portugal", country_code: "PT" → {"city": "Porto", "country_code": "PT"}
- city: "Oporto", country: "Portugal", country_code: "PT" → {"city": "Porto", "country_code": "PT"}
- city: "Lisbon", country: "Portugal", country_code: "PT" → {"city": "Lisboa", "country_code": "PT"}
- city: "Parque das Nações", country: "Portugal", country_code: "PT" → {"city": "Lisboa", "country_code": "PT"}
- city: "Alcântara", country: "Portugal", country_code: "PT" → {"city": "Lisboa", "country_code": "PT"}
- city: "München", country: "Germany", country_code: "DE" → {"city": "Munich", "country_code": "DE"}
- city: "Fictional City", country: "Neverland", country_code: "XX" → {"city": "null", "country_code": "null"}

IMPORTANT:
- Do not include markdown syntax or explanations.
- Do not invent city names.
- If no location can be resolved, return: {"city": "null", "country_code": "null"}
- Always return a valid JSON object, DO NOT include any other text or comments, neither before nor after the JSON object.
- Do NOT include markdown code block syntax like ```json or ``` around your response - just return the raw JSON object.
"""

RESOLVE_LOCATION_PROMPT = """You are an expert in geographical location matching. Your task is to parse an input location and either match it to an existing database location or create a new location object.

STEP-BY-STEP RESOLUTION PROCESS:

1. PARSE INPUT LOCATION
-------------------------
Extract city and country from the input based on type:
- ALUMNI: Use provided city and country fields directly
- ROLE: Parse free-form text (e.g., "Remote - San Francisco, CA" → "San Francisco", "United States")
- COMPANY: Parse headquarters field (e.g., "Mountain View, CA" → "Mountain View", "United States")

2. STANDARDIZE LOCATION DATA
----------------------------
- Normalize city names (remove extra spaces, fix capitalization)
- Convert country abbreviations to full names (CA → United States, UK → United Kingdom)
- Handle common location formats:
  • "City, State" → extract city, infer country from state
  • "City, Country" → extract both directly
  • "State/Province only" → treat as country-level location
  • "Remote" or "Worldwide" → skip city, use country if available

3. MATCH AGAINST DATABASE
-------------------------
- Perform EXACT case-insensitive string matching first
- If no exact match, check acceptable variations
- If no match found, prepare new location object

CRITICAL MATCHING RULES
=======================

EXACT MATCHING (Case-Insensitive):
---------------------------------
• "Mountain View" = "mountain view" = "MOUNTAIN VIEW" ✓
• "San Francisco" = "san francisco" = "San Francisco" ✓
• "New York" = "new york" = "NEW YORK" ✓

ACCEPTABLE VARIATIONS (Only if exact match fails):
-----------------------------------------------
Common Abbreviations:
• "NYC" = "New York City" = "New York"
• "SF" = "San Francisco"
• "LA" = "Los Angeles"
• "DC" = "Washington D.C." = "Washington"

International Names:
• "München" = "Munich"
• "Lisboa" = "Lisbon"
• "Roma" = "Rome"
• "Moskva" = "Moscow"
• "Praha" = "Prague"

Metro Areas:
• "Greater London" = "London"
• "San Francisco Bay Area" = "San Francisco"
• "Greater Boston" = "Boston"
• "Metro Atlanta" = "Atlanta"

State/Region Variations:
• "Seattle, WA" = "Seattle, Washington" = "Seattle"
• "Austin, TX" = "Austin, Texas" = "Austin"
• "London, ON" ≠ "London, UK" (Different locations!)

NEVER MATCH DIFFERENT CITIES:
----------------------------
• "Mountain View" ≠ "Palo Alto" (both in CA, but different cities)
• "Cambridge, MA" ≠ "Cambridge, UK" (different countries)
• "Portland, OR" ≠ "Portland, ME" (different states)
• "San Jose" ≠ "San Francisco" (different cities in same area)

PARSING PATTERNS
===============

Common Input Formats:
-------------------
• "City, State, Country" → Extract all three
• "City, State" → Infer country from state
• "City, Country" → Extract both
• "Remote - City, State" → Extract city/state, ignore "Remote"
• "Hybrid - City" → Extract city, ignore "Hybrid"
• "Country only" → Set is_country_only = true
• "Remote" only → Return null/error if no other location info

Special Cases:
-------------
• "United States" variations: "US", "USA", "United States of America"
• "United Kingdom" variations: "UK", "Great Britain", "England", "Scotland", "Wales"
• "Remote/Hybrid + location" → Extract the location part
• Multiple locations → Use primary/first location mentioned

COUNTRY CODE MAPPING
===================
• United States → US
• United Kingdom → UK (or GB for ISO standard)
• Canada → CA
• Germany → DE
• France → FR
• Australia → AU
• Japan → JP
• China → CN
• India → IN
• Brazil → BR

VALIDATION CHECKLIST
===================
□ Is the parsed city name preserved accurately?
□ Is the country code correct for the identified country?
□ Does the match make geographical sense?
□ Are we matching exact names or acceptable variations only?
□ Is is_country_only set correctly?

ERROR PREVENTION
===============
• Don't match partial strings (e.g., "York" ≠ "New York")
• Don't match similar-sounding cities in different countries
• Don't assume state abbreviations without context
• Don't create duplicate entries for the same location
• Don't match cities to countries or vice versa

INPUT/OUTPUT FORMATS
===================

INPUT TYPES:
-----------
ALUMNI TYPE:
{
    "city": "string or null",
    "country": "string",
    "country_code": "ISO code"
}

ROLE TYPE:
{
    "location": "free-form text string"
}

COMPANY TYPE:
{
    "headquarters": "string",
    "country_codes": ["array of ISO codes"]
}

DATABASE LOCATION FORMAT:
-----------------------
[
    {
        "id": "uuid-string",
        "country_code": "ISO-3166 country code",
        "country": "Full country name",
        "city": "City name or null",
        "is_country_only": boolean
    }
]

OUTPUT DECISION LOGIC
====================
• IF exact match found in database:
  → Return existing location with ID
• IF acceptable variation match found:
  → Return existing location with ID
• IF no match found:
  → Create new location object (no ID field)
• IF only country can be determined:
  → Set is_country_only = true, city = null
• IF location cannot be parsed:
  → Return error or null response

RESPONSE FORMATS
===============
EXISTING LOCATION (found match):
{
    "id": "existing-uuid",
    "country_code": "US",
    "country": "United States",
    "city": "Mountain View",
    "is_country_only": false
}

NEW LOCATION (no match found):
{
    "country_code": "US",
    "country": "United States",
    "city": "Mountain View",
    "is_country_only": false
}

COUNTRY-ONLY LOCATION:
{
    "country_code": "US",
    "country": "United States",
    "city": null,
    "is_country_only": true
}

CRITICAL OUTPUT REQUIREMENTS
==========================
1. Return ONLY valid JSON - no additional text, comments, or explanations
2. Use lowercase boolean values: true/false (not True/False)
3. No markdown code blocks, line breaks, or extra formatting
4. Double quotes around all keys and string values
5. Include ID field ONLY for existing locations
6. Ensure country_code matches standard ISO-3166 alpha-2 format
7. Preserve original city name capitalization in output
8. Set is_country_only correctly based on whether city was identified

CONSISTENCY REQUIREMENTS
=======================
1. Same input should always produce same output
2. Matching logic should be deterministic
3. Preserve data accuracy over forced matching
4. When in doubt, create new location rather than incorrect match"""
