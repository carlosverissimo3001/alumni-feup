from fastapi import APIRouter

from app.api.endpoints import company, esco, job_classification, linkedin, role, seniority, storage

# Create the main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    job_classification.router,
    prefix="/job-classification",
    tags=["Job Classification"],
)

api_router.include_router(
    linkedin.router,
    prefix="/linkedin",
    tags=["LinkedIn"],
)

api_router.include_router(
    role.router,
    prefix="/role",
    tags=["Role"],
)

api_router.include_router(
    seniority.router,
    prefix="/seniority",
    tags=["Seniority"],
)

api_router.include_router(
    storage.router,
    prefix="/storage",
    tags=["Storage"],
)

api_router.include_router(
    company.router,
    prefix="/company",
    tags=["Company"],
)

api_router.include_router(
    esco.router,
    prefix="/esco",
    tags=["ESCO"],
)
