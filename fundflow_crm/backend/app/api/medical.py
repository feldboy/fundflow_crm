from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.medical import (
    MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse,
    MedicalProviderCreate, MedicalProviderUpdate, MedicalProviderResponse,
    MedicalBillCreate, MedicalBillUpdate, MedicalBillResponse
)
from ..core.database import get_database
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/medical", tags=["medical"])

# Medical Records endpoints
@router.post("/records", response_model=MedicalRecordResponse)
async def create_medical_record(
    record: MedicalRecordCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new medical record"""
    record_dict = record.dict()
    record_dict["createdAt"] = datetime.utcnow()
    record_dict["updatedAt"] = datetime.utcnow()
    record_dict["documents"] = []
    record_dict["bills"] = []
    
    result = db.medical_records.insert_one(record_dict)
    record_dict["_id"] = str(result.inserted_id)
    
    return MedicalRecordResponse(**record_dict)

@router.get("/records", response_model=List[MedicalRecordResponse])
async def get_medical_records(
    plaintiff_id: Optional[str] = Query(None),
    provider_id: Optional[str] = Query(None),
    treatment_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get medical records with optional filtering"""
    query = {}
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    if provider_id:
        query["providerId"] = provider_id
    if treatment_type:
        query["treatmentType"] = treatment_type
    if status:
        query["status"] = status
    
    cursor = db.medical_records.find(query).skip(skip).limit(limit).sort("treatmentDate", -1)
    records = []
    
    for record in cursor:
        record["_id"] = str(record["_id"])
        records.append(MedicalRecordResponse(**record))
    
    return records

@router.get("/records/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(
    record_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific medical record"""
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=400, detail="Invalid record ID")
    
    record = db.medical_records.find_one({"_id": ObjectId(record_id)})
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    record["_id"] = str(record["_id"])
    return MedicalRecordResponse(**record)

@router.put("/records/{record_id}", response_model=MedicalRecordResponse)
async def update_medical_record(
    record_id: str,
    record_update: MedicalRecordUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a medical record"""
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=400, detail="Invalid record ID")
    
    update_data = {k: v for k, v in record_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    result = db.medical_records.update_one(
        {"_id": ObjectId(record_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    updated_record = db.medical_records.find_one({"_id": ObjectId(record_id)})
    updated_record["_id"] = str(updated_record["_id"])
    
    return MedicalRecordResponse(**updated_record)

@router.delete("/records/{record_id}")
async def delete_medical_record(
    record_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a medical record"""
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=400, detail="Invalid record ID")
    
    result = db.medical_records.delete_one({"_id": ObjectId(record_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    return {"message": "Medical record deleted successfully"}

# Medical Providers endpoints
@router.post("/providers", response_model=MedicalProviderResponse)
async def create_medical_provider(
    provider: MedicalProviderCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new medical provider"""
    provider_dict = provider.dict()
    provider_dict["createdAt"] = datetime.utcnow()
    provider_dict["updatedAt"] = datetime.utcnow()
    provider_dict["medicalRecords"] = []
    
    result = db.medical_providers.insert_one(provider_dict)
    provider_dict["_id"] = str(result.inserted_id)
    
    return MedicalProviderResponse(**provider_dict)

@router.get("/providers", response_model=List[MedicalProviderResponse])
async def get_medical_providers(
    provider_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get medical providers with optional filtering"""
    query = {}
    if provider_type:
        query["providerType"] = provider_type
    if is_active is not None:
        query["isActive"] = is_active
    
    cursor = db.medical_providers.find(query).skip(skip).limit(limit).sort("name", 1)
    providers = []
    
    for provider in cursor:
        provider["_id"] = str(provider["_id"])
        providers.append(MedicalProviderResponse(**provider))
    
    return providers

@router.get("/providers/{provider_id}", response_model=MedicalProviderResponse)
async def get_medical_provider(
    provider_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific medical provider"""
    if not ObjectId.is_valid(provider_id):
        raise HTTPException(status_code=400, detail="Invalid provider ID")
    
    provider = db.medical_providers.find_one({"_id": ObjectId(provider_id)})
    if not provider:
        raise HTTPException(status_code=404, detail="Medical provider not found")
    
    provider["_id"] = str(provider["_id"])
    return MedicalProviderResponse(**provider)

@router.put("/providers/{provider_id}", response_model=MedicalProviderResponse)
async def update_medical_provider(
    provider_id: str,
    provider_update: MedicalProviderUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a medical provider"""
    if not ObjectId.is_valid(provider_id):
        raise HTTPException(status_code=400, detail="Invalid provider ID")
    
    update_data = {k: v for k, v in provider_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    result = db.medical_providers.update_one(
        {"_id": ObjectId(provider_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medical provider not found")
    
    updated_provider = db.medical_providers.find_one({"_id": ObjectId(provider_id)})
    updated_provider["_id"] = str(updated_provider["_id"])
    
    return MedicalProviderResponse(**updated_provider)

# Medical Bills endpoints
@router.post("/bills", response_model=MedicalBillResponse)
async def create_medical_bill(
    bill: MedicalBillCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new medical bill"""
    bill_dict = bill.dict()
    bill_dict["createdAt"] = datetime.utcnow()
    bill_dict["updatedAt"] = datetime.utcnow()
    bill_dict["documents"] = []
    
    # Calculate remaining balance
    total = bill_dict.get("totalAmount", 0)
    insurance = bill_dict.get("insurancePayment", 0)
    patient = bill_dict.get("patientPayment", 0)
    adjustments = bill_dict.get("adjustments", 0)
    bill_dict["remainingBalance"] = total - insurance - patient - adjustments
    
    result = db.medical_bills.insert_one(bill_dict)
    bill_dict["_id"] = str(result.inserted_id)
    
    # Add bill ID to medical record
    if bill_dict.get("medicalRecordId"):
        db.medical_records.update_one(
            {"_id": ObjectId(bill_dict["medicalRecordId"])},
            {"$push": {"bills": str(result.inserted_id)}}
        )
    
    return MedicalBillResponse(**bill_dict)

@router.get("/bills", response_model=List[MedicalBillResponse])
async def get_medical_bills(
    plaintiff_id: Optional[str] = Query(None),
    provider_id: Optional[str] = Query(None),
    medical_record_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    is_lien: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get medical bills with optional filtering"""
    query = {}
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    if provider_id:
        query["providerId"] = provider_id
    if medical_record_id:
        query["medicalRecordId"] = medical_record_id
    if status:
        query["status"] = status
    if is_lien is not None:
        query["isLien"] = is_lien
    
    cursor = db.medical_bills.find(query).skip(skip).limit(limit).sort("billDate", -1)
    bills = []
    
    for bill in cursor:
        bill["_id"] = str(bill["_id"])
        bills.append(MedicalBillResponse(**bill))
    
    return bills

@router.get("/bills/{bill_id}", response_model=MedicalBillResponse)
async def get_medical_bill(
    bill_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific medical bill"""
    if not ObjectId.is_valid(bill_id):
        raise HTTPException(status_code=400, detail="Invalid bill ID")
    
    bill = db.medical_bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Medical bill not found")
    
    bill["_id"] = str(bill["_id"])
    return MedicalBillResponse(**bill)

@router.put("/bills/{bill_id}", response_model=MedicalBillResponse)
async def update_medical_bill(
    bill_id: str,
    bill_update: MedicalBillUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a medical bill"""
    if not ObjectId.is_valid(bill_id):
        raise HTTPException(status_code=400, detail="Invalid bill ID")
    
    update_data = {k: v for k, v in bill_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    # Recalculate remaining balance if financial fields changed
    if any(field in update_data for field in ["totalAmount", "insurancePayment", "patientPayment", "adjustments"]):
        current_bill = db.medical_bills.find_one({"_id": ObjectId(bill_id)})
        if current_bill:
            total = update_data.get("totalAmount", current_bill.get("totalAmount", 0))
            insurance = update_data.get("insurancePayment", current_bill.get("insurancePayment", 0))
            patient = update_data.get("patientPayment", current_bill.get("patientPayment", 0))
            adjustments = update_data.get("adjustments", current_bill.get("adjustments", 0))
            update_data["remainingBalance"] = total - insurance - patient - adjustments
    
    result = db.medical_bills.update_one(
        {"_id": ObjectId(bill_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medical bill not found")
    
    updated_bill = db.medical_bills.find_one({"_id": ObjectId(bill_id)})
    updated_bill["_id"] = str(updated_bill["_id"])
    
    return MedicalBillResponse(**updated_bill)

@router.delete("/bills/{bill_id}")
async def delete_medical_bill(
    bill_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a medical bill"""
    if not ObjectId.is_valid(bill_id):
        raise HTTPException(status_code=400, detail="Invalid bill ID")
    
    # Get the bill to find the medical record ID
    bill = db.medical_bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Medical bill not found")
    
    # Remove bill ID from medical record
    if bill.get("medicalRecordId"):
        db.medical_records.update_one(
            {"_id": ObjectId(bill["medicalRecordId"])},
            {"$pull": {"bills": bill_id}}
        )
    
    # Delete the bill
    result = db.medical_bills.delete_one({"_id": ObjectId(bill_id)})
    
    return {"message": "Medical bill deleted successfully"}
