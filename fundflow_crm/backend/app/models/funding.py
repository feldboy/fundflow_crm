from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class FundingStatus(str, Enum):
    PENDING_REVIEW = "Pending Review"
    APPROVED = "Approved"
    DECLINED = "Declined"
    DISBURSED = "Disbursed"
    REPAID = "Repaid"
    DEFAULTED = "Defaulted"
    CANCELLED = "Cancelled"

class FundingType(str, Enum):
    PRE_SETTLEMENT = "Pre-Settlement"
    POST_SETTLEMENT = "Post-Settlement"
    ATTORNEY_FUNDING = "Attorney Funding"
    MEDICAL_LIEN = "Medical Lien"

class PaymentMethod(str, Enum):
    ACH = "ACH"
    WIRE_TRANSFER = "Wire Transfer"
    CHECK = "Check"
    CASHIERS_CHECK = "Cashiers Check"

class FundingBase(BaseModel):
    plaintiffId: str
    requestedAmount: float = Field(..., gt=0)
    approvedAmount: Optional[float] = Field(None, ge=0)
    disbursedAmount: Optional[float] = Field(None, ge=0)
    fundingType: FundingType = FundingType.PRE_SETTLEMENT
    status: FundingStatus = FundingStatus.PENDING_REVIEW
    interestRate: Optional[float] = Field(None, ge=0, le=100)  # Annual percentage
    fees: Optional[Dict[str, float]] = None  # Various fees (origination, processing, etc.)
    termMonths: Optional[int] = Field(None, gt=0)
    purpose: Optional[str] = None  # What the funding is for
    paymentMethod: Optional[PaymentMethod] = None
    bankAccountInfo: Optional[Dict[str, str]] = None  # Encrypted bank details
    contractUrl: Optional[str] = None
    underwriterNotes: Optional[str] = None
    riskAssessment: Optional[Dict[str, Any]] = None
    collateral: Optional[str] = None

class FundingCreate(FundingBase):
    pass

class FundingUpdate(BaseModel):
    requestedAmount: Optional[float] = Field(None, gt=0)
    approvedAmount: Optional[float] = Field(None, ge=0)
    disbursedAmount: Optional[float] = Field(None, ge=0)
    status: Optional[FundingStatus] = None
    interestRate: Optional[float] = Field(None, ge=0, le=100)
    fees: Optional[Dict[str, float]] = None
    termMonths: Optional[int] = Field(None, gt=0)
    purpose: Optional[str] = None
    paymentMethod: Optional[PaymentMethod] = None
    bankAccountInfo: Optional[Dict[str, str]] = None
    contractUrl: Optional[str] = None
    underwriterNotes: Optional[str] = None
    riskAssessment: Optional[Dict[str, Any]] = None
    collateral: Optional[str] = None

class FundingInDB(FundingBase):
    id: str = Field(..., alias="_id")
    applicationDate: datetime
    approvalDate: Optional[datetime] = None
    disbursementDate: Optional[datetime] = None
    repaymentDate: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    documents: List[str] = []  # Document IDs
    transactions: List[str] = []  # Transaction IDs

    class Config:
        populate_by_name = True

class FundingResponse(FundingInDB):
    pass

# Transaction Model for tracking payments and disbursements
class TransactionType(str, Enum):
    DISBURSEMENT = "Disbursement"
    REPAYMENT = "Repayment"
    FEE = "Fee"
    INTEREST = "Interest"
    REFUND = "Refund"

class TransactionStatus(str, Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"

class TransactionBase(BaseModel):
    fundingId: str
    type: TransactionType
    amount: float = Field(..., gt=0)
    status: TransactionStatus = TransactionStatus.PENDING
    description: Optional[str] = None
    reference: Optional[str] = None  # Bank reference or check number
    paymentMethod: Optional[PaymentMethod] = None
    metadata: Optional[Dict[str, Any]] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    description: Optional[str] = None
    reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class TransactionInDB(TransactionBase):
    id: str = Field(..., alias="_id")
    transactionDate: datetime
    processedDate: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class TransactionResponse(TransactionInDB):
    pass
