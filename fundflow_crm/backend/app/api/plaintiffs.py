from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.models.plaintiff import PlaintiffCreate, PlaintiffUpdate, PlaintiffResponse, WorkflowStage
from app.core.auth import verify_token

router = APIRouter()

# Helper function to convert ObjectId to string and handle date conversion
def convert_objectid(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, ObjectId):
                item[key] = str(value)
            elif key == "incidentDate" and isinstance(value, str):
                # Convert string date to datetime object
                try:
                    from datetime import datetime
                    item[key] = datetime.fromisoformat(value + "T00:00:00") if value else None
                except (ValueError, TypeError):
                    item[key] = None
            elif isinstance(value, dict):
                convert_objectid(value)
            elif isinstance(value, list):
                for i, v in enumerate(value):
                    if isinstance(v, ObjectId):
                        value[i] = str(v)
                    elif isinstance(v, dict):
                        convert_objectid(v)
    return item

@router.post("/", response_model=PlaintiffResponse, status_code=status.HTTP_201_CREATED)
async def create_plaintiff(plaintiff: PlaintiffCreate, db=Depends(get_database)):
    """Create a new plaintiff"""
    plaintiff_dict = plaintiff.dict()
    plaintiff_dict["createdAt"] = datetime.utcnow()
    plaintiff_dict["updatedAt"] = datetime.utcnow()
    plaintiff_dict["documents"] = []
    plaintiff_dict["communicationHistory"] = []
    
    result = await db.plaintiffs.insert_one(plaintiff_dict)
    created_plaintiff = await db.plaintiffs.find_one({"_id": result.inserted_id})
    
    if not created_plaintiff:
        raise HTTPException(status_code=500, detail="Failed to create plaintiff")
    
    created_plaintiff = convert_objectid(created_plaintiff)
    return PlaintiffResponse(**created_plaintiff)

@router.get("/", response_model=List[PlaintiffResponse])
async def get_plaintiffs(
    skip: int = 0, 
    limit: int = 100,
    stage: Optional[WorkflowStage] = None,
    search: Optional[str] = None,
    db=Depends(get_database)
):
    """Get all plaintiffs with optional filtering"""
    query = {}
    
    if stage:
        query["currentStage"] = stage
    
    if search:
        query["$or"] = [
            {"firstName": {"$regex": search, "$options": "i"}},
            {"lastName": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    # Handle both MongoDB and mock database
    try:
        cursor = db.plaintiffs.find(query).skip(skip).limit(limit)
        plaintiffs = await cursor.to_list(length=limit)
    except (AttributeError, TypeError):
        # Mock database doesn't support MongoDB query syntax
        all_plaintiffs = await db.plaintiffs.find({})
        plaintiffs = await all_plaintiffs.to_list()
        
        # Manual filtering for mock database
        if stage:
            plaintiffs = [p for p in plaintiffs if p.get("currentStage") == stage]
        if search:
            search_lower = search.lower()
            plaintiffs = [p for p in plaintiffs 
                         if search_lower in str(p.get("firstName", "")).lower() 
                         or search_lower in str(p.get("lastName", "")).lower()
                         or search_lower in str(p.get("email", "")).lower()]
        
        # Apply skip and limit
        plaintiffs = plaintiffs[skip:skip + limit]
    
    return [PlaintiffResponse(**convert_objectid(p)) for p in plaintiffs]

@router.get("/stats")
async def get_stats(db=Depends(get_database)):
    """Get statistics - alias for dashboard stats"""
    return await get_dashboard_stats(db)

@router.get("/stats/dashboard")
async def get_dashboard_stats(db=Depends(get_database)):
    """Get dashboard statistics"""
    pipeline = [
        {
            "$group": {
                "_id": "$currentStage",
                "count": {"$sum": 1}
            }
        }
    ]
    
    stats = await db.plaintiffs.aggregate(pipeline).to_list(length=None)
    
    # Convert to dictionary with stage names as keys
    stage_counts = {stat["_id"]: stat["count"] for stat in stats}
    
    # Get total count
    total_count = await db.plaintiffs.count_documents({})
    
    return {
        "totalPlaintiffs": total_count,
        "stageBreakdown": stage_counts
    }

@router.get("/{plaintiff_id}", response_model=PlaintiffResponse)
async def get_plaintiff(plaintiff_id: str, db=Depends(get_database)):
    """Get a specific plaintiff by ID"""
    try:
        # Try MongoDB format first
        plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(plaintiff_id)})
    except Exception:
        # If that fails, try string ID (for mock database)
        try:
            plaintiff = await db.plaintiffs.find_one({"_id": plaintiff_id})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid plaintiff ID")
    
    if not plaintiff:
        raise HTTPException(status_code=404, detail="Plaintiff not found")
    
    plaintiff = convert_objectid(plaintiff)
    return PlaintiffResponse(**plaintiff)

@router.put("/{plaintiff_id}", response_model=PlaintiffResponse)
async def update_plaintiff(plaintiff_id: str, plaintiff_update: PlaintiffUpdate, db=Depends(get_database)):
    """Update a plaintiff"""
    try:
        object_id = ObjectId(plaintiff_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid plaintiff ID")
    
    update_data = {k: v for k, v in plaintiff_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.plaintiffs.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plaintiff not found")
    
    updated_plaintiff = await db.plaintiffs.find_one({"_id": object_id})
    updated_plaintiff = convert_objectid(updated_plaintiff)
    return PlaintiffResponse(**updated_plaintiff)

@router.delete("/{plaintiff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plaintiff(plaintiff_id: str, db=Depends(get_database)):
    """Delete a plaintiff"""
    try:
        object_id = ObjectId(plaintiff_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid plaintiff ID")
    
    result = await db.plaintiffs.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plaintiff not found")
