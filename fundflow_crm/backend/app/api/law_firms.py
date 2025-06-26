from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.models.law_firm import LawFirmCreate, LawFirmUpdate, LawFirmResponse

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

@router.post("/", response_model=LawFirmResponse, status_code=status.HTTP_201_CREATED)
async def create_law_firm(law_firm: LawFirmCreate, db=Depends(get_database)):
    """Create a new law firm"""
    law_firm_dict = law_firm.dict()
    law_firm_dict["createdAt"] = datetime.utcnow()
    law_firm_dict["updatedAt"] = datetime.utcnow()
    law_firm_dict["employees"] = []
    law_firm_dict["plaintiffs"] = []
    
    result = await db.law_firms.insert_one(law_firm_dict)
    created_law_firm = await db.law_firms.find_one({"_id": result.inserted_id})
    
    if not created_law_firm:
        raise HTTPException(status_code=500, detail="Failed to create law firm")
    
    created_law_firm = convert_objectid(created_law_firm)
    return LawFirmResponse(**created_law_firm)

@router.get("/", response_model=List[LawFirmResponse])
async def get_law_firms(skip: int = 0, limit: int = 100, db=Depends(get_database)):
    """Get all law firms"""
    cursor = db.law_firms.find({}).skip(skip).limit(limit)
    law_firms = await cursor.to_list(length=limit)
    
    return [LawFirmResponse(**convert_objectid(lf)) for lf in law_firms]

@router.get("/{law_firm_id}", response_model=LawFirmResponse)
async def get_law_firm(law_firm_id: str, db=Depends(get_database)):
    """Get a specific law firm by ID"""
    try:
        law_firm = await db.law_firms.find_one({"_id": ObjectId(law_firm_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid law firm ID")
    
    if not law_firm:
        raise HTTPException(status_code=404, detail="Law firm not found")
    
    law_firm = convert_objectid(law_firm)
    return LawFirmResponse(**law_firm)

@router.put("/{law_firm_id}", response_model=LawFirmResponse)
async def update_law_firm(law_firm_id: str, law_firm_update: LawFirmUpdate, db=Depends(get_database)):
    """Update a law firm"""
    try:
        object_id = ObjectId(law_firm_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid law firm ID")
    
    update_data = {k: v for k, v in law_firm_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.law_firms.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Law firm not found")
    
    updated_law_firm = await db.law_firms.find_one({"_id": object_id})
    updated_law_firm = convert_objectid(updated_law_firm)
    return LawFirmResponse(**updated_law_firm)

@router.delete("/{law_firm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_law_firm(law_firm_id: str, db=Depends(get_database)):
    """Delete a law firm"""
    try:
        object_id = ObjectId(law_firm_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid law firm ID")
    
    result = await db.law_firms.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Law firm not found")
