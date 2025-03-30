from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os
from dotenv import load_dotenv
from contextlib import contextmanager
from typing import Generator

load_dotenv()

class DatabaseConnection:
    _instance = None
    _engine = None
    _SessionLocal = None
    Base = declarative_base()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is not set")
        
        # Create engine
        self._engine = create_engine(DATABASE_URL)
        
        # Create session factory
        self._SessionLocal = sessionmaker(
            autocommit=False, 
            autoflush=False, 
            bind=self._engine
        )

    @property
    def engine(self):
        return self._engine

    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        """
        Get a database session using a context manager.
        Usage:
            with db.get_session() as session:
                session.query(...)
        """
        session = self._SessionLocal()
        try:
            yield session
        finally:
            session.close()

    def create_all_tables(self):
        """Create all tables defined in the models"""
        self.Base.metadata.create_all(self._engine)

# Create a global instance
db = DatabaseConnection() 