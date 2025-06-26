from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.core.database import init_database, close_database
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:4028"  # Vite dev server default port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Pre-Settlement Funding CRM API", "version": "1.0.0"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

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
