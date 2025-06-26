from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.models.communication import CommunicationCreate, CommunicationUpdate, CommunicationResponse

router = APIRouter()

def convert_objectid(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, ObjectId):
                item[key] = str(value)
            elif isinstance(value, dict):
                convert_objectid(value)
            elif isinstance(value, list):
                for i, v in enumerate(value):
                    if isinstance(v, ObjectId):
                        value[i] = str(v)
                    elif isinstance(v, dict):
                        convert_objectid(v)
    return item

@router.post("/", response_model=CommunicationResponse, status_code=status.HTTP_201_CREATED)
async def create_communication(communication: CommunicationCreate, db=Depends(get_database)):
    """Create a new communication record"""
    communication_dict = communication.dict()
    communication_dict["timestamp"] = datetime.utcnow()
    communication_dict["createdAt"] = datetime.utcnow()
    communication_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.communications.insert_one(communication_dict)
    created_communication = await db.communications.find_one({"_id": result.inserted_id})
    
    if not created_communication:
        raise HTTPException(status_code=500, detail="Failed to create communication")
    
    # Update plaintiff's communication history
    if communication.plaintiffId:
        await db.plaintiffs.update_one(
            {"_id": ObjectId(communication.plaintiffId)},
            {"$push": {"communicationHistory": str(result.inserted_id)}}
        )
    
    created_communication = convert_objectid(created_communication)
    return CommunicationResponse(**created_communication)

@router.get("/", response_model=List[CommunicationResponse])
async def get_communications(
    skip: int = 0, 
    limit: int = 100,
    plaintiff_id: str = None,
    status_filter: str = None,
    sort: str = "timestamp",
    order: str = "desc",
    db=Depends(get_database)
):
    """Get communications with optional filtering"""
    query = {}
    
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    
    if status_filter:
        query["status"] = status_filter
    
    # Handle sorting
    sort_field = sort if sort in ["timestamp", "createdAt", "updatedAt"] else "timestamp"
    sort_direction = -1 if order.lower() == "desc" else 1
    
    cursor = db.communications.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
    communications = await cursor.to_list(length=limit)
    
    return [CommunicationResponse(**convert_objectid(comm)) for comm in communications]

@router.get("/{communication_id}", response_model=CommunicationResponse)
async def get_communication(communication_id: str, db=Depends(get_database)):
    """Get a specific communication by ID"""
    try:
        communication = await db.communications.find_one({"_id": ObjectId(communication_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid communication ID")
    
    if not communication:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    communication = convert_objectid(communication)
    return CommunicationResponse(**communication)

@router.put("/{communication_id}", response_model=CommunicationResponse)
async def update_communication(communication_id: str, communication_update: CommunicationUpdate, db=Depends(get_database)):
    """Update a communication"""
    try:
        object_id = ObjectId(communication_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid communication ID")
    
    update_data = {k: v for k, v in communication_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.communications.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    updated_communication = await db.communications.find_one({"_id": object_id})
    updated_communication = convert_objectid(updated_communication)
    return CommunicationResponse(**updated_communication)

@router.delete("/{communication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_communication(communication_id: str, db=Depends(get_database)):
    """Delete a communication"""
    try:
        object_id = ObjectId(communication_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid communication ID")
    
    # Get the communication first to remove from plaintiff's history
    communication = await db.communications.find_one({"_id": object_id})
    if communication and communication.get("plaintiffId"):
        await db.plaintiffs.update_one(
            {"_id": ObjectId(communication["plaintiffId"])},
            {"$pull": {"communicationHistory": communication_id}}
        )
    
    result = await db.communications.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Communication not found")

@router.post("/{communication_id}/send")
async def send_communication(communication_id: str, db=Depends(get_database)):
    """Mark communication as sent (placeholder for actual sending logic)"""
    try:
        object_id = ObjectId(communication_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid communication ID")
    
    # Update status to sent
    result = await db.communications.update_one(
        {"_id": object_id},
        {"$set": {
            "status": "Sent",
            "updatedAt": datetime.utcnow()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    # Here you would implement actual email/SMS sending logic
    # For now, just return success
    return {"success": True, "message": "Communication sent successfully"}
