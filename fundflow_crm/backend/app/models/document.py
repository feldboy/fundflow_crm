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
    plaintiffId: str
    documentType: DocumentType
    fileName: str
    storagePath: Optional[str] = None  # S3 link or file path
    status: DocumentStatus = DocumentStatus.REQUESTED
    extractedInfo: Optional[Dict[str, Any]] = None
    reviewNotes: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    fileName: Optional[str] = None
    storagePath: Optional[str] = None
    status: Optional[DocumentStatus] = None
    extractedInfo: Optional[Dict[str, Any]] = None
    reviewNotes: Optional[str] = None

class DocumentInDB(DocumentBase):
    id: str = Field(..., alias="_id")
    uploadTimestamp: datetime
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class DocumentResponse(DocumentInDB):
    pass
