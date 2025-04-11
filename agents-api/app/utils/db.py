import logging

from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


async def init_db():
    """
    Initialize the database by creating tables if they don't exist.
    """
    from app.db.models import Base
    from app.db.session import engine

    logger.info("Creating database tables if they don't exist")
    Base.metadata.create_all(bind=engine)


async def check_db_connection(db: Session) -> bool:
    """
    Check if the database connection is working.

    Args:
        db: SQLAlchemy database session

    Returns:
        bool: True if connection is working, False otherwise
    """
    try:
        # Execute a simple query to check the connection
        db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False
