from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    POLICE_REPORT = "Police Report"
    RETAINER = "Retainer"
    MEDICAL_RECORD = "Medical Record"
    INSURANCE_CORRESPONDENCE = "Insurance Correspondence"
    INCIDENT_REPORT = "Incident Report"
    CONTRACT = "Contract"
    OTHER = "Other"

class DocumentStatus(str, Enum):
    REQUESTED = "Requested"
    RECEIVED = "Received"
    REVIEWED = "Reviewed"
    MISSING = "Missing"

class DocumentBase(BaseModel):
    plaintiffId: Optional[str] = None
    documentType: str = "Other"  # Changed from enum to string for flexibility
    fileName: Optional[str] = None
    filename: Optional[str] = None  # Support both naming conventions
    originalName: Optional[str] = None
    storagePath: Optional[str] = None  # S3 link or file path
    fileId: Optional[str] = None
    contentType: Optional[str] = None
    size: Optional[int] = None
    status: str = "Requested"  # Changed from enum to string
    extractedInfo: Optional[Dict[str, Any]] = None
    reviewNotes: Optional[str] = None
    notes: Optional[str] = None
    storageMethod: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    fileName: Optional[str] = None
    filename: Optional[str] = None
    documentType: Optional[str] = None
    storagePath: Optional[str] = None
    status: Optional[str] = None
    extractedInfo: Optional[Dict[str, Any]] = None
    reviewNotes: Optional[str] = None
    notes: Optional[str] = None

class DocumentInDB(DocumentBase):
    id: Optional[str] = Field(None, alias="_id")
    uploadTimestamp: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

class DocumentResponse(DocumentInDB):
    pass
