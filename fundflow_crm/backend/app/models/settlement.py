from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date as date_type
from enum import Enum

class SettlementStatus(str, Enum):
    NEGOTIATING = "Negotiating"
    OFFER_RECEIVED = "Offer Received"
    COUNTER_OFFERED = "Counter Offered"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    MEDIATION = "Mediation"
    ARBITRATION = "Arbitration"
    LITIGATION = "Litigation"
    SETTLED = "Settled"
    TRIAL = "Trial"
    APPEAL = "Appeal"
    CLOSED = "Closed"

class SettlementType(str, Enum):
    LUMP_SUM = "Lump Sum"
    STRUCTURED = "Structured"
    PARTIAL = "Partial"
    INTERIM = "Interim"

class SettlementBase(BaseModel):
    plaintiffId: str
    fundingId: Optional[str] = None
    caseNumber: Optional[str] = None
    status: SettlementStatus = SettlementStatus.NEGOTIATING
    settlementType: Optional[SettlementType] = None
    
    # Financial details
    demandAmount: Optional[float] = Field(None, gt=0)
    currentOffer: Optional[float] = Field(None, ge=0)
    expectedSettlement: Optional[float] = Field(None, ge=0)
    finalSettlementAmount: Optional[float] = Field(None, ge=0)
    
    # Attorney and legal details
    attorneyFeePercentage: Optional[float] = Field(None, ge=0, le=100)
    attorneyFeeAmount: Optional[float] = Field(None, ge=0)
    legalCosts: Optional[float] = Field(None, ge=0)
    medicalLiens: Optional[float] = Field(None, ge=0)
    otherLiens: Optional[float] = Field(None, ge=0)
    
    # Net to plaintiff calculation
    grossSettlement: Optional[float] = Field(None, ge=0)
    totalDeductions: Optional[float] = Field(None, ge=0)
    netToPlaintiff: Optional[float] = Field(None, ge=0)
    
    # Funding repayment
    principalRepayment: Optional[float] = Field(None, ge=0)
    interestRepayment: Optional[float] = Field(None, ge=0)
    feesRepayment: Optional[float] = Field(None, ge=0)
    totalRepayment: Optional[float] = Field(None, ge=0)
    
    # Timeline
    negotiationStartDate: Optional[date_type] = None
    expectedSettlementDate: Optional[date_type] = None
    settlementDate: Optional[date_type] = None
    distributionDate: Optional[date_type] = None
    
    # Additional details
    insuranceCarrier: Optional[str] = None
    opposingCounsel: Optional[str] = None
    mediator: Optional[str] = None
    judge: Optional[str] = None
    courtVenue: Optional[str] = None
    
    notes: Optional[str] = None
    confidentialityTerms: Optional[str] = None
    releaseTerms: Optional[str] = None

class SettlementCreate(SettlementBase):
    pass

class SettlementUpdate(BaseModel):
    status: Optional[SettlementStatus] = None
    settlementType: Optional[SettlementType] = None
    demandAmount: Optional[float] = Field(None, gt=0)
    currentOffer: Optional[float] = Field(None, ge=0)
    expectedSettlement: Optional[float] = Field(None, ge=0)
    finalSettlementAmount: Optional[float] = Field(None, ge=0)
    attorneyFeePercentage: Optional[float] = Field(None, ge=0, le=100)
    attorneyFeeAmount: Optional[float] = Field(None, ge=0)
    legalCosts: Optional[float] = Field(None, ge=0)
    medicalLiens: Optional[float] = Field(None, ge=0)
    otherLiens: Optional[float] = Field(None, ge=0)
    grossSettlement: Optional[float] = Field(None, ge=0)
    totalDeductions: Optional[float] = Field(None, ge=0)
    netToPlaintiff: Optional[float] = Field(None, ge=0)
    principalRepayment: Optional[float] = Field(None, ge=0)
    interestRepayment: Optional[float] = Field(None, ge=0)
    feesRepayment: Optional[float] = Field(None, ge=0)
    totalRepayment: Optional[float] = Field(None, ge=0)
    negotiationStartDate: Optional[date_type] = None
    expectedSettlementDate: Optional[date_type] = None
    settlementDate: Optional[date_type] = None
    distributionDate: Optional[date_type] = None
    insuranceCarrier: Optional[str] = None
    opposingCounsel: Optional[str] = None
    mediator: Optional[str] = None
    judge: Optional[str] = None
    courtVenue: Optional[str] = None
    notes: Optional[str] = None
    confidentialityTerms: Optional[str] = None
    releaseTerms: Optional[str] = None

class SettlementInDB(SettlementBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    documents: List[str] = []  # Document IDs
    offers: List[str] = []  # Settlement offer IDs

    class Config:
        populate_by_name = True

class SettlementResponse(SettlementInDB):
    pass

# Model for tracking individual settlement offers
class OfferDirection(str, Enum):
    INCOMING = "Incoming"  # From defendant/insurance
    OUTGOING = "Outgoing"  # From plaintiff/attorney

class OfferStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    COUNTERED = "Countered"
    EXPIRED = "Expired"
    WITHDRAWN = "Withdrawn"

class SettlementOfferBase(BaseModel):
    settlementId: str
    direction: OfferDirection
    amount: float = Field(..., gt=0)
    status: OfferStatus = OfferStatus.PENDING
    offerDate: date_type
    expirationDate: Optional[date_type] = None
    terms: Optional[str] = None
    conditions: Optional[List[str]] = None
    confidential: bool = False
    notes: Optional[str] = None

class SettlementOfferCreate(SettlementOfferBase):
    pass

class SettlementOfferUpdate(BaseModel):
    status: Optional[OfferStatus] = None
    amount: Optional[float] = Field(None, gt=0)
    expirationDate: Optional[date_type] = None
    terms: Optional[str] = None
    conditions: Optional[List[str]] = None
    confidential: Optional[bool] = None
    notes: Optional[str] = None

class SettlementOfferInDB(SettlementOfferBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    respondedDate: Optional[datetime] = None

    class Config:
        populate_by_name = True

class SettlementOfferResponse(SettlementOfferInDB):
    pass
