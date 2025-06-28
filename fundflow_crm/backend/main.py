from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.core.database import init_database, close_database, get_database_status, get_database
from app.core.mongo_setup import initialize_collections, seed_sample_data, check_database_health
from app.api import plaintiffs, law_firms, employees, communications, documents, ai_agents, google
from app.core.auth import verify_token

# Load environment variables
# First load .env (defaults), then .env.local (overrides)
load_dotenv('.env')
load_dotenv('.env.local', override=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    await initialize_collections()
    yield
    # Shutdown
    await close_database()

app = FastAPI(
    title="Pre-Settlement Funding CRM API",
    description="AI-Powered CRM for Pre-Settlement Funding Business",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:4028").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms"""
    try:
        db_status = await get_database_status()
        return {
            "status": "healthy",
            "database": db_status,
            "timestamp": "2025-06-27",
            "service": "fundflow-crm-backend"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Pre-Settlement Funding CRM API", "version": "1.0.0"}

# Database status endpoint
@app.get("/api/v1/database/status")
async def database_status():
    """Get the current database connection status"""
    db_status = await get_database_status()
    return db_status

# Database health check
@app.get("/api/v1/database/health")
async def database_health():
    """Detailed database health check with collection info"""
    health_status = await check_database_health()
    return health_status

# Initialize database collections (admin endpoint)
@app.post("/api/v1/database/init")
async def initialize_database():
    """Initialize database collections and indexes"""
    try:
        await initialize_collections()
        return {"message": "Database collections initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize database: {str(e)}")

# Seed sample data (admin endpoint)
@app.post("/api/v1/database/seed")
async def seed_database():
    """Seed database with sample data for development"""
    try:
        await seed_sample_data()
        return {"message": "Database seeded with sample data successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed database: {str(e)}")

# Reset database (admin endpoint)
@app.post("/api/v1/database/reset")
async def reset_database():
    """Reset database by clearing all collections"""
    try:
        db = await get_database()
        collections = await db.list_collection_names()
        for collection_name in collections:
            await db[collection_name].delete_many({})
        return {"message": f"Reset {len(collections)} collections successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset database: {str(e)}")

# Include API routers
app.include_router(plaintiffs.router, prefix="/api/v1/plaintiffs", tags=["plaintiffs"])
app.include_router(law_firms.router, prefix="/api/v1/law-firms", tags=["law-firms"])
app.include_router(employees.router, prefix="/api/v1/employees", tags=["employees"])
app.include_router(communications.router, prefix="/api/v1/communications", tags=["communications"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(ai_agents.router, prefix="/api/v1/ai", tags=["ai-agents"])
app.include_router(google.router, prefix="/api/v1/google", tags=["google-services"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
