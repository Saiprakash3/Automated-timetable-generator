"""Database configuration and session management"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.config import settings

# Use in-memory SQLite for testing, PostgreSQL otherwise
if settings.app_env == "test":
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.debug,
    )
else:
    # Create engine with psycopg driver (psycopg3)
    engine = create_engine(
        settings.database_url,
        echo=settings.debug,
        pool_size=20 if settings.app_env == "production" else 5,
        max_overflow=40 if settings.app_env == "production" else 10,
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
