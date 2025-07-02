from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import csv
import io
import json

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
            elif key == "documents" and isinstance(value, list):
                # Convert document objects to document IDs (strings)
                # For compatibility with PlaintiffResponse model
                item[key] = [str(doc.get("_id", f"doc_{i}")) if isinstance(doc, dict) else str(doc) 
                           for i, doc in enumerate(value)]
            elif key == "communicationHistory" and isinstance(value, list):
                # Convert communication objects to communication IDs (strings) 
                item[key] = [str(comm.get("_id", f"comm_{i}")) if isinstance(comm, dict) else str(comm)
                           for i, comm in enumerate(value)]
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
    from app.core.database import use_mock_db
    
    # Handle both ObjectId and string IDs depending on database type
    if use_mock_db:
        query_id = {"_id": plaintiff_id}
    else:
        try:
            object_id = ObjectId(plaintiff_id)
            query_id = {"_id": object_id}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid plaintiff ID")
    
    update_data = {k: v for k, v in plaintiff_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.plaintiffs.update_one(
        query_id,
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plaintiff not found")
    
    updated_plaintiff = await db.plaintiffs.find_one(query_id)
    updated_plaintiff = convert_objectid(updated_plaintiff)
    return PlaintiffResponse(**updated_plaintiff)

@router.delete("/{plaintiff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plaintiff(plaintiff_id: str, db=Depends(get_database)):
    """Delete a plaintiff"""
    from app.core.database import use_mock_db
    
    # Handle both ObjectId and string IDs depending on database type
    if use_mock_db:
        query_id = {"_id": plaintiff_id}
    else:
        try:
            object_id = ObjectId(plaintiff_id)
            query_id = {"_id": object_id}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid plaintiff ID")
    
    result = await db.plaintiffs.delete_one(query_id)
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plaintiff not found")

@router.get("/export")
async def export_plaintiffs(
    format: str = Query("csv", description="Export format: csv or json"),
    status_filter: Optional[str] = None,
    stage_filter: Optional[str] = None,
    db=Depends(get_database)
):
    """Export plaintiffs data in CSV or JSON format"""
    
    # Build query filter
    query = {}
    if status_filter:
        query["status"] = status_filter
    if stage_filter:
        query["workflowStage"] = stage_filter
    
    try:
        # Get all plaintiffs matching the filter
        cursor = db.plaintiffs.find(query)
        plaintiffs = await cursor.to_list(length=None)
        
        # Convert ObjectIds and clean data
        cleaned_plaintiffs = []
        for plaintiff in plaintiffs:
            clean_plaintiff = convert_objectid(plaintiff)
            # Remove sensitive or complex fields for export
            export_plaintiff = {
                "id": clean_plaintiff.get("_id", ""),
                "firstName": clean_plaintiff.get("firstName", ""),
                "lastName": clean_plaintiff.get("lastName", ""),
                "email": clean_plaintiff.get("email", ""),
                "phone": clean_plaintiff.get("phone", ""),
                "address": clean_plaintiff.get("address", ""),
                "caseType": clean_plaintiff.get("caseType", ""),
                "incidentDate": clean_plaintiff.get("incidentDate", ""),
                "requestedAmount": clean_plaintiff.get("requestedAmount", ""),
                "status": clean_plaintiff.get("status", ""),
                "workflowStage": clean_plaintiff.get("workflowStage", ""),
                "lawFirmName": clean_plaintiff.get("lawFirmName", ""),
                "createdAt": clean_plaintiff.get("createdAt", ""),
                "updatedAt": clean_plaintiff.get("updatedAt", "")
            }
            cleaned_plaintiffs.append(export_plaintiff)
        
        if format.lower() == "json":
            # Return JSON
            json_str = json.dumps(cleaned_plaintiffs, indent=2, default=str)
            return StreamingResponse(
                io.BytesIO(json_str.encode()),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=plaintiffs_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"}
            )
        
        else:
            # Return CSV (default)
            output = io.StringIO()
            if cleaned_plaintiffs:
                writer = csv.DictWriter(output, fieldnames=cleaned_plaintiffs[0].keys())
                writer.writeheader()
                writer.writerows(cleaned_plaintiffs)
            
            csv_content = output.getvalue()
            output.close()
            
            return StreamingResponse(
                io.BytesIO(csv_content.encode()),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=plaintiffs_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
            )
            
    except Exception as e:
        print(f"Export error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export data: {str(e)}"
        )

@router.get("/debug/raw")
async def get_plaintiffs_raw(db=Depends(get_database)):
    """Debug endpoint to see raw plaintiff data"""
    try:
        cursor = db.plaintiffs.find({}).limit(1)
        plaintiffs = await cursor.to_list(length=1)
        if plaintiffs:
            raw_data = convert_objectid(plaintiffs[0])
            return {"raw_data": raw_data, "type": type(raw_data).__name__}
        else:
            return {"error": "No plaintiffs found"}
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

@router.get("/debug/validation")
async def test_plaintiff_validation(db=Depends(get_database)):
    """Debug endpoint to test PlaintiffResponse validation"""
    try:
        cursor = db.plaintiffs.find({}).limit(1)
        plaintiffs = await cursor.to_list(length=1)
        if plaintiffs:
            raw_data = convert_objectid(plaintiffs[0])
            try:
                # Try to create PlaintiffResponse
                plaintiff_response = PlaintiffResponse(**raw_data)
                return {"success": True, "data": plaintiff_response.dict()}
            except Exception as validation_error:
                return {
                    "success": False,
                    "validation_error": str(validation_error),
                    "raw_data": raw_data
                }
        else:
            return {"error": "No plaintiffs found"}
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

@router.get("/debug/list")
async def test_plaintiff_list(db=Depends(get_database)):
    """Debug endpoint to test list processing"""
    try:
        cursor = db.plaintiffs.find({}).limit(2)
        plaintiffs = await cursor.to_list(length=2)
        
        results = []
        for i, plaintiff in enumerate(plaintiffs):
            try:
                converted = convert_objectid(plaintiff)
                plaintiff_response = PlaintiffResponse(**converted)
                results.append({
                    "index": i,
                    "success": True,
                    "data": plaintiff_response.dict()
                })
            except Exception as e:
                results.append({
                    "index": i,
                    "success": False,
                    "error": str(e),
                    "raw_data": convert_objectid(plaintiff)
                })
        
        return {"results": results}
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

@router.get("/debug/record/{index}")
async def debug_specific_record(index: int, db=Depends(get_database)):
    """Debug a specific record by index"""
    try:
        cursor = db.plaintiffs.find({}).skip(index).limit(1)
        plaintiffs = await cursor.to_list(length=1)
        
        if not plaintiffs:
            return {"error": f"No record found at index {index}"}
        
        raw_data = convert_objectid(plaintiffs[0])
        try:
            plaintiff_response = PlaintiffResponse(**raw_data)
            return {
                "index": index,
                "success": True,
                "data": plaintiff_response.dict()
            }
        except Exception as validation_error:
            return {
                "index": index,
                "success": False,
                "validation_error": str(validation_error),
                "raw_data": raw_data
            }
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}
