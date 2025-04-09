# Agents API

A FastAPI service for job title classification and LinkedIn data extraction.

## Features

- Classify job titles into ESCO taxonomy using LLM agents (langchain/langGraph + ollama)
- Extract LinkedIn profile data
- RESTful API endpoints with proper request/response validation
- Connection to PostgreSQL database

## Requirements

- Python 3.12+
- PostgreSQL database
- Ollama (for LLM inference)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agents-api
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install the dependencies:
```bash
pip install -e .
```

4. Configure environment variables by editing the `.env` file:
```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# API Settings
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
ENVIRONMENT=development

# LLM Settings
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODEL=llama3
```

5. Install Ollama and download the required model:
```bash
# Follow Ollama installation instructions at https://ollama.ai/
ollama pull llama3  # Or any other model you want to use
```

## Running the API

Start the API server:
```bash
python main.py
```

The API will be available at http://localhost:8000.

## API Endpoints

### Job Classification

**Endpoint**: `/api/job-classification/`

**Method**: POST

**Request Body**:
```json
{
  "title": "Software Engineer",
  "description": "Developing web applications using React and Node.js"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Software Engineer",
  "description": "Developing web applications using React and Node.js",
  "results": [
    {
      "code": "2512.1",
      "label": "Software Developer",
      "level": 4,
      "confidence": 0.92
    },
    {
      "code": "2513.3",
      "label": "Web Developer",
      "level": 4,
      "confidence": 0.85
    },
    {
      "code": "2511.1",
      "label": "Systems Analyst",
      "level": 4,
      "confidence": 0.78
    }
  ],
  "processing_time": 1.25,
  "model_used": "ollama-llama3"
}
```

### LinkedIn Profile Extraction

**Endpoint**: `/api/linkedin/extract-profile`

**Method**: POST

**Request Body**:
```json
{
  "profile_url": "https://www.linkedin.com/in/username",
  "include_experiences": true,
  "include_education": true,
  "include_skills": true
}
```

**Response**:
```json
{
  "profile_url": "https://www.linkedin.com/in/username",
  "full_name": "John Doe",
  "headline": "Software Engineer at Example Corp",
  "location": "San Francisco, CA",
  "summary": "Experienced software engineer...",
  "experiences": [
    {
      "title": "Software Engineer",
      "company": "Example Corp",
      "location": "San Francisco, CA",
      "description": "Full-stack development...",
      "start_date": "2018-01",
      "end_date": null,
      "is_current": true
    }
  ],
  "education": [
    {
      "institution": "University of California, Berkeley",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "start_date": "2012",
      "end_date": "2016"
    }
  ],
  "skills": [
    {
      "name": "JavaScript",
      "endorsements": 25
    }
  ],
  "extraction_timestamp": "2023-04-09T12:34:56.789Z"
}
```

## Development

### Code formatting and linting

Format and lint code using Ruff:
```bash
ruff format .
ruff check --fix .
```

### Running tests

Run tests using pytest:
```bash
pytest
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
