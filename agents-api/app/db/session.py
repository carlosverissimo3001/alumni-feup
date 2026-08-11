import logging
from contextlib import contextmanager
from typing import Generator, Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(
    str(settings.DATABASE_URL),
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_timeout=30,
)

# Create sessionmaker with the engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative models
Base = declarative_base()


def get_db() -> Generator:
    """
    Create a new database session and close it when done.
    This function is used as a dependency in FastAPI endpoints.
    """
    db = SessionLocal()
    try:
        logger.debug("Creating new database session")
        yield db
    finally:
        logger.debug("Closing database session")
        db.close()


@contextmanager
def session_scope() -> Iterator[Session]:
    """A session for work that happens outside a request.

    `get_db` is a FastAPI dependency: the session it yields is closed when the
    response is sent. Most of this service's work is dispatched with
    `BackgroundTasks` and therefore runs *after* that point, so a request-scoped
    session would already be closed by the time it was used. Those paths open
    their own session with this instead.

    Deliberately does not commit on exit. The `*_db` helpers already commit
    their own writes, and adding an implicit commit here would also commit work
    a caller had decided to abandon. Rolling back on an exception and always
    closing is the part that was missing.
    """
    session = SessionLocal()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
