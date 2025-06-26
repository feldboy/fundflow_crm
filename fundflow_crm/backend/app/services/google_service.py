import httpx
import os
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

class GoogleService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.base_url = "https://maps.googleapis.com/maps/api"
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to Google Maps API"""
        if not self.api_key:
            return {"error": "Google API key not configured"}
        
        params["key"] = self.api_key
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/{endpoint}", params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            return {"error": f"HTTP error: {str(e)}"}
        except Exception as e:
            return {"error": f"Request failed: {str(e)}"}
    
    async def validate_address(self, address: str) -> Dict[str, Any]:
        """
        Validate an address using Google Geocoding API
        """
        if not self.api_key:
            return {
                "error": "Google API not configured",
                "is_valid": False
            }
        
        result = await self._make_request("geocode/json", {"address": address})
        
        if "error" in result:
            return {
                "error": result["error"],
                "is_valid": False
            }
        
        if result.get("status") != "OK" or not result.get("results"):
            return {
                "is_valid": False,
                "message": "Address not found"
            }
        
        geocode_result = result["results"][0]
        return {
            "is_valid": True,
            "formatted_address": geocode_result.get("formatted_address"),
            "address_components": geocode_result.get("address_components"),
            "geometry": geocode_result.get("geometry"),
            "place_id": geocode_result.get("place_id"),
            "types": geocode_result.get("types")
        }
    
    async def geocode_address(self, address: str) -> Dict[str, Any]:
        """
        Get coordinates for an address
        """
        result = await self._make_request("geocode/json", {"address": address})
        
        if "error" in result:
            return result
        
        if result.get("status") != "OK" or not result.get("results"):
            return {"error": "Address not found"}
        
        location = result["results"][0]["geometry"]["location"]
        return {
            "lat": location["lat"],
            "lng": location["lng"],
            "formatted_address": result["results"][0]["formatted_address"]
        }
    
    async def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """
        Get address from coordinates
        """
        result = await self._make_request("geocode/json", {"latlng": f"{lat},{lng}"})
        
        if "error" in result:
            return result
        
        if result.get("status") != "OK" or not result.get("results"):
            return {"error": "Location not found"}
        
        return {
            "formatted_address": result["results"][0]["formatted_address"],
            "address_components": result["results"][0]["address_components"],
            "place_id": result["results"][0]["place_id"]
        }
    
    async def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a place
        """
        params = {
            "place_id": place_id,
            "fields": "name,formatted_address,geometry,place_id,types,rating,formatted_phone_number"
        }
        
        result = await self._make_request("place/details/json", params)
        
        if "error" in result:
            return result
        
        if result.get("status") != "OK":
            return {"error": "Place not found"}
        
        return {
            "place_details": result.get("result", {})
        }
    
    async def search_places(self, query: str, location: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """
        Search for places using text search
        """
        params = {"query": query}
        
        if location:
            params["location"] = f"{location['lat']},{location['lng']}"
            params["radius"] = "50000"  # 50km radius
        
        result = await self._make_request("place/textsearch/json", params)
        
        if "error" in result:
            return result
        
        return {
            "places": result.get("results", []),
            "status": result.get("status")
        }
    
    async def get_directions(self, origin: str, destination: str, **kwargs) -> Dict[str, Any]:
        """
        Get directions between two points
        """
        params = {
            "origin": origin,
            "destination": destination,
            **kwargs
        }
        
        result = await self._make_request("directions/json", params)
        
        if "error" in result:
            return result
        
        if result.get("status") != "OK":
            return {"error": "No route found"}
        
        return {
            "routes": result.get("routes", [])
        }
    
    async def get_distance_matrix(self, origins: List[str], destinations: List[str], **kwargs) -> Dict[str, Any]:
        """
        Get distance and duration between multiple origins and destinations
        """
        params = {
            "origins": "|".join(origins),
            "destinations": "|".join(destinations),
            **kwargs
        }
        
        result = await self._make_request("distancematrix/json", params)
        
        if "error" in result:
            return result
        
        return {
            "distance_matrix": result
        }

# Create singleton instance
google_service = GoogleService()
