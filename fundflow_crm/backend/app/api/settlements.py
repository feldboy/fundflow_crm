from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.settlement import (
    SettlementCreate, SettlementUpdate, SettlementResponse,
    SettlementOfferCreate, SettlementOfferUpdate, SettlementOfferResponse
)
from ..core.database import get_database
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/settlements", tags=["settlements"])

@router.post("/", response_model=SettlementResponse)
async def create_settlement(
    settlement: SettlementCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new settlement tracking record"""
    settlement_dict = settlement.dict()
    settlement_dict["createdAt"] = datetime.utcnow()
    settlement_dict["updatedAt"] = datetime.utcnow()
    settlement_dict["documents"] = []
    settlement_dict["offers"] = []
    
    result = db.settlements.insert_one(settlement_dict)
    settlement_dict["_id"] = str(result.inserted_id)
    
    return SettlementResponse(**settlement_dict)

@router.get("/", response_model=List[SettlementResponse])
async def get_settlements(
    plaintiff_id: Optional[str] = Query(None),
    funding_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get settlements with optional filtering"""
    query = {}
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    if funding_id:
        query["fundingId"] = funding_id
    if status:
        query["status"] = status
    
    cursor = db.settlements.find(query).skip(skip).limit(limit)
    settlements = []
    
    for settlement in cursor:
        settlement["_id"] = str(settlement["_id"])
        settlements.append(SettlementResponse(**settlement))
    
    return settlements

@router.get("/{settlement_id}", response_model=SettlementResponse)
async def get_settlement(
    settlement_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific settlement"""
    if not ObjectId.is_valid(settlement_id):
        raise HTTPException(status_code=400, detail="Invalid settlement ID")
    
    settlement = db.settlements.find_one({"_id": ObjectId(settlement_id)})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    
    settlement["_id"] = str(settlement["_id"])
    return SettlementResponse(**settlement)

@router.put("/{settlement_id}", response_model=SettlementResponse)
async def update_settlement(
    settlement_id: str,
    settlement_update: SettlementUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a settlement"""
    if not ObjectId.is_valid(settlement_id):
        raise HTTPException(status_code=400, detail="Invalid settlement ID")
    
    update_data = {k: v for k, v in settlement_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    result = db.settlements.update_one(
        {"_id": ObjectId(settlement_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Settlement not found")
    
    updated_settlement = db.settlements.find_one({"_id": ObjectId(settlement_id)})
    updated_settlement["_id"] = str(updated_settlement["_id"])
    
    return SettlementResponse(**updated_settlement)

@router.delete("/{settlement_id}")
async def delete_settlement(
    settlement_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a settlement"""
    if not ObjectId.is_valid(settlement_id):
        raise HTTPException(status_code=400, detail="Invalid settlement ID")
    
    result = db.settlements.delete_one({"_id": ObjectId(settlement_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Settlement not found")
    
    return {"message": "Settlement deleted successfully"}

# Settlement Offer endpoints
@router.post("/{settlement_id}/offers", response_model=SettlementOfferResponse)
async def create_settlement_offer(
    settlement_id: str,
    offer: SettlementOfferCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new settlement offer"""
    if not ObjectId.is_valid(settlement_id):
        raise HTTPException(status_code=400, detail="Invalid settlement ID")
    
    # Verify settlement exists
    settlement = db.settlements.find_one({"_id": ObjectId(settlement_id)})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    
    offer_dict = offer.dict()
    offer_dict["createdAt"] = datetime.utcnow()
    offer_dict["updatedAt"] = datetime.utcnow()
    
    result = db.settlement_offers.insert_one(offer_dict)
    offer_dict["_id"] = str(result.inserted_id)
    
    # Add offer ID to settlement record
    db.settlements.update_one(
        {"_id": ObjectId(settlement_id)},
        {"$push": {"offers": str(result.inserted_id)}}
    )
    
    return SettlementOfferResponse(**offer_dict)

@router.get("/{settlement_id}/offers", response_model=List[SettlementOfferResponse])
async def get_settlement_offers(
    settlement_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get all offers for a settlement"""
    if not ObjectId.is_valid(settlement_id):
        raise HTTPException(status_code=400, detail="Invalid settlement ID")
    
    cursor = db.settlement_offers.find({"settlementId": settlement_id}).sort("offerDate", -1)
    offers = []
    
    for offer in cursor:
        offer["_id"] = str(offer["_id"])
        offers.append(SettlementOfferResponse(**offer))
    
    return offers

@router.put("/offers/{offer_id}", response_model=SettlementOfferResponse)
async def update_settlement_offer(
    offer_id: str,
    offer_update: SettlementOfferUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a settlement offer"""
    if not ObjectId.is_valid(offer_id):
        raise HTTPException(status_code=400, detail="Invalid offer ID")
    
    update_data = {k: v for k, v in offer_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    # Set responded date if status is changing to accepted/rejected/countered
    if update_data.get("status") in ["Accepted", "Rejected", "Countered"]:
        update_data["respondedDate"] = datetime.utcnow()
    
    result = db.settlement_offers.update_one(
        {"_id": ObjectId(offer_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Settlement offer not found")
    
    updated_offer = db.settlement_offers.find_one({"_id": ObjectId(offer_id)})
    updated_offer["_id"] = str(updated_offer["_id"])
    
    return SettlementOfferResponse(**updated_offer)

@router.delete("/offers/{offer_id}")
async def delete_settlement_offer(
    offer_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a settlement offer"""
    if not ObjectId.is_valid(offer_id):
        raise HTTPException(status_code=400, detail="Invalid offer ID")
    
    # Get the offer to find the settlement ID
    offer = db.settlement_offers.find_one({"_id": ObjectId(offer_id)})
    if not offer:
        raise HTTPException(status_code=404, detail="Settlement offer not found")
    
    # Remove offer ID from settlement record
    if offer.get("settlementId"):
        db.settlements.update_one(
            {"_id": ObjectId(offer["settlementId"])},
            {"$pull": {"offers": offer_id}}
        )
    
    # Delete the offer
    result = db.settlement_offers.delete_one({"_id": ObjectId(offer_id)})
    
    return {"message": "Settlement offer deleted successfully"}
