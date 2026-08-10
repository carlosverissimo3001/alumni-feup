
# Alumni‑FEUP 🌍📊

🔗[alumni-feup.com](https://www.alumni-feup.com/)

[![agents-api tests](https://img.shields.io/github/actions/workflow/status/carlosverissimo3001/alumni-feup/agents-api-tests.yml?branch=main&label=agents-api%20tests)]() [![Vercel](https://vercelbadge.vercel.app/api/carlosverissimo3001/alumni-feup)]() 
[![PRs Welcome ✨](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)]()

## 🎓 Overview

**Alumni‑FEUP** is a full‑stack data analytics platform displaying alumni career insights, developed as part of two MSc thesis at FEUP.  
Built by **Carlos Veríssimo** and **José Pessoa**, it extends the original [alumniei-world](https://eic30anos.fe.up.pt/alumnieiworld/) by [Jénifer Constantino](https://www.linkedin.com/in/jenifer-constantino/).

<p align="center">
  <img src="https://github.com/user-attachments/assets/2bb404ed-cd8b-4664-bdb7-b4678cd1d003" alt="Alumni-FEUP" width="80%" />
</p>

## ✨ Features

- 🔍 Alumni search & filters: degree, year, location, career path
- 🌍 Map visualization of alumni locations
- 📈 Dynamic dashboards: tables,charts, stats (React + D3)
- 🤖 AI/ML Enrichment: job classification, seniority inference, geo resolution (FastAPI agents, LangChain)
- 🛠️ Admin tools: secure CSV imports, faculty/degree creation, and more to come
- ⚙️ Modern backend: Nest.js, Prisma, PostgreSQL
- 🚢 DevOps-ready: Docker, Railway + Vercel deployments, CI on PRs

**Repository structure:**

```text
├── api                       # NestJS + Prisma backend (analytics, auth, alumni, companies)
├── agents-api                # FastAPI + LangChain agents (classification, enrichment, LinkedIn data enrichment)
├── app                       # Next.js frontend with analytics dashboard & SDK
├── docs                      # Documentation: API, visualization guide, feature specs
├── docker-compose-dev.yml    # local development docker-compose file
├── swagger-spec.json         # OpenAPI spec (swagger)
└── README.md                 # You are here!
```

## 🧩 Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js, React, Tailwind, D3.js, shadcn/ui |
| Backend(s) | Nest.js (TypeScript), Prisma ORM |
| AI-Agents Infrastructure | FastAPI, LangChain, OpenAI |
| Database(s) | PostgreSQL, Redis |

Frontend is deployed on Vercel; the backend and agents API run on Railway,
alongside managed Postgres and Redis. The API is served from
`api.alumni-feup.com`.

## 🏁 Get Started

This section explains how to set up a local development environment.

### ✅ Prerequisites

- Node.js ≥ 18 & Yarn
- Python ≥ 3.10 & uv or venv
- PostgreSQL & Redis

### 🔧 Local Setup

```bash
# Clone the repo
git clone https://github.com/carlosverissimo3001/alumni-feup.git
cd alumni-feup

# Frontend
cd app
yarn install

# Backend API
cd ../api
yarn install

# Data Enrichment Infrastructure
cd agents-api
uv venv
source .venv/bin/activate
uv sync

# Launch a local development environment (PostgreSQL and Redis)
cd ..
docker-compose -f docker-compose-dev.yml up -d
```

### ⚙️ Environment Variables

Copy and fill in `.env.example` in each folder (app, api, agents-api).

### 🚀 Running the application

```bash
# Start the frontend
cd app
npm run dev

# or
npm run dev:watch # if you want to automatically generate the SDK if the spec changes

# Start the backend
cd api
npm run start:dev

# Start the agents-api
cd agents-api
uv run app.main:app --reload

# or
uvicorn app.main:app --reload
```

### 🧪 Testing

#### Backend API (NestJS)

> Test coverage is currently low, and improvements are planned.

```bash
cd api
yarn test
```

Uses Jest + ts-jest.

#### Agents & Frontend

> To be added.


## 📚 About This Project

This project is an open-source, extended version of [alumniei-world](https://eic30anos.fe.up.pt/alumnieiworld/) by Jénifer Constantino.

**Alumni-Feup** was developed by Carlos Veríssimo and José Pessoa as part of the MSc dissertation in Informatics and Computing Engineering and Software Engineering, respectively, at [FEUP](https://sigarra.up.pt/feup/en/WEB_PAGE.INICIAL), University of Porto, 2025.

Special thanks to Jénifer Constantino for the original platform and inspiration.

📄 Read Carlos's thesis: [Repositório Aberto da U.Porto](https://repositorio-aberto.up.pt/bitstream/10216/168783/2/735442.pdf)

<!-- Read José's thesis here: (link pending) -->

---

## 💼 Commercial & Support

Interested in adopting this project at your institution, getting a commercial license, enterprise integration, or dedicated support?  
Reach out via [email](mailto:carlosverissimo3001@gmail.com) or [LinkedIn](https://www.linkedin.com/in/carlosverissimo3001/).

## 📝 License

MIT License – see the [LICENSE](LICENSE) file for details.

## 🤝 Contribution

PRs are welcome!
