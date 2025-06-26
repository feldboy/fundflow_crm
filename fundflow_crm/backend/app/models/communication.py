from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CommunicationType(str, Enum):
    EMAIL = "Email"
    SMS = "SMS"
    CALL_LOG = "Call Log"

class CommunicationDirection(str, Enum):
    INCOMING = "Incoming"
    OUTGOING = "Outgoing"

class CommunicationStatus(str, Enum):
    SENT = "Sent"
    RECEIVED = "Received"
    PENDING_REVIEW = "Pending Review"
    FAILED = "Failed"
    DRAFT = "Draft"

class CommunicationBase(BaseModel):
    plaintiffId: str
    lawFirmId: Optional[str] = None
    employeeId: Optional[str] = None
    type: CommunicationType
    direction: CommunicationDirection
    subject: Optional[str] = None
    body: str
    status: CommunicationStatus = CommunicationStatus.DRAFT
    aiGenerated: bool = False
    approvedByStaffId: Optional[str] = None

class CommunicationCreate(CommunicationBase):
    pass

class CommunicationUpdate(BaseModel):
    subject: Optional[str] = None
    body: Optional[str] = None
    status: Optional[CommunicationStatus] = None
    approvedByStaffId: Optional[str] = None

class CommunicationInDB(CommunicationBase):
    id: str = Field(..., alias="_id")
    timestamp: datetime
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class CommunicationResponse(CommunicationInDB):
    pass
