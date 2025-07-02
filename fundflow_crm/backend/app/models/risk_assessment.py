from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class AssessmentStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    REQUIRES_REVIEW = "Requires Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class RiskFactor(str, Enum):
    CASE_STRENGTH = "Case Strength"
    VENUE = "Venue"
    OPPOSING_COUNSEL = "Opposing Counsel"
    INSURANCE_COVERAGE = "Insurance Coverage"
    LIABILITY = "Liability"
    DAMAGES = "Damages"
    PLAINTIFF_CREDIBILITY = "Plaintiff Credibility"
    MEDICAL_TREATMENT = "Medical Treatment"
    TIMELINE = "Timeline"
    LEGAL_PRECEDENT = "Legal Precedent"

class RiskAssessmentBase(BaseModel):
    plaintiffId: str
    fundingId: Optional[str] = None
    assessorId: str  # Employee ID who performed assessment
    overallRiskLevel: RiskLevel
    riskScore: float = Field(..., ge=0, le=100)  # Overall risk score 0-100
    status: AssessmentStatus = AssessmentStatus.PENDING
    
    # Individual risk factors with scores
    caseStrengthScore: Optional[float] = Field(None, ge=0, le=100)
    venueScore: Optional[float] = Field(None, ge=0, le=100)
    liabilityScore: Optional[float] = Field(None, ge=0, le=100)
    damagesScore: Optional[float] = Field(None, ge=0, le=100)
    
    # Risk factors analysis
    riskFactors: Dict[str, Any] = {}  # Detailed risk analysis
    mitigatingFactors: Optional[List[str]] = None
    aggravatingFactors: Optional[List[str]] = None
    
    # Recommendations
    recommendedFunding: Optional[bool] = None
    maxRecommendedAmount: Optional[float] = Field(None, ge=0)
    recommendedTerms: Optional[Dict[str, Any]] = None
    
    # Analysis details
    caseAnalysis: Optional[str] = None
    medicalAnalysis: Optional[str] = None
    legalAnalysis: Optional[str] = None
    financialAnalysis: Optional[str] = None
    
    # AI-generated insights
    aiInsights: Optional[Dict[str, Any]] = None
    aiConfidenceScore: Optional[float] = Field(None, ge=0, le=100)
    
    notes: Optional[str] = None

class RiskAssessmentCreate(RiskAssessmentBase):
    pass

class RiskAssessmentUpdate(BaseModel):
    assessorId: Optional[str] = None
    overallRiskLevel: Optional[RiskLevel] = None
    riskScore: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[AssessmentStatus] = None
    caseStrengthScore: Optional[float] = Field(None, ge=0, le=100)
    venueScore: Optional[float] = Field(None, ge=0, le=100)
    liabilityScore: Optional[float] = Field(None, ge=0, le=100)
    damagesScore: Optional[float] = Field(None, ge=0, le=100)
    riskFactors: Optional[Dict[str, Any]] = None
    mitigatingFactors: Optional[List[str]] = None
    aggravatingFactors: Optional[List[str]] = None
    recommendedFunding: Optional[bool] = None
    maxRecommendedAmount: Optional[float] = Field(None, ge=0)
    recommendedTerms: Optional[Dict[str, Any]] = None
    caseAnalysis: Optional[str] = None
    medicalAnalysis: Optional[str] = None
    legalAnalysis: Optional[str] = None
    financialAnalysis: Optional[str] = None
    aiInsights: Optional[Dict[str, Any]] = None
    aiConfidenceScore: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None

class RiskAssessmentInDB(RiskAssessmentBase):
    id: str = Field(..., alias="_id")
    assessmentDate: datetime
    completedDate: Optional[datetime] = None
    reviewedDate: Optional[datetime] = None
    reviewedById: Optional[str] = None  # Employee ID of reviewer
    version: int = 1  # Version number for tracking changes
    createdAt: datetime
    updatedAt: datetime
    documents: List[str] = []  # Document IDs used in assessment

    class Config:
        populate_by_name = True

class RiskAssessmentResponse(RiskAssessmentInDB):
    pass

# Model for tracking risk assessment criteria and weights
class RiskCriteriaBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: RiskFactor
    weight: float = Field(..., ge=0, le=1)  # Weight in overall score calculation
    isActive: bool = True
    evaluationGuidelines: Optional[str] = None

class RiskCriteriaCreate(RiskCriteriaBase):
    pass

class RiskCriteriaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[RiskFactor] = None
    weight: Optional[float] = Field(None, ge=0, le=1)
    isActive: Optional[bool] = None
    evaluationGuidelines: Optional[str] = None

class RiskCriteriaInDB(RiskCriteriaBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    createdById: str  # Employee ID who created criteria

    class Config:
        populate_by_name = True

class RiskCriteriaResponse(RiskCriteriaInDB):
    pass
