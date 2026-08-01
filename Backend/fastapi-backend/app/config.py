"""Application configuration using Pydantic Settings"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env file"""

    # Environment
    app_env: str = "development"
    debug: bool = False
    log_level: str = "INFO"

    # Database URLs
    db_dev: str | None = None
    db_test: str | None = None
    db_prod: str | None = None

    # JWT
    jwt_secret_key: str = "supersecretkey123456789"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 8

    # Frontend
    vite_api_base_url: str = "http://localhost:4000/api"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Conflict Detection - Working Hours
    working_hours_start: int = 9  # 9 AM
    working_hours_end: int = 17  # 5 PM
    lunch_break_minutes: int = 60  # 1 hour
    short_breaks_minutes: int = 30  # Total for all breaks
    period_length_minutes: int = 60  # 1 hour per period

    # Conflict Detection - Faculty Constraints
    faculty_max_periods_per_day: int = 6
    faculty_max_days_per_week: int = 5
    faculty_max_lab_days_per_week: int = 3

    # Conflict Detection - Lab Coordinator Constraints
    lab_coordinator_max_periods_per_day: int = 4
    lab_coordinator_max_days_per_week: int = 5

    # Conflict Detection - Behavior
    allow_blocking_conflicts_in_draft: bool = False

    @property
    def database_url(self) -> str:
        """Get database URL based on environment"""
        db_url = None
        if self.app_env == "test":
            db_url = self.db_test
        elif self.app_env == "production":
            db_url = self.db_prod
        else:  # development
            db_url = self.db_dev

        # SQLAlchemy 2.0+ requires explicit driver specification
        # Replace postgresql:// with postgresql+psycopg:// for psycopg driver
        if db_url and db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

        return db_url

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


settings = Settings()
