from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, date as date_type
from enum import Enum

class TreatmentType(str, Enum):
    EMERGENCY = "Emergency"
    HOSPITAL = "Hospital"
    OUTPATIENT = "Outpatient"
    PHYSICAL_THERAPY = "Physical Therapy"
    SPECIALIST = "Specialist"
    DIAGNOSTIC = "Diagnostic"
    SURGERY = "Surgery"
    FOLLOW_UP = "Follow-up"
    PAIN_MANAGEMENT = "Pain Management"
    MENTAL_HEALTH = "Mental Health"

class MedicalRecordStatus(str, Enum):
    REQUESTED = "Requested"
    RECEIVED = "Received"
    PENDING_REVIEW = "Pending Review"
    REVIEWED = "Reviewed"
    INCOMPLETE = "Incomplete"
    MISSING = "Missing"

class InjuryType(str, Enum):
    HEAD_INJURY = "Head Injury"
    NECK_INJURY = "Neck Injury"
    BACK_INJURY = "Back Injury"
    SPINAL_CORD = "Spinal Cord"
    BROKEN_BONES = "Broken Bones"
    SOFT_TISSUE = "Soft Tissue"
    BURNS = "Burns"
    INTERNAL_INJURY = "Internal Injury"
    AMPUTATION = "Amputation"
    SCARRING = "Scarring"
    PSYCHOLOGICAL = "Psychological"
    OTHER = "Other"

class MedicalRecordBase(BaseModel):
    plaintiffId: str
    providerId: str  # Medical provider ID
    treatmentDate: date_type
    treatmentType: TreatmentType
    status: MedicalRecordStatus = MedicalRecordStatus.REQUESTED
    
    # Treatment details
    diagnosis: Optional[str] = None
    treatmentDescription: Optional[str] = None
    injuries: Optional[List[InjuryType]] = None
    injuryDescription: Optional[str] = None
    
    # Costs
    totalCost: Optional[float] = Field(None, ge=0)
    insurancePaid: Optional[float] = Field(None, ge=0)
    patientPaid: Optional[float] = Field(None, ge=0)
    outstandingBalance: Optional[float] = Field(None, ge=0)
    
    # Providers and facilities
    facilityName: str
    facilityAddress: Optional[str] = None
    treatingPhysician: Optional[str] = None
    physicianSpecialty: Optional[str] = None
    
    # Record details
    recordsReceived: bool = False
    recordsRequestDate: Optional[date_type] = None
    recordsReceivedDate: Optional[date_type] = None
    pageCount: Optional[int] = Field(None, ge=0)
    
    # Analysis
    relatedToIncident: Optional[bool] = None
    preExistingCondition: Optional[bool] = None
    permanentImpairment: Optional[bool] = None
    futureCarePredicted: Optional[bool] = None
    
    notes: Optional[str] = None
    reviewNotes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    treatmentDate: Optional[date_type] = None
    treatmentType: Optional[TreatmentType] = None
    status: Optional[MedicalRecordStatus] = None
    diagnosis: Optional[str] = None
    treatmentDescription: Optional[str] = None
    injuries: Optional[List[InjuryType]] = None
    injuryDescription: Optional[str] = None
    totalCost: Optional[float] = Field(None, ge=0)
    insurancePaid: Optional[float] = Field(None, ge=0)
    patientPaid: Optional[float] = Field(None, ge=0)
    outstandingBalance: Optional[float] = Field(None, ge=0)
    facilityName: Optional[str] = None
    facilityAddress: Optional[str] = None
    treatingPhysician: Optional[str] = None
    physicianSpecialty: Optional[str] = None
    recordsReceived: Optional[bool] = None
    recordsRequestDate: Optional[date_type] = None
    recordsReceivedDate: Optional[date_type] = None
    pageCount: Optional[int] = Field(None, ge=0)
    relatedToIncident: Optional[bool] = None
    preExistingCondition: Optional[bool] = None
    permanentImpairment: Optional[bool] = None
    futureCarePredicted: Optional[bool] = None
    notes: Optional[str] = None
    reviewNotes: Optional[str] = None

class MedicalRecordInDB(MedicalRecordBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    documents: List[str] = []  # Document IDs for medical records
    bills: List[str] = []  # Medical bill IDs

    class Config:
        populate_by_name = True

class MedicalRecordResponse(MedicalRecordInDB):
    pass

# Medical Provider Model
class ProviderType(str, Enum):
    HOSPITAL = "Hospital"
    CLINIC = "Clinic"
    PRIVATE_PRACTICE = "Private Practice"
    URGENT_CARE = "Urgent Care"
    IMAGING_CENTER = "Imaging Center"
    PHYSICAL_THERAPY = "Physical Therapy"
    LABORATORY = "Laboratory"
    PHARMACY = "Pharmacy"
    MENTAL_HEALTH = "Mental Health"

class MedicalProviderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    providerType: ProviderType
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    fax: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    website: Optional[str] = None
    
    # Contact person for records requests
    recordsContactName: Optional[str] = None
    recordsContactPhone: Optional[str] = None
    recordsContactEmail: Optional[str] = None
    
    # Provider details
    npiNumber: Optional[str] = None  # National Provider Identifier
    taxId: Optional[str] = None
    licenseNumber: Optional[str] = None
    
    notes: Optional[str] = None
    isActive: bool = True

class MedicalProviderCreate(MedicalProviderBase):
    pass

class MedicalProviderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    providerType: Optional[ProviderType] = None
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    fax: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    website: Optional[str] = None
    recordsContactName: Optional[str] = None
    recordsContactPhone: Optional[str] = None
    recordsContactEmail: Optional[str] = None
    npiNumber: Optional[str] = None
    taxId: Optional[str] = None
    licenseNumber: Optional[str] = None
    notes: Optional[str] = None
    isActive: Optional[bool] = None

class MedicalProviderInDB(MedicalProviderBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    medicalRecords: List[str] = []  # Medical record IDs

    class Config:
        populate_by_name = True

class MedicalProviderResponse(MedicalProviderInDB):
    pass

# Medical Bill Model
class BillStatus(str, Enum):
    PENDING = "Pending"
    PAID = "Paid"
    PARTIAL_PAYMENT = "Partial Payment"
    DISPUTED = "Disputed"
    WRITTEN_OFF = "Written Off"
    IN_COLLECTIONS = "In Collections"

class MedicalBillBase(BaseModel):
    medicalRecordId: str
    plaintiffId: str
    providerId: str
    
    billDate: date_type
    serviceDate: date_type
    dueDate: Optional[date_type] = None
    
    # Financial details
    totalAmount: float = Field(..., gt=0)
    insurancePayment: Optional[float] = Field(None, ge=0)
    patientPayment: Optional[float] = Field(None, ge=0)
    adjustments: Optional[float] = Field(None, ge=0)
    remainingBalance: Optional[float] = Field(None, ge=0)
    
    status: BillStatus = BillStatus.PENDING
    
    # Bill details
    billNumber: Optional[str] = None
    procedureCodes: Optional[List[str]] = None
    diagnosisCodes: Optional[List[str]] = None
    description: Optional[str] = None
    
    # Lien information
    isLien: bool = False
    lienAmount: Optional[float] = Field(None, ge=0)
    lienHolderInfo: Optional[Dict[str, str]] = None
    
    notes: Optional[str] = None

class MedicalBillCreate(MedicalBillBase):
    pass

class MedicalBillUpdate(BaseModel):
    billDate: Optional[date_type] = None
    serviceDate: Optional[date_type] = None
    dueDate: Optional[date_type] = None
    totalAmount: Optional[float] = Field(None, gt=0)
    insurancePayment: Optional[float] = Field(None, ge=0)
    patientPayment: Optional[float] = Field(None, ge=0)
    adjustments: Optional[float] = Field(None, ge=0)
    remainingBalance: Optional[float] = Field(None, ge=0)
    status: Optional[BillStatus] = None
    billNumber: Optional[str] = None
    procedureCodes: Optional[List[str]] = None
    diagnosisCodes: Optional[List[str]] = None
    description: Optional[str] = None
    isLien: Optional[bool] = None
    lienAmount: Optional[float] = Field(None, ge=0)
    lienHolderInfo: Optional[Dict[str, str]] = None
    notes: Optional[str] = None

class MedicalBillInDB(MedicalBillBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    documents: List[str] = []  # Document IDs for bill documents

    class Config:
        populate_by_name = True

class MedicalBillResponse(MedicalBillInDB):
    pass
