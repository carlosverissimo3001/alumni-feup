from fastapi import APIRouter

from app.api.endpoints import job_classification, linkedin

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
