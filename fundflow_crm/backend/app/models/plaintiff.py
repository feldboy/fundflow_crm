from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CaseType(str, Enum):
    AUTO_ACCIDENT = "Auto Accident"
    SLIP_AND_FALL = "Slip & Fall"
    MEDICAL_MALPRACTICE = "Medical Malpractice"
    WORKERS_COMPENSATION = "Workers Compensation"
    WORKPLACE_INJURY = "Workplace Injury"
    PRODUCT_LIABILITY = "Product Liability"
    DOG_BITE = "Dog Bite"
    MOTORCYCLE_ACCIDENT = "Motorcycle Accident"
    TRUCK_ACCIDENT = "Truck Accident"
    PERSONAL_INJURY = "Personal Injury"
    EMPLOYMENT_LAW = "Employment Law"
    OTHER = "Other"

class WorkflowStage(str, Enum):
    NEW_LEAD = "New Lead"
    INFO_GATHERING = "Info Gathering"
    UNDERWRITING = "Underwriting"
    OFFER_MADE = "Offer Made"
    CONTRACTED = "Contracted"
    DECLINED = "Declined"
    CANCELLED = "Cancelled"
    # Additional values found in database
    INITIAL_REVIEW = "Initial Review"
    MEDIATION = "Mediation"
    SETTLEMENT_NEGOTIATION = "Settlement Negotiation"
    DISCOVERY = "Discovery"
    ACTIVE_LITIGATION = "Active Litigation"

class PlaintiffBase(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    caseType: CaseType
    incidentDate: Optional[datetime] = None
    requestedAmount: Optional[float] = Field(None, gt=0)
    currentStage: WorkflowStage = WorkflowStage.NEW_LEAD
    lawFirmId: Optional[str] = None
    attorneyId: Optional[str] = None
    aiScore: Optional[float] = Field(None, ge=0, le=100)
    caseNotes: Optional[str] = None
    underwritingNotes: Optional[str] = None

class PlaintiffCreate(PlaintiffBase):
    pass

class PlaintiffUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=100)
    lastName: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    caseType: Optional[CaseType] = None
    incidentDate: Optional[datetime] = None
    requestedAmount: Optional[float] = Field(None, gt=0)
    currentStage: Optional[WorkflowStage] = None
    lawFirmId: Optional[str] = None
    attorneyId: Optional[str] = None
    aiScore: Optional[float] = Field(None, ge=0, le=100)
    caseNotes: Optional[str] = None
    underwritingNotes: Optional[str] = None

class PlaintiffInDB(PlaintiffBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    documents: List[str] = []  # Document IDs
    communicationHistory: List[str] = []  # Communication IDs
    funding: List[str] = [] # Funding IDs
    risk_assessments: List[str] = [] # Risk Assessment IDs
    settlements: List[str] = [] # Settlement IDs
    tasks: List[str] = [] # Task IDs
    medical: List[str] = [] # Medical IDs

    class Config:
        populate_by_name = True

class PlaintiffResponse(PlaintiffInDB):
    pass
