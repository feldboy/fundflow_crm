from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EmployeeRole(str, Enum):
    LAWYER = "Lawyer"
    PARALEGAL = "Paralegal"
    ADMIN = "Admin"
    STAFF = "Staff"

class EmployeeBase(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    role: EmployeeRole
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    lawFirmId: Optional[str] = None
    notes: Optional[str] = None
    isActive: bool = True

class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=6)

class EmployeeUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=100)
    lastName: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[EmployeeRole] = None
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    lawFirmId: Optional[str] = None
    notes: Optional[str] = None
    isActive: Optional[bool] = None

class EmployeeInDB(EmployeeBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    hashedPassword: str
    communicationHistory: List[str] = []  # Communication IDs

    class Config:
        populate_by_name = True

class EmployeeResponse(BaseModel):
    id: str = Field(..., alias="_id")
    firstName: str
    lastName: str
    role: EmployeeRole
    email: str
    phone: Optional[str]
    lawFirmId: Optional[str]
    notes: Optional[str]
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
