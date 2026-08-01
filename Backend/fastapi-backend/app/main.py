"""Main FastAPI application"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.models.base import Base
from app.api import auth, timetables, conflicts, setup

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager replacing deprecated on_event handlers"""
    logger.info(f"Starting application in {settings.app_env} mode")
    db_url = settings.database_url or ""
    db_name = db_url.split('@')[1] if '@' in db_url else 'test_db'
    logger.info(f"Database: {db_name}")

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    yield

    logger.info("Shutting down application")


# Create FastAPI instance
app = FastAPI(
    title="Timetable Generator API",
    description="Automated timetable generation and management system",
    version="0.1.0",
    lifespan=lifespan,
)

# Include routes
app.include_router(auth.router)
app.include_router(timetables.router)
app.include_router(conflicts.router)
app.include_router(setup.router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.app_env,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Timetable Generator API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
