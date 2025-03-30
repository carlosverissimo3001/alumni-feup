from functools import wraps

from fastapi import APIRouter

ROUTERS = []

@wraps(APIRouter)
def make_router(*args, **kwargs) -> APIRouter:
    router = APIRouter(*args, **kwargs)
    ROUTERS.append(router)
    return router
