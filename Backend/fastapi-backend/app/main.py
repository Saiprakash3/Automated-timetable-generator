"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import engine
from app.models.base import Base
from app.api import auth, timetables, conflicts

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

# Create FastAPI instance
app = FastAPI(
    title="Timetable Generator API",
    description="Automated timetable generation and management system",
    version="0.1.0",
)

# Include routes
app.include_router(auth.router)
app.include_router(timetables.router)
app.include_router(conflicts.router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Startup event: initialize database"""
    logger.info(f"Starting application in {settings.app_env} mode")
    logger.info(f"Database: {settings.database_url.split('@')[1] if '@' in settings.database_url else 'unknown'}")

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event: cleanup"""
    logger.info("Shutting down application")


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
