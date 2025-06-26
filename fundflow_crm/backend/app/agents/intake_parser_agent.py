import google.generativeai as genai
import os
from typing import Dict, Any, Optional
from datetime import datetime
import json

class IntakeParserAgent:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    async def parse_intake_text(self, intake_text: str) -> Dict[str, Any]:
        """
        Parse intake text/email and extract plaintiff information
        """
        prompt = f"""
        You are an AI assistant that extracts plaintiff information from intake forms or emails for a pre-settlement funding company.
        
        Extract the following information from the text below and return it as a JSON object:
        
        - firstName (string)
        - lastName (string) 
        - email (string, if available)
        - phone (string, if available)
        - address (string, if available)
        - caseType (one of: "Auto Accident", "Slip and Fall", "Medical Malpractice", "Workers Compensation", "Product Liability", "Other")
        - incidentDate (ISO format date string, if available)
        - requestedAmount (number, if available)
        - caseNotes (string, summary of the case details)
        
        If information is not available, use null for that field.
        For caseType, choose the most appropriate category based on the description.
        
        Text to parse:
        {intake_text}
        
        Return only valid JSON:
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            # Try to parse the JSON response
            try:
                parsed_data = json.loads(content)
                return parsed_data
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end != -1:
                    json_str = content[start:end]
                    parsed_data = json.loads(json_str)
                    return parsed_data
                else:
                    raise ValueError("Could not extract valid JSON from AI response") from None
                    
        except Exception as e:
            print(f"Error in intake parsing: {e}")
            return {
                "error": f"Failed to parse intake text: {str(e)}",
                "firstName": None,
                "lastName": None,
                "email": None,
                "phone": None,
                "address": None,
                "caseType": "Other",
                "incidentDate": None,
                "requestedAmount": None,
                "caseNotes": intake_text[:500] + "..." if len(intake_text) > 500 else intake_text
            }
    
    async def suggest_workflow_stage(self, plaintiff_data: Dict[str, Any]) -> str:
        """
        Suggest appropriate workflow stage based on plaintiff data
        """
        # Simple rule-based logic for now
        if plaintiff_data.get("requestedAmount") and plaintiff_data.get("incidentDate"):
            return "Info Gathering"
        else:
            return "New Lead"
