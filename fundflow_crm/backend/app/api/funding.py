from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.funding import (
    FundingCreate, FundingUpdate, FundingResponse,
    TransactionCreate, TransactionUpdate, TransactionResponse
)
from ..core.database import get_database
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/funding", tags=["funding"])

@router.post("/", response_model=FundingResponse)
async def create_funding(
    funding: FundingCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new funding request"""
    funding_dict = funding.dict()
    funding_dict["applicationDate"] = datetime.utcnow()
    funding_dict["createdAt"] = datetime.utcnow()
    funding_dict["updatedAt"] = datetime.utcnow()
    funding_dict["documents"] = []
    funding_dict["transactions"] = []
    
    result = db.funding.insert_one(funding_dict)
    funding_dict["_id"] = str(result.inserted_id)
    
    return FundingResponse(**funding_dict)

@router.get("/", response_model=List[FundingResponse])
async def get_funding_requests(
    plaintiff_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get funding requests with optional filtering"""
    query = {}
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    if status:
        query["status"] = status
    
    cursor = db.funding.find(query).skip(skip).limit(limit)
    funding_requests = []
    
    for funding in cursor:
        funding["_id"] = str(funding["_id"])
        funding_requests.append(FundingResponse(**funding))
    
    return funding_requests

@router.get("/{funding_id}", response_model=FundingResponse)
async def get_funding(
    funding_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific funding request"""
    if not ObjectId.is_valid(funding_id):
        raise HTTPException(status_code=400, detail="Invalid funding ID")
    
    funding = db.funding.find_one({"_id": ObjectId(funding_id)})
    if not funding:
        raise HTTPException(status_code=404, detail="Funding not found")
    
    funding["_id"] = str(funding["_id"])
    return FundingResponse(**funding)

@router.put("/{funding_id}", response_model=FundingResponse)
async def update_funding(
    funding_id: str,
    funding_update: FundingUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a funding request"""
    if not ObjectId.is_valid(funding_id):
        raise HTTPException(status_code=400, detail="Invalid funding ID")
    
    update_data = {k: v for k, v in funding_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    result = db.funding.update_one(
        {"_id": ObjectId(funding_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Funding not found")
    
    updated_funding = db.funding.find_one({"_id": ObjectId(funding_id)})
    updated_funding["_id"] = str(updated_funding["_id"])
    
    return FundingResponse(**updated_funding)

@router.delete("/{funding_id}")
async def delete_funding(
    funding_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a funding request"""
    if not ObjectId.is_valid(funding_id):
        raise HTTPException(status_code=400, detail="Invalid funding ID")
    
    result = db.funding.delete_one({"_id": ObjectId(funding_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Funding not found")
    
    return {"message": "Funding deleted successfully"}

# Transaction endpoints
@router.post("/{funding_id}/transactions", response_model=TransactionResponse)
async def create_transaction(
    funding_id: str,
    transaction: TransactionCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new transaction for a funding request"""
    if not ObjectId.is_valid(funding_id):
        raise HTTPException(status_code=400, detail="Invalid funding ID")
    
    # Verify funding exists
    funding = db.funding.find_one({"_id": ObjectId(funding_id)})
    if not funding:
        raise HTTPException(status_code=404, detail="Funding not found")
    
    transaction_dict = transaction.dict()
    transaction_dict["transactionDate"] = datetime.utcnow()
    transaction_dict["createdAt"] = datetime.utcnow()
    transaction_dict["updatedAt"] = datetime.utcnow()
    
    result = db.transactions.insert_one(transaction_dict)
    transaction_dict["_id"] = str(result.inserted_id)
    
    # Add transaction ID to funding record
    db.funding.update_one(
        {"_id": ObjectId(funding_id)},
        {"$push": {"transactions": str(result.inserted_id)}}
    )
    
    return TransactionResponse(**transaction_dict)

@router.get("/{funding_id}/transactions", response_model=List[TransactionResponse])
async def get_funding_transactions(
    funding_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get all transactions for a funding request"""
    if not ObjectId.is_valid(funding_id):
        raise HTTPException(status_code=400, detail="Invalid funding ID")
    
    cursor = db.transactions.find({"fundingId": funding_id})
    transactions = []
    
    for transaction in cursor:
        transaction["_id"] = str(transaction["_id"])
        transactions.append(TransactionResponse(**transaction))
    
    return transactions

@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    transaction_update: TransactionUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a transaction"""
    if not ObjectId.is_valid(transaction_id):
        raise HTTPException(status_code=400, detail="Invalid transaction ID")
    
    update_data = {k: v for k, v in transaction_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    result = db.transactions.update_one(
        {"_id": ObjectId(transaction_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    updated_transaction = db.transactions.find_one({"_id": ObjectId(transaction_id)})
    updated_transaction["_id"] = str(updated_transaction["_id"])
    
    return TransactionResponse(**updated_transaction)
