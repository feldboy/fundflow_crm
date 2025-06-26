from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.google_service import google_service

router = APIRouter()

class AddressValidationRequest(BaseModel):
    address: str

class DistanceMatrixRequest(BaseModel):
    origins: List[str]
    destinations: List[str]

class NearbySearchRequest(BaseModel):
    location: str
    place_type: Optional[str] = "hospital"
    radius: Optional[int] = 5000

@router.post("/validate-address")
async def validate_address(request: AddressValidationRequest):
    """
    Validate and standardize an address using Google Maps Geocoding API
    """
    try:
        result = await google_service.validate_address(request.address)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Address validation failed: {str(e)}")

@router.post("/distance-matrix")
async def get_distance_matrix(request: DistanceMatrixRequest):
    """
    Get distance and travel time between multiple origins and destinations
    """
    try:
        result = await google_service.get_distance_matrix(request.origins, request.destinations)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Distance matrix calculation failed: {str(e)}")

@router.post("/nearby-search")
async def search_nearby_places(request: NearbySearchRequest):
    """
    Search for nearby places like hospitals, law offices, etc.
    Useful for incident location analysis
    """
    try:
        result = await google_service.search_nearby_places(
            request.location, 
            request.place_type, 
            request.radius
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nearby search failed: {str(e)}")

@router.post("/incident-context")
async def get_incident_context(request: AddressValidationRequest):
    """
    Get comprehensive context about an incident location including:
    - Address validation
    - Nearby hospitals
    - Nearby law offices
    - Area demographics (if available)
    """
    try:
        # Validate the address first
        address_result = await google_service.validate_address(request.address)
        
        if not address_result.get("is_valid"):
            return {
                "error": "Invalid address provided",
                "address_validation": address_result
            }
        
        # Search for nearby relevant places
        hospitals = await google_service.search_nearby_places(request.address, "hospital", 10000)
        law_offices = await google_service.search_nearby_places(request.address, "lawyer", 15000)
        
        return {
            "address_validation": address_result,
            "nearby_hospitals": hospitals,
            "nearby_law_offices": law_offices,
            "context": {
                "city": address_result.get("components", {}).get("city"),
                "state": address_result.get("components", {}).get("state"),
                "coordinates": {
                    "lat": address_result.get("latitude"),
                    "lng": address_result.get("longitude")
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Incident context analysis failed: {str(e)}")

@router.post("/location-intelligence")
async def analyze_location_intelligence(request: AddressValidationRequest):
    """
    Advanced location intelligence analysis including risk assessment and recommendations
    """
    try:
        from app.agents.location_intelligence_agent import location_intelligence_agent
        result = await location_intelligence_agent.analyze_incident_location(request.address)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location intelligence analysis failed: {str(e)}")

@router.get("/test-connection")
async def test_google_api_connection():
    """
    Test if Google API is properly configured and working
    """
    try:
        # Test with a simple address validation
        test_result = await google_service.validate_address("1600 Amphitheatre Parkway, Mountain View, CA")
        
        if test_result.get("error"):
            return {
                "status": "error",
                "message": "Google API key not configured or invalid",
                "error": test_result.get("error")
            }
        
        return {
            "status": "success",
            "message": "Google API is properly configured and working",
            "test_result": {
                "address_validated": test_result.get("is_valid", False),
                "api_responsive": True
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Google API test failed: {str(e)}"
        }
