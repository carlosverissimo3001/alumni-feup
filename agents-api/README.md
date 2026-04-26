# Agents API

A FastAPI service for job title classification and LinkedIn data extraction.

## Features

- Classify job titles into ESCO taxonomy using LLM agents
- Extract LinkedIn profile data
- RESTful API endpoints with proper request/response validation
- Connection to PostgreSQL database

## Requirements

- Python 3.12+
- PostgreSQL database
- Redis

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

## Deployment (Railway)

The service deploys to Railway via [Railpack](https://railpack.com) (Railway's default builder since March 2025; replaced Nixpacks). Build config lives in `railpack.json`; deploy/runtime config (builder selection, healthcheck, restart policy, start command) lives in `railway.toml`.

### Required env vars

Wire these as Railway service variables (use reference variables for `DATABASE_URL` and `REDIS_URL` so they pull from the Postgres / Redis add-ons):

| Variable | Source | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Same Postgres as the NestJS API |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Provision Redis as a Railway add-on |
| `PORT` | auto-injected | Don't set manually |
| `ENVIRONMENT` | `production` | |
| `LOG_LEVEL` | `info` | |
| `CORS_ORIGINS` | `["<nestjs-railway-url>","<frontend-url>"]` | JSON array as a string |
| `API_KEY_SECRET` | random secret | Shared with the NestJS API for inter-service auth |
| `OPENAI_API_KEY` | OpenAI dashboard | Required for embeddings (Anthropic has none) |
| `OPENAI_DEFAULT_MODEL` | `gpt-4o-mini` | |
| `ALUMNI_EXTRACT_API_KEY` | EnrichLayer | |
| `ALUMNI_EXTRACT_BASE_URL` | EnrichLayer | |
| `BRIGHTDATA_API_KEY` | BrightData | |
| `BRIGHTDATA_BASE_URL` | BrightData | |
| `BRIGHTDATA_COMPANY_DATASET_ID` | BrightData | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | |
| `CLOUDINARY_API_KEY` | Cloudinary | |
| `CLOUDINARY_API_SECRET` | Cloudinary | |
| `GEOLOCATION_API_KEY` | OpenWeather | |
| `GEOLOCATION_BASE_URL` | OpenWeather | `https://api.openweathermap.org/geo/1.0/direct?q=` |

### Networking

Call this service from the NestJS API via Railway's private network (`agents-api.railway.internal:$PORT`) instead of the public URL — free, no egress, no CORS for that hop. Public URL is only needed for healthchecks and ad-hoc debugging.

### Sentence-transformers model cache

`railpack.json` defines a `prefetch-models` build step that pre-downloads `cross-encoder/ms-marco-MiniLM-L-6-v2` into `/app/.cache/huggingface` (set via `HF_HOME`), so cold starts don't pay the ~90 MB download. The step chains off the default `build` step (which runs `uv sync` to install the project), and the deploy stage takes its output as input — so the cached model lands in the runtime image. No volume mount needed.

### Healthcheck

`GET /health` returns `{"status": "ok"}` and is exempt from `APIKeyMiddleware` (allowlisted in `app/core/middlewares.py`). Railway's healthcheck path is configured in `railway.toml`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
