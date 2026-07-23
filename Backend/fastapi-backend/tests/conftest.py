"""Pytest configuration and shared fixtures"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Set test database URL before importing app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["APP_ENV"] = "test"

from app.main import app
from app.database import get_db, engine
from app.models.base import Base

# Create session factory using app's test engine
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create test database and session"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create test client with dependency override"""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user_data():
    """Sample test user data"""
    return {
        "id": "F1023",
        "name": "Dr. Ramesh Kumar",
        "role": "faculty",
        "department": "CSE",
        "password": "fac123",
    }
