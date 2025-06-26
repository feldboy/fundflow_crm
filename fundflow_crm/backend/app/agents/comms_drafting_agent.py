import google.generativeai as genai
import os
from typing import Dict, Any, Optional
from datetime import datetime
import json

class CommsDraftingAgent:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def draft_welcome_email(self, plaintiff_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Draft a personalized welcome email for a new plaintiff
        """
        first_name = plaintiff_data.get("firstName", "")
        case_type = plaintiff_data.get("caseType", "")
        
        prompt = f"""
        You are writing a professional, empathetic welcome email for a pre-settlement funding company to a plaintiff who has just submitted their information.
        
        Plaintiff details:
        - Name: {first_name}
        - Case Type: {case_type}
        
        Write a warm, professional email that:
        1. Welcomes them and thanks them for their inquiry
        2. Briefly explains what pre-settlement funding is
        3. Mentions that we understand their situation is difficult
        4. Explains the next steps (document review, case evaluation)
        5. Provides reassurance about confidentiality and professionalism
        6. Includes a professional signature
        
        Keep it concise but caring. Use a professional but approachable tone.
        
        Return the email as JSON with 'subject' and 'body' fields.
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            # Parse JSON response
            email_data = json.loads(content)
            
            return {
                "subject": email_data.get("subject", f"Welcome {first_name} - Your Pre-Settlement Funding Application"),
                "body": email_data.get("body", "Thank you for your inquiry. We will review your case and get back to you soon."),
                "type": "welcome"
            }
            
        except Exception as e:
            print(f"Error drafting welcome email: {e}")
            return {
                "subject": f"Welcome {first_name} - Your Pre-Settlement Funding Application",
                "body": f"""Dear {first_name},

Thank you for reaching out to us regarding your {case_type.lower()} case. We understand that dealing with legal matters can be stressful, especially when you're facing financial challenges.

Pre-settlement funding can provide you with the financial support you need while your case is pending, allowing you to focus on your recovery and legal proceedings without the added stress of financial pressure.

Our team will now review your case details and documentation. We'll be in touch within 24-48 hours with next steps or any additional information we may need.

Please don't hesitate to reach out if you have any questions in the meantime.

Best regards,
The Pre-Settlement Funding Team""",
                "type": "welcome"
            }
    
    async def draft_document_request(self, plaintiff_data: Dict[str, Any], law_firm_data: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """
        Draft a document request email
        """
        first_name = plaintiff_data.get("firstName", "")
        case_type = plaintiff_data.get("caseType", "")
        
        # Determine required documents based on case type
        doc_requirements = {
            "Auto Accident": ["Police report", "Medical records", "Insurance correspondence", "Attorney retainer agreement"],
            "Slip and Fall": ["Incident report", "Medical records", "Photos of the scene", "Attorney retainer agreement"],
            "Medical Malpractice": ["Medical records", "Expert opinions", "Hospital correspondence", "Attorney retainer agreement"],
            "Workers Compensation": ["Workers comp claim", "Medical records", "Employment records", "Attorney retainer agreement"],
            "Product Liability": ["Product information", "Medical records", "Purchase receipts", "Attorney retainer agreement"],
            "Other": ["Relevant case documents", "Medical records (if applicable)", "Attorney retainer agreement"]
        }
        
        required_docs = doc_requirements.get(case_type, doc_requirements["Other"])
        
        prompt = f"""
        Write a professional email requesting documents for a pre-settlement funding case evaluation.
        
        Plaintiff: {first_name}
        Case Type: {case_type}
        Required Documents: {', '.join(required_docs)}
        
        The email should:
        1. Explain why we need these documents
        2. List the specific documents required
        3. Mention confidentiality and security
        4. Provide clear instructions on how to submit
        5. Include timeline expectations
        6. Be professional but understanding
        
        Return as JSON with 'subject' and 'body' fields.
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            email_data = json.loads(content)
            
            return {
                "subject": email_data.get("subject", f"Document Request for Your {case_type} Case - {first_name}"),
                "body": email_data.get("body", f"Dear {first_name},\n\nTo proceed with your case evaluation, we need to review some documents..."),
                "type": "document_request"
            }
            
        except Exception as e:
            print(f"Error drafting document request: {e}")
            return {
                "subject": f"Document Request for Your {case_type} Case - {first_name}",
                "body": f"""Dear {first_name},

Thank you for choosing us for your pre-settlement funding needs. To move forward with evaluating your {case_type.lower()} case, we need to review some important documents.

Please provide the following documents:
{chr(10).join([f"• {doc}" for doc in required_docs])}

All documents will be kept strictly confidential and used solely for the purpose of evaluating your funding request. Our secure systems ensure your information is protected.

You can submit these documents by replying to this email with attachments or through our secure portal.

We aim to complete our review within 2-3 business days once we receive all required documentation.

Best regards,
The Pre-Settlement Funding Team""",
                "type": "document_request"
            }
