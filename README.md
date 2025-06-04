# Alumni Feup

![Alumni Feup logo](https://github.com/user-attachments/assets/30b40ad6-b9af-477b-ba25-41d52922434f)

## Overview

This repository combines several services that power the Alumni EI World
platform. It includes backend APIs, LLM-driven agents, a Next.js frontend and
supporting documentation.

### Repository Structure

1. **api** – NestJS backend using Prisma for Postgres. This service contains
   modules for analytics, companies, alumni management and authentication.
2. **agents-api** – Python FastAPI service with LangChain agents for job
   classification, location resolution and LinkedIn extraction. Configuration is
   handled in `app/core/config.py`.
3. **app** – Next.js frontend containing React components and generated SDK
   clients under `src`. Pages such as the analytics dashboard live here.
4. **docs** – Guides and specifications including analytics dashboard strategy,
   API endpoints and a D3 visualization guide.
5. **Infrastructure** – `docker-compose-dev.yml` for local Postgres and Redis,
   and `swagger-spec.json` providing the OpenAPI specification.

### Pointers for Further Exploration

1. **Backend Analytics** – See `api/src/analytics` for DTOs, services and
   controllers.
2. **LLM Agents** – Explore `agents-api/app/agents` to learn how data
   classification and extraction is implemented.
3. **Frontend Visualizations** – Review components under
   `app/src/components/analytics` together with `docs/d3-visualization-guide.md`.
4. **Database Schema** – Inspect `api/prisma/schema.prisma` or
   `agents-api/app/db/models.py`.
5. **Environment Configuration** – Check `.env` handling in the FastAPI service
   and Next.js application.

## How to run

<!-- TODO: Write this section -->

## Caveats

## Feature Roadmap

## Testing the API

1. Navigate to the API package and install dependencies:

```bash
cd api && yarn install
```

2. Run the unit test suite:

```bash
yarn test
```

The API uses Jest with TypeScript via `ts-jest`. Ensure dependencies are installed before running the tests.
