from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class LawFirmBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    website: Optional[str] = None
    notes: Optional[str] = None

class LawFirmCreate(LawFirmBase):
    pass

class LawFirmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    address: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    website: Optional[str] = None
    notes: Optional[str] = None

class LawFirmInDB(LawFirmBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    employees: List[str] = []  # Employee IDs
    plaintiffs: List[str] = []  # Plaintiff IDs

    class Config:
        populate_by_name = True

class LawFirmResponse(LawFirmInDB):
    pass
