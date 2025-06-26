from typing import Dict, Any, List
from app.services.google_service import google_service
import logging

logger = logging.getLogger(__name__)

class LocationIntelligenceAgent:
    """
    AI agent that provides location intelligence for case analysis
    """
    
    def __init__(self):
        pass
    
    async def analyze_incident_location(self, address: str) -> Dict[str, Any]:
        """
        Analyze an incident location and provide comprehensive context
        """
        try:
            # Validate and standardize the address
            address_result = await google_service.validate_address(address)
            
            if not address_result.get("is_valid"):
                return {
                    "error": "Invalid or unrecognizable address",
                    "address_validation": address_result
                }
            
            # Get nearby medical facilities
            hospitals = await google_service.search_nearby_places(
                address, "hospital", 10000  # 10km radius
            )
            
            # Get nearby law offices
            law_offices = await google_service.search_nearby_places(
                address, "lawyer", 15000  # 15km radius  
            )
            
            # Get nearby police stations (relevant for accident reports)
            police_stations = await google_service.search_nearby_places(
                address, "police", 10000
            )
            
            # Analyze location characteristics
            location_analysis = self._analyze_location_characteristics(address_result)
            
            return {
                "status": "success",
                "address_validation": address_result,
                "location_analysis": location_analysis,
                "nearby_facilities": {
                    "hospitals": hospitals.get("places", [])[:5],  # Top 5 hospitals
                    "law_offices": law_offices.get("places", [])[:5],  # Top 5 law offices
                    "police_stations": police_stations.get("places", [])[:3]  # Top 3 police stations
                },
                "risk_factors": self._assess_location_risk_factors(address_result, hospitals, law_offices),
                "recommendations": self._generate_location_recommendations(address_result, hospitals, law_offices)
            }
            
        except Exception as e:
            logger.error(f"Error in location intelligence analysis: {e}")
            return {
                "error": f"Failed to analyze location: {str(e)}",
                "status": "error"
            }
    
    def _analyze_location_characteristics(self, address_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze characteristics of the location based on address components
        """
        components = address_data.get("components", {})
        
        analysis = {
            "location_type": "urban",  # Default
            "state": components.get("state"),
            "city": components.get("city"),
            "coordinates": {
                "lat": address_data.get("latitude"),
                "lng": address_data.get("longitude")
            }
        }
        
        # Determine location type based on city/area patterns
        city = components.get("city", "").lower()
        if any(keyword in city for keyword in ["rural", "county", "township"]):
            analysis["location_type"] = "rural"
        elif any(keyword in city for keyword in ["downtown", "metro", "city"]):
            analysis["location_type"] = "urban"
        else:
            analysis["location_type"] = "suburban"
        
        return analysis
    
    def _assess_location_risk_factors(self, address_data: Dict[str, Any], 
                                    hospitals: Dict[str, Any], 
                                    law_offices: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess risk factors based on location analysis
        """
        risk_factors = {
            "medical_access": "good",  # Default
            "legal_access": "good",    # Default
            "location_remoteness": "low",  # Default
            "overall_risk": "low"     # Default
        }
        
        # Assess medical access
        hospital_count = len(hospitals.get("places", []))
        if hospital_count == 0:
            risk_factors["medical_access"] = "poor"
        elif hospital_count < 2:
            risk_factors["medical_access"] = "limited"
        
        # Assess legal access
        law_office_count = len(law_offices.get("places", []))
        if law_office_count == 0:
            risk_factors["legal_access"] = "poor"
        elif law_office_count < 3:
            risk_factors["legal_access"] = "limited"
        
        # Assess overall risk
        poor_factors = sum([
            1 for factor in [risk_factors["medical_access"], risk_factors["legal_access"]]
            if factor == "poor"
        ])
        
        if poor_factors >= 2:
            risk_factors["overall_risk"] = "high"
        elif poor_factors == 1:
            risk_factors["overall_risk"] = "medium"
        
        return risk_factors
    
    def _generate_location_recommendations(self, address_data: Dict[str, Any],
                                         hospitals: Dict[str, Any],
                                         law_offices: Dict[str, Any]) -> List[str]:
        """
        Generate recommendations based on location analysis
        """
        recommendations = []
        
        hospital_count = len(hospitals.get("places", []))
        law_office_count = len(law_offices.get("places", []))
        
        # Medical access recommendations
        if hospital_count == 0:
            recommendations.append("Consider higher funding due to limited medical access requiring travel for treatment")
        elif hospital_count < 2:
            recommendations.append("Monitor medical expenses closely due to limited local hospital options")
        
        # Legal access recommendations  
        if law_office_count == 0:
            recommendations.append("May require attorney referral due to no local legal representation")
        elif law_office_count < 3:
            recommendations.append("Limited local legal options - consider attorney network referrals")
        
        # Location-specific recommendations
        components = address_data.get("components", {})
        state = components.get("state", "")
        
        # State-specific considerations (example logic)
        if state in ["CA", "NY", "FL"]:
            recommendations.append("High litigation state - expect longer case duration and higher legal costs")
        elif state in ["TX", "OH", "PA"]:
            recommendations.append("Moderate litigation environment - standard processing timeline expected")
        
        if not recommendations:
            recommendations.append("Location appears favorable with good access to medical and legal services")
        
        return recommendations

location_intelligence_agent = LocationIntelligenceAgent()
