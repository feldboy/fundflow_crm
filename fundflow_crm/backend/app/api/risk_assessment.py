from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.risk_assessment import (
    RiskAssessmentCreate, RiskAssessmentUpdate, RiskAssessmentResponse,
    RiskCriteriaCreate, RiskCriteriaUpdate, RiskCriteriaResponse
)
from ..core.database import get_database
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/risk-assessments", tags=["risk-assessment"])

@router.post("/", response_model=RiskAssessmentResponse)
async def create_risk_assessment(
    assessment: RiskAssessmentCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new risk assessment"""
    assessment_dict = assessment.dict()
    assessment_dict["assessmentDate"] = datetime.utcnow()
    assessment_dict["createdAt"] = datetime.utcnow()
    assessment_dict["updatedAt"] = datetime.utcnow()
    assessment_dict["documents"] = []
    assessment_dict["version"] = 1
    
    result = db.risk_assessments.insert_one(assessment_dict)
    assessment_dict["_id"] = str(result.inserted_id)
    
    return RiskAssessmentResponse(**assessment_dict)

@router.get("/", response_model=List[RiskAssessmentResponse])
async def get_risk_assessments(
    plaintiff_id: Optional[str] = Query(None),
    funding_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get risk assessments with optional filtering"""
    query = {}
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    if funding_id:
        query["fundingId"] = funding_id
    if status:
        query["status"] = status
    if risk_level:
        query["overallRiskLevel"] = risk_level
    
    cursor = db.risk_assessments.find(query).skip(skip).limit(limit)
    assessments = []
    
    for assessment in cursor:
        assessment["_id"] = str(assessment["_id"])
        assessments.append(RiskAssessmentResponse(**assessment))
    
    return assessments

@router.get("/{assessment_id}", response_model=RiskAssessmentResponse)
async def get_risk_assessment(
    assessment_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific risk assessment"""
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(status_code=400, detail="Invalid assessment ID")
    
    assessment = db.risk_assessments.find_one({"_id": ObjectId(assessment_id)})
    if not assessment:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    
    assessment["_id"] = str(assessment["_id"])
    return RiskAssessmentResponse(**assessment)

@router.put("/{assessment_id}", response_model=RiskAssessmentResponse)
async def update_risk_assessment(
    assessment_id: str,
    assessment_update: RiskAssessmentUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a risk assessment"""
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(status_code=400, detail="Invalid assessment ID")
    
    update_data = {k: v for k, v in assessment_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    # Increment version if status is changing to completed
    if update_data.get("status") == "Completed":
        update_data["completedDate"] = datetime.utcnow()
        # Increment version
        current_assessment = db.risk_assessments.find_one({"_id": ObjectId(assessment_id)})
        if current_assessment:
            update_data["version"] = current_assessment.get("version", 1) + 1
    
    result = db.risk_assessments.update_one(
        {"_id": ObjectId(assessment_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    
    updated_assessment = db.risk_assessments.find_one({"_id": ObjectId(assessment_id)})
    updated_assessment["_id"] = str(updated_assessment["_id"])
    
    return RiskAssessmentResponse(**updated_assessment)

@router.delete("/{assessment_id}")
async def delete_risk_assessment(
    assessment_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a risk assessment"""
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(status_code=400, detail="Invalid assessment ID")
    
    result = db.risk_assessments.delete_one({"_id": ObjectId(assessment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    
    return {"message": "Risk assessment deleted successfully"}

# Risk Criteria endpoints
@router.post("/criteria", response_model=RiskCriteriaResponse)
async def create_risk_criteria(
    criteria: RiskCriteriaCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create new risk assessment criteria"""
    criteria_dict = criteria.dict()
    criteria_dict["createdAt"] = datetime.utcnow()
    criteria_dict["updatedAt"] = datetime.utcnow()
    criteria_dict["createdById"] = current_user["id"]
    
    result = db.risk_criteria.insert_one(criteria_dict)
    criteria_dict["_id"] = str(result.inserted_id)
    
    return RiskCriteriaResponse(**criteria_dict)

@router.get("/criteria", response_model=List[RiskCriteriaResponse])
async def get_risk_criteria(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get risk assessment criteria"""
    query = {}
    if category:
        query["category"] = category
    if is_active is not None:
        query["isActive"] = is_active
    
    cursor = db.risk_criteria.find(query)
    criteria_list = []
    
    for criteria in cursor:
        criteria["_id"] = str(criteria["_id"])
        criteria_list.append(RiskCriteriaResponse(**criteria))
    
    return criteria_list

@router.put("/criteria/{criteria_id}", response_model=RiskCriteriaResponse)
async def update_risk_criteria(
    criteria_id: str,
    criteria_update: RiskCriteriaUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update risk assessment criteria"""
    if not ObjectId.is_valid(criteria_id):
        raise HTTPException(status_code=400, detail="Invalid criteria ID")
    
    update_data = {k: v for k, v in criteria_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    result = db.risk_criteria.update_one(
        {"_id": ObjectId(criteria_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Risk criteria not found")
    
    updated_criteria = db.risk_criteria.find_one({"_id": ObjectId(criteria_id)})
    updated_criteria["_id"] = str(updated_criteria["_id"])
    
    return RiskCriteriaResponse(**updated_criteria)
