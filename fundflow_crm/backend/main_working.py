from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from datetime import datetime

app = FastAPI(title="FundFlow CRM API")

# CORS configuration
origins = [
    "https://fundflow-crm.vercel.app",
    "https://fundflow-f48671lhy-yarons-projects-601a79ac.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://localhost:3000",
    "https://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # Allow all for now
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mock data for testing
MOCK_PLAINTIFFS = [
    {
        "id": "1",
        "_id": "1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "555-0101",
        "caseType": "Personal Injury",
        "status": "Active",
        "currentStage": "INITIAL_CONTACT",
        "workflowStage": "INITIAL_CONTACT",
        "requestedAmount": 50000,
        "estimatedSettlement": 75000,
        "incidentDate": "2024-01-15",
        "createdAt": "2024-01-20T10:00:00Z",
        "updatedAt": "2024-01-25T15:30:00Z"
    },
    {
        "id": "2",
        "_id": "2",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "phone": "555-0102",
        "caseType": "Medical Malpractice",
        "status": "Pending",
        "currentStage": "DOCUMENT_REVIEW",
        "workflowStage": "DOCUMENT_REVIEW",
        "requestedAmount": 100000,
        "estimatedSettlement": 150000,
        "incidentDate": "2024-02-10",
        "createdAt": "2024-02-15T09:00:00Z",
        "updatedAt": "2024-02-20T11:45:00Z"
    }
]

MOCK_COMMUNICATIONS = [
    {
        "id": "1",
        "_id": "1",
        "type": "email",
        "subject": "Case Update - John Doe",
        "content": "Updated case status for John Doe case.",
        "plaintiffId": "1",
        "createdAt": "2024-01-21T14:00:00Z"
    }
]

# Basic health check
@app.get("/")
async def root():
    return {"message": "FundFlow CRM API is running!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fundflow-crm-backend"}

# Plaintiffs endpoints
@app.get("/api/v1/plaintiffs")
async def get_plaintiffs(skip: int = 0, limit: int = 100, search: Optional[str] = None):
    """Get all plaintiffs with optional filtering"""
    plaintiffs = MOCK_PLAINTIFFS.copy()
    
    if search:
        search_lower = search.lower()
        plaintiffs = [p for p in plaintiffs 
                     if search_lower in p.get("firstName", "").lower() 
                     or search_lower in p.get("lastName", "").lower()
                     or search_lower in p.get("email", "").lower()]
    
    # Apply pagination
    total = len(plaintiffs)
    plaintiffs = plaintiffs[skip:skip + limit]
    
    return {
        "plaintiffs": plaintiffs,
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "limit": limit
    }

@app.get("/api/v1/plaintiffs/{plaintiff_id}")
async def get_plaintiff(plaintiff_id: str):
    """Get a specific plaintiff by ID"""
    plaintiff = next((p for p in MOCK_PLAINTIFFS if p["id"] == plaintiff_id), None)
    if not plaintiff:
        raise HTTPException(status_code=404, detail="Plaintiff not found")
    return plaintiff

@app.get("/api/v1/plaintiffs/stats")
async def get_plaintiff_stats():
    """Get plaintiff statistics"""
    total = len(MOCK_PLAINTIFFS)
    active = len([p for p in MOCK_PLAINTIFFS if p.get("status") == "Active"])
    pending = len([p for p in MOCK_PLAINTIFFS if p.get("status") == "Pending"])
    
    return {
        "total": total,
        "active": active,
        "pending": pending,
        "completed": 0,
        "totalFunding": 200000
    }

# Communications endpoints
@app.get("/api/v1/communications")
async def get_communications():
    """Get all communications"""
    return MOCK_COMMUNICATIONS

# Database health endpoint for compatibility
@app.get("/api/v1/database/health")
async def database_health():
    """Database health check"""
    return {
        "status": "healthy",
        "type": "mock",
        "collections": ["plaintiffs", "communications"],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
