from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.models.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.core.auth import get_password_hash

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

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate, db=Depends(get_database)):
    """Create a new employee"""
    # Check if email already exists
    existing_employee = await db.employees.find_one({"email": employee.email})
    if existing_employee:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    employee_dict = employee.dict()
    # Hash the password
    employee_dict["hashedPassword"] = get_password_hash(employee_dict.pop("password"))
    employee_dict["createdAt"] = datetime.utcnow()
    employee_dict["updatedAt"] = datetime.utcnow()
    employee_dict["communicationHistory"] = []
    
    result = await db.employees.insert_one(employee_dict)
    created_employee = await db.employees.find_one({"_id": result.inserted_id})
    
    if not created_employee:
        raise HTTPException(status_code=500, detail="Failed to create employee")
    
    created_employee = convert_objectid(created_employee)
    return EmployeeResponse(**created_employee)

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(skip: int = 0, limit: int = 100, db=Depends(get_database)):
    """Get all employees"""
    cursor = db.employees.find({}).skip(skip).limit(limit)
    employees = await cursor.to_list(length=limit)
    
    return [EmployeeResponse(**convert_objectid(emp)) for emp in employees]

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str, db=Depends(get_database)):
    """Get a specific employee by ID"""
    try:
        employee = await db.employees.find_one({"_id": ObjectId(employee_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    employee = convert_objectid(employee)
    return EmployeeResponse(**employee)

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(employee_id: str, employee_update: EmployeeUpdate, db=Depends(get_database)):
    """Update an employee"""
    try:
        object_id = ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    
    update_data = {k: v for k, v in employee_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Check if email is being updated and if it already exists
    if "email" in update_data:
        existing_employee = await db.employees.find_one({
            "email": update_data["email"],
            "_id": {"$ne": object_id}
        })
        if existing_employee:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.employees.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    updated_employee = await db.employees.find_one({"_id": object_id})
    updated_employee = convert_objectid(updated_employee)
    return EmployeeResponse(**updated_employee)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str, db=Depends(get_database)):
    """Delete an employee"""
    try:
        object_id = ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    
    result = await db.employees.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
