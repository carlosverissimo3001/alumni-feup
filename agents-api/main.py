import asyncio

import uvicorn


async def startup():
    """Run startup tasks."""
    pass


if __name__ == "__main__":
    # Run startup tasks
    asyncio.run(startup())

    # Run the application
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
