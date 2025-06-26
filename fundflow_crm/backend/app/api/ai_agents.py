from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.core.database import get_database
from app.agents.intake_parser_agent import IntakeParserAgent
from app.agents.comms_drafting_agent import CommsDraftingAgent
from app.agents.risk_scoring_agent import RiskScoringAgent
from app.agents.document_analysis_agent import DocumentAnalysisAgent
from app.agents.underwriting_assistant_agent import UnderwritingAssistantAgent
from app.agents.contract_generation_agent import ContractGenerationAgent
from app.agents.comparable_case_agent import ComparableCaseAgent
from app.agents.ai_chatbot_agent import AIChatbotAgent

router = APIRouter()

class IntakeParseRequest(BaseModel):
    text: str

class CommunicationDraftRequest(BaseModel):
    plaintiff_id: str
    communication_type: str  # "welcome" or "document_request"
    law_firm_id: Optional[str] = None

class DocumentAnalysisRequest(BaseModel):
    document_type: str
    document_content: str
    plaintiff_id: Optional[str] = None

class UnderwritingRequest(BaseModel):
    plaintiff_id: str
    funding_amount: Optional[float] = None

class ContractGenerationRequest(BaseModel):
    plaintiff_id: str
    funding_amount: float
    terms: Dict[str, Any]

class ComparableCaseRequest(BaseModel):
    case_type: str
    jurisdiction: str
    injury_type: str
    settlement_amount_range: Optional[Dict[str, float]] = None

class ChatbotRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class RiskAnalysisRequest(BaseModel):
    plaintiff_id: str

class ContractValidationRequest(BaseModel):
    contract_text: str
    plaintiff_id: str

class ContractAmendmentRequest(BaseModel):
    contract_text: str
    requested_changes: str

@router.post("/parse-intake")
async def parse_intake(request: IntakeParseRequest, db=Depends(get_database)):
    """
    Parse intake text using AI to extract plaintiff information
    """
    try:
        parser = IntakeParserAgent()
        parsed_data = await parser.parse_intake_text(request.text)
        
        # Suggest workflow stage
        suggested_stage = await parser.suggest_workflow_stage(parsed_data)
        parsed_data["suggestedStage"] = suggested_stage
        
        return {
            "success": True,
            "data": parsed_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse intake text: {str(e)}"
        )

@router.post("/draft-communication")
async def draft_communication(request: CommunicationDraftRequest, db=Depends(get_database)):
    """
    Draft AI-generated communications
    """
    try:
        # Get plaintiff data
        from bson import ObjectId
        plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(request.plaintiff_id)})
        if not plaintiff:
            raise HTTPException(status_code=404, detail="Plaintiff not found")
        
        # Get law firm data if provided
        law_firm = None
        if request.law_firm_id:
            law_firm = await db.law_firms.find_one({"_id": ObjectId(request.law_firm_id)})
        
        # Initialize drafting agent
        drafter = CommsDraftingAgent()
        
        # Draft communication based on type
        if request.communication_type == "welcome":
            draft = await drafter.draft_welcome_email(plaintiff)
        elif request.communication_type == "document_request":
            draft = await drafter.draft_document_request(plaintiff, law_firm)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid communication type. Use 'welcome' or 'document_request'"
            )
        
        return {
            "success": True,
            "draft": draft
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to draft communication: {str(e)}"
        )

@router.post("/analyze-risk")
async def analyze_risk(request: RiskAnalysisRequest, db=Depends(get_database)):
    """
    Analyze risk factors for a plaintiff case using advanced AI
    """
    try:
        from bson import ObjectId
        plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(request.plaintiff_id)})
        if not plaintiff:
            raise HTTPException(status_code=404, detail="Plaintiff not found")
        
        # Get related documents
        documents = await db.documents.find({"plaintiffId": request.plaintiff_id}).to_list(None)
        
        # Initialize risk scoring agent
        risk_agent = RiskScoringAgent()
        
        # Perform comprehensive risk analysis
        risk_analysis = await risk_agent.analyze_comprehensive_risk(plaintiff, documents)
        
        return {
            "success": True,
            "analysis": risk_analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze risk: {str(e)}"
        )

@router.post("/analyze-document")
async def analyze_document(request: DocumentAnalysisRequest, db=Depends(get_database)):
    """
    Analyze a document using AI to extract key information
    """
    try:
        document_agent = DocumentAnalysisAgent()
        
        # Get plaintiff context if provided
        plaintiff_context = None
        if request.plaintiff_id:
            from bson import ObjectId
            plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(request.plaintiff_id)})
            plaintiff_context = plaintiff
        
        # Analyze document
        analysis = await document_agent.analyze_document(
            request.document_type,
            request.document_content,
            plaintiff_context
        )
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze document: {str(e)}"
        )

@router.post("/underwriting-assessment")
async def underwriting_assessment(request: UnderwritingRequest, db=Depends(get_database)):
    """
    Provide AI-powered underwriting assessment and recommendations
    """
    try:
        from bson import ObjectId
        plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(request.plaintiff_id)})
        if not plaintiff:
            raise HTTPException(status_code=404, detail="Plaintiff not found")
        
        # Get related documents and case history
        documents = await db.documents.find({"plaintiffId": request.plaintiff_id}).to_list(None)
        communications = await db.communications.find({"plaintiffId": request.plaintiff_id}).to_list(None)
        
        # Initialize underwriting agent
        underwriting_agent = UnderwritingAssistantAgent()
        
        # Perform assessment
        assessment = await underwriting_agent.assess_case(
            plaintiff, 
            documents, 
            communications,
            request.funding_amount
        )
        
        return {
            "success": True,
            "assessment": assessment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to perform underwriting assessment: {str(e)}"
        )

@router.post("/generate-contract")
async def generate_contract(request: ContractGenerationRequest, db=Depends(get_database)):
    """
    Generate AI-assisted funding contract
    """
    try:
        from bson import ObjectId
        plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(request.plaintiff_id)})
        if not plaintiff:
            raise HTTPException(status_code=404, detail="Plaintiff not found")
        
        # Get law firm information
        law_firm = None
        if plaintiff.get("lawFirmId"):
            law_firm = await db.law_firms.find_one({"_id": ObjectId(plaintiff["lawFirmId"])})
        
        # Initialize contract generation agent
        contract_agent = ContractGenerationAgent()
        
        # Generate contract
        contract = await contract_agent.generate_funding_contract(
            plaintiff,
            law_firm,
            request.funding_amount,
            request.terms
        )
        
        return {
            "success": True,
            "contract": contract
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate contract: {str(e)}"
        )

@router.post("/find-comparable-cases")
async def find_comparable_cases(request: ComparableCaseRequest, db=Depends(get_database)):
    """
    Find and analyze comparable cases for valuation and risk assessment
    """
    try:
        comparable_agent = ComparableCaseAgent()
        
        # Find comparable cases
        comparables = await comparable_agent.find_comparable_cases(
            request.case_type,
            request.jurisdiction,
            request.injury_type,
            request.settlement_amount_range
        )
        
        return {
            "success": True,
            "comparables": comparables
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to find comparable cases: {str(e)}"
        )

@router.post("/chat")
async def chat(request: ChatbotRequest, db=Depends(get_database)):
    """
    AI chat endpoint for lead qualification and customer service
    """
    try:
        chatbot_agent = AIChatbotAgent()
        
        # Process message and generate response
        response = await chatbot_agent.process_chat_message(
            request.message,
            request.conversation_id or "default_session",
            request.context
        )
        
        return {
            "success": True,
            "response": response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat message: {str(e)}"
        )

@router.post("/chatbot-response")
async def chatbot_response(request: ChatbotRequest, db=Depends(get_database)):
    """
    AI chatbot for lead qualification and customer service
    """
    try:
        chatbot_agent = AIChatbotAgent()
        
        # Process message and generate response
        response = await chatbot_agent.process_chat_message(
            request.message,
            request.conversation_id or "default_session",
            request.context
        )
        
        return {
            "success": True,
            "response": response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chatbot message: {str(e)}"
        )

@router.post("/validate-contract")
async def validate_contract(request: ContractValidationRequest, db=Depends(get_database)):
    """
    Validate a generated contract for legal compliance and completeness
    """
    try:
        from bson import ObjectId
        plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(request.plaintiff_id)})
        if not plaintiff:
            raise HTTPException(status_code=404, detail="Plaintiff not found")
        
        contract_agent = ContractGenerationAgent()
        
        # Validate contract
        validation = await contract_agent.validate_contract(request.contract_text, plaintiff)
        
        return {
            "success": True,
            "validation": validation
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate contract: {str(e)}"
        )

@router.post("/suggest-contract-amendments")
async def suggest_contract_amendments(request: ContractAmendmentRequest, db=Depends(get_database)):
    """
    Suggest amendments to a contract based on requested changes
    """
    try:
        contract_agent = ContractGenerationAgent()
        
        # Generate amendments
        amendments = await contract_agent.suggest_amendments(request.contract_text, request.requested_changes)
        
        return {
            "success": True,
            "amendments": amendments
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to suggest contract amendments: {str(e)}"
        )
