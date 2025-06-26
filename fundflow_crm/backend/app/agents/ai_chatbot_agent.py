import google.generativeai as genai
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json
import re
from dataclasses import dataclass

@dataclass
class ChatMessage:
    """Structure for chat messages"""
    message_id: str
    user_input: str
    bot_response: str
    timestamp: datetime
    session_id: str
    intent: str
    entities_extracted: Dict[str, Any]
    follow_up_needed: bool

@dataclass
class QualificationResult:
    """Structure for lead qualification results"""
    qualified: bool
    qualification_score: float
    qualifying_factors: List[str]
    disqualifying_factors: List[str]
    next_steps: List[str]
    data_collected: Dict[str, Any]

class AIChatbotAgent:
    """
    AI-powered chatbot for website lead qualification and initial data gathering
    """
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Conversation flow states
        self.conversation_states = {
            "GREETING": "initial_greeting",
            "QUALIFICATION": "qualifying_lead", 
            "DATA_COLLECTION": "collecting_information",
            "REFERRAL": "referring_to_specialist",
            "CONCLUSION": "ending_conversation"
        }
        
        # Qualification criteria
        self.qualification_criteria = {
            "has_legal_representation": True,
            "has_personal_injury_case": True,
            "case_is_active": True,
            "injury_is_significant": True,
            "needs_funding": True
        }
        
        # Entity extraction patterns
        self.entity_patterns = {
            "phone": r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b',
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "amount": r'\$?[\d,]+(?:\.\d{2})?',
            "date": r'\b(?:(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])[-/](?:19|20)?\d{2})|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b'
        }
        
        # Standard responses
        self.standard_responses = {
            "greeting": "Hello! I'm here to help you learn about pre-settlement funding. May I ask about your current legal situation?",
            "qualification_start": "To better assist you, I'd like to ask a few quick questions about your case.",
            "data_collection": "Great! Let me gather some basic information to see how we can help.",
            "not_qualified": "Based on what you've shared, pre-settlement funding might not be the right fit for your situation right now.",
            "qualified": "It sounds like you might be a good candidate for pre-settlement funding! Let me connect you with one of our specialists.",
            "error": "I apologize, but I'm having trouble understanding. Could you please rephrase that?"
        }
    
    async def process_chat_message(self, user_input: str, session_id: str, 
                                 conversation_history: List[Dict[str, Any]] = None) -> ChatMessage:
        """
        Process incoming chat message and generate appropriate response
        """
        try:
            # Determine conversation state
            current_state = self._determine_conversation_state(conversation_history)
            
            # Extract entities from user input
            entities = self._extract_entities(user_input)
            
            # Determine user intent
            intent = await self._classify_intent(user_input, current_state)
            
            # Generate contextual response
            bot_response = await self._generate_response(
                user_input, intent, current_state, entities, conversation_history
            )
            
            # Determine if follow-up is needed
            follow_up_needed = self._needs_follow_up(intent, current_state, entities)
            
            message = ChatMessage(
                message_id=self._generate_message_id(),
                user_input=user_input,
                bot_response=bot_response,
                timestamp=datetime.now(),
                session_id=session_id,
                intent=intent,
                entities_extracted=entities,
                follow_up_needed=follow_up_needed
            )
            
            return message
            
        except Exception as e:
            print(f"Error processing chat message: {e}")
            return self._create_error_message(user_input, session_id, str(e))
    
    def _determine_conversation_state(self, conversation_history: List[Dict[str, Any]] = None) -> str:
        """
        Determine current conversation state based on history
        """
        if not conversation_history:
            return self.conversation_states["GREETING"]
        
        # Simple state determination based on conversation length and content
        if len(conversation_history) <= 2:
            return self.conversation_states["GREETING"]
        elif len(conversation_history) <= 6:
            return self.conversation_states["QUALIFICATION"] 
        elif len(conversation_history) <= 12:
            return self.conversation_states["DATA_COLLECTION"]
        else:
            return self.conversation_states["CONCLUSION"]
    
    def _extract_entities(self, user_input: str) -> Dict[str, Any]:
        """
        Extract entities like phone numbers, emails, amounts, dates from user input
        """
        entities = {}
        
        # Extract phone numbers
        phone_matches = re.findall(self.entity_patterns["phone"], user_input, re.IGNORECASE)
        if phone_matches:
            entities["phone"] = f"({phone_matches[0][0]}) {phone_matches[0][1]}-{phone_matches[0][2]}"
        
        # Extract email addresses
        email_matches = re.findall(self.entity_patterns["email"], user_input, re.IGNORECASE)
        if email_matches:
            entities["email"] = email_matches[0]
        
        # Extract monetary amounts
        amount_matches = re.findall(self.entity_patterns["amount"], user_input, re.IGNORECASE)
        if amount_matches:
            entities["amounts"] = amount_matches
        
        # Extract dates
        date_matches = re.findall(self.entity_patterns["date"], user_input, re.IGNORECASE)
        if date_matches:
            entities["dates"] = date_matches
        
        # Extract case types using keywords
        case_type_keywords = {
            "auto accident": ["car accident", "auto accident", "car crash", "vehicle accident"],
            "slip and fall": ["slip and fall", "fall", "slip", "premises liability"],
            "medical malpractice": ["medical malpractice", "doctor error", "hospital mistake"],
            "workers compensation": ["work injury", "workers comp", "workplace accident"],
            "product liability": ["defective product", "product liability", "faulty product"]
        }
        
        user_lower = user_input.lower()
        for case_type, keywords in case_type_keywords.items():
            if any(keyword in user_lower for keyword in keywords):
                entities["case_type"] = case_type
                break
        
        return entities
    
    async def _classify_intent(self, user_input: str, current_state: str) -> str:
        """
        Classify user intent using AI
        """
        prompt = f"""
        Classify the intent of this user message in a pre-settlement funding chatbot conversation.
        
        Current conversation state: {current_state}
        User message: "{user_input}"
        
        Possible intents:
        - greeting: User is greeting or starting conversation
        - information_request: User wants to know about pre-settlement funding
        - qualification_response: User is answering qualification questions
        - personal_info: User is providing personal information
        - case_details: User is sharing case details
        - funding_inquiry: User is asking about funding amounts or terms
        - contact_request: User wants to speak to someone or provide contact info
        - objection: User has concerns or objections
        - ready_to_proceed: User is ready to move forward
        - off_topic: Message is not related to pre-settlement funding
        
        Return only the intent name.
        """
        
        try:
            response = self.model.generate_content(prompt)
            intent = response.text.strip().lower()
            
            # Validate intent
            valid_intents = [
                "greeting", "information_request", "qualification_response", 
                "personal_info", "case_details", "funding_inquiry", 
                "contact_request", "objection", "ready_to_proceed", "off_topic"
            ]
            
            return intent if intent in valid_intents else "information_request"
            
        except Exception as e:
            print(f"Error classifying intent: {e}")
            return "information_request"
    
    async def _generate_response(self, user_input: str, intent: str, current_state: str,
                               entities: Dict[str, Any], conversation_history: List[Dict[str, Any]] = None) -> str:
        """
        Generate contextual chatbot response using AI
        """
        # Prepare conversation context
        context = self._prepare_conversation_context(conversation_history, entities)
        
        prompt = f"""
        You are a helpful AI assistant for a pre-settlement funding company. Generate a natural, empathetic response.
        
        Current conversation state: {current_state}
        User intent: {intent}
        User message: "{user_input}"
        Entities extracted: {json.dumps(entities)}
        Conversation context: {json.dumps(context)}
        
        Guidelines:
        1. Be empathetic - users are often in difficult financial situations
        2. Be informative but not overwhelming
        3. Ask one question at a time to gather information
        4. Explain pre-settlement funding clearly when asked
        5. Guide towards qualification if appropriate
        6. Offer to connect with a specialist when qualified
        7. Be compliant with regulations - mention this is not legal advice
        8. Keep responses conversational and under 100 words
        
        Response approach based on intent:
        - greeting: Welcome and ask about their legal situation
        - information_request: Explain pre-settlement funding clearly
        - qualification_response: Follow up with next qualification question
        - personal_info: Acknowledge and ask for next needed info
        - case_details: Show understanding and ask clarifying questions
        - funding_inquiry: Explain process and ask about their needs
        - contact_request: Offer to connect them with specialist
        - objection: Address concerns empathetically
        - ready_to_proceed: Start data collection or transfer to specialist
        - off_topic: Gently redirect to funding topics
        
        Generate only the response text, no additional formatting.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return self.standard_responses.get("error", "I apologize for the technical difficulty. How can I help you with pre-settlement funding?")
    
    def _prepare_conversation_context(self, conversation_history: List[Dict[str, Any]] = None,
                                    entities: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Prepare conversation context for AI response generation
        """
        context = {
            "conversation_length": len(conversation_history) if conversation_history else 0,
            "entities_collected": entities or {},
            "previous_topics": []
        }
        
        if conversation_history:
            # Extract topics from recent messages
            recent_messages = conversation_history[-3:]  # Last 3 exchanges
            for msg in recent_messages:
                if msg.get("intent"):
                    context["previous_topics"].append(msg["intent"])
        
        return context
    
    def _needs_follow_up(self, intent: str, current_state: str, entities: Dict[str, Any]) -> bool:
        """
        Determine if follow-up questions are needed
        """
        # Need follow-up for incomplete information gathering
        follow_up_intents = ["qualification_response", "personal_info", "case_details"]
        
        # Need follow-up if in data collection state
        if current_state == self.conversation_states["DATA_COLLECTION"]:
            return True
        
        # Need follow-up for certain intents
        if intent in follow_up_intents:
            return True
        
        # Need follow-up if key entities are missing
        required_entities = ["case_type", "phone", "email"]
        if not any(entity in entities for entity in required_entities):
            return True
        
        return False
    
    async def qualify_lead(self, conversation_data: Dict[str, Any]) -> QualificationResult:
        """
        Qualify lead based on conversation data and AI analysis
        """
        try:
            # Extract qualification factors from conversation
            qualification_factors = await self._extract_qualification_factors(conversation_data)
            
            # Score qualification using AI
            qualification_score = await self._calculate_qualification_score(qualification_factors)
            
            # Determine qualification status
            qualified = qualification_score >= 60  # 60% threshold
            
            # Identify qualifying and disqualifying factors
            qualifying_factors, disqualifying_factors = self._analyze_qualification_factors(
                qualification_factors, qualified
            )
            
            # Generate next steps
            next_steps = await self._generate_next_steps(qualified, qualification_factors)
            
            # Extract collected data
            data_collected = self._extract_collected_data(conversation_data)
            
            return QualificationResult(
                qualified=qualified,
                qualification_score=qualification_score,
                qualifying_factors=qualifying_factors,
                disqualifying_factors=disqualifying_factors,
                next_steps=next_steps,
                data_collected=data_collected
            )
            
        except Exception as e:
            print(f"Error qualifying lead: {e}")
            return self._create_default_qualification()
    
    async def _extract_qualification_factors(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract qualification factors from conversation using AI
        """
        messages = conversation_data.get("messages", [])
        combined_text = " ".join([msg.get("user_input", "") for msg in messages])
        
        prompt = f"""
        Analyze this conversation to extract qualification factors for pre-settlement funding.
        
        Conversation text: {combined_text}
        
        Extract and assess these qualification factors (true/false/unknown):
        
        1. HAS_ATTORNEY: Does the person have legal representation?
        2. HAS_PERSONAL_INJURY_CASE: Is this a personal injury case?
        3. CASE_IS_ACTIVE: Is the case currently active/ongoing?
        4. HAS_SIGNIFICANT_INJURIES: Are the injuries significant enough for funding?
        5. NEEDS_FUNDING: Does the person need financial assistance?
        6. REALISTIC_EXPECTATIONS: Do they have realistic expectations about funding?
        7. GOOD_COMMUNICATION: Are they communicating clearly and responsively?
        
        Also extract:
        - CASE_TYPE: Type of case if mentioned
        - ESTIMATED_CASE_VALUE: Any mention of case value
        - FUNDING_NEED_AMOUNT: Amount they need if mentioned
        - URGENCY_LEVEL: How urgent their need is (low/medium/high)
        
        Return as JSON:
        {{
            "has_attorney": true/false/null,
            "has_personal_injury_case": true/false/null,
            "case_is_active": true/false/null,
            "has_significant_injuries": true/false/null,
            "needs_funding": true/false/null,
            "realistic_expectations": true/false/null,
            "good_communication": true/false/null,
            "case_type": "string or null",
            "estimated_case_value": "string or null",
            "funding_need_amount": "string or null",
            "urgency_level": "low/medium/high"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            factors = json.loads(content)
            return factors
            
        except Exception as e:
            print(f"Error extracting qualification factors: {e}")
            return self._get_default_qualification_factors()
    
    async def _calculate_qualification_score(self, qualification_factors: Dict[str, Any]) -> float:
        """
        Calculate qualification score using AI analysis
        """
        prompt = f"""
        Calculate a qualification score (0-100) for pre-settlement funding based on these factors.
        
        Qualification factors: {json.dumps(qualification_factors)}
        
        Scoring guidelines:
        - Has attorney: +25 points (required)
        - Personal injury case: +20 points (required)
        - Case is active: +15 points
        - Significant injuries: +15 points
        - Needs funding: +10 points
        - Realistic expectations: +10 points
        - Good communication: +5 points
        
        Subtract points for negative factors or missing required information.
        
        Return only the numeric score (0-100).
        """
        
        try:
            response = self.model.generate_content(prompt)
            score_text = response.text.strip()
            
            # Extract numeric score
            score = float(re.findall(r'\d+(?:\.\d+)?', score_text)[0])
            return min(100, max(0, score))
            
        except Exception as e:
            print(f"Error calculating qualification score: {e}")
            return 50.0  # Default neutral score
    
    def _analyze_qualification_factors(self, qualification_factors: Dict[str, Any], 
                                     qualified: bool) -> Tuple[List[str], List[str]]:
        """
        Analyze qualification factors to identify positive and negative aspects
        """
        qualifying_factors = []
        disqualifying_factors = []
        
        # Check each factor
        if qualification_factors.get("has_attorney"):
            qualifying_factors.append("Has legal representation")
        elif qualification_factors.get("has_attorney") is False:
            disqualifying_factors.append("No legal representation")
        
        if qualification_factors.get("has_personal_injury_case"):
            qualifying_factors.append("Personal injury case")
        elif qualification_factors.get("has_personal_injury_case") is False:
            disqualifying_factors.append("Not a personal injury case")
        
        if qualification_factors.get("case_is_active"):
            qualifying_factors.append("Case is active")
        elif qualification_factors.get("case_is_active") is False:
            disqualifying_factors.append("Case is not active")
        
        if qualification_factors.get("has_significant_injuries"):
            qualifying_factors.append("Significant injuries documented")
        elif qualification_factors.get("has_significant_injuries") is False:
            disqualifying_factors.append("Insufficient injury severity")
        
        if qualification_factors.get("needs_funding"):
            qualifying_factors.append("Expressed need for funding")
        
        return qualifying_factors, disqualifying_factors
    
    async def _generate_next_steps(self, qualified: bool, 
                                 qualification_factors: Dict[str, Any]) -> List[str]:
        """
        Generate next steps based on qualification result
        """
        if qualified:
            return [
                "Connect with funding specialist for detailed case review",
                "Prepare case documentation for underwriting",
                "Schedule consultation call",
                "Complete formal application process"
            ]
        else:
            next_steps = ["Thank the prospect for their interest"]
            
            # Provide specific guidance based on disqualifying factors
            if not qualification_factors.get("has_attorney"):
                next_steps.append("Recommend finding qualified legal representation first")
            
            if not qualification_factors.get("has_personal_injury_case"):
                next_steps.append("Explain that we only fund personal injury cases")
            
            if not qualification_factors.get("case_is_active"):
                next_steps.append("Suggest contacting us when case becomes active")
            
            next_steps.append("Provide educational resources about pre-settlement funding")
            return next_steps
    
    def _extract_collected_data(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract all collected data from conversation
        """
        collected_data = {}
        
        # Combine all entities from all messages
        messages = conversation_data.get("messages", [])
        for message in messages:
            entities = message.get("entities_extracted", {})
            collected_data.update(entities)
        
        # Add conversation metadata
        collected_data.update({
            "conversation_length": len(messages),
            "session_duration": "unknown",  # Would calculate from timestamps
            "user_engagement": "high" if len(messages) > 10 else "medium" if len(messages) > 5 else "low"
        })
        
        return collected_data
    
    def _get_default_qualification_factors(self) -> Dict[str, Any]:
        """
        Get default qualification factors when extraction fails
        """
        return {
            "has_attorney": None,
            "has_personal_injury_case": None,
            "case_is_active": None,
            "has_significant_injuries": None,
            "needs_funding": None,
            "realistic_expectations": None,
            "good_communication": True,  # Assume good if they're communicating
            "case_type": None,
            "estimated_case_value": None,
            "funding_need_amount": None,
            "urgency_level": "medium"
        }
    
    def _create_default_qualification(self) -> QualificationResult:
        """
        Create default qualification result when analysis fails
        """
        return QualificationResult(
            qualified=False,
            qualification_score=0.0,
            qualifying_factors=[],
            disqualifying_factors=["Unable to complete qualification analysis"],
            next_steps=["Manual review required", "Contact prospect directly"],
            data_collected={}
        )
    
    def _generate_message_id(self) -> str:
        """
        Generate unique message ID
        """
        return f"msg_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(datetime.now()) % 10000}"
    
    def _create_error_message(self, user_input: str, session_id: str, error: str) -> ChatMessage:
        """
        Create error message when processing fails
        """
        return ChatMessage(
            message_id=self._generate_message_id(),
            user_input=user_input,
            bot_response=self.standard_responses["error"],
            timestamp=datetime.now(),
            session_id=session_id,
            intent="error",
            entities_extracted={},
            follow_up_needed=True
        )
    
    async def generate_conversation_summary(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate summary of entire conversation for handoff to human agent
        """
        messages = conversation_data.get("messages", [])
        if not messages:
            return {"error": "No conversation data to summarize"}
        
        conversation_text = []
        for msg in messages:
            conversation_text.append(f"User: {msg.get('user_input', '')}")
            conversation_text.append(f"Bot: {msg.get('bot_response', '')}")
        
        full_conversation = "\n".join(conversation_text)
        
        prompt = f"""
        Summarize this chatbot conversation for handoff to a human specialist.
        
        Conversation:
        {full_conversation}
        
        Provide a structured summary including:
        1. Lead qualification status
        2. Key information collected
        3. Main concerns or questions raised
        4. Recommended next actions
        5. Conversation quality assessment
        
        Return as JSON:
        {{
            "qualification_status": "qualified/not_qualified/needs_review",
            "key_information": {{
                "case_type": "string",
                "contact_info": "string",
                "funding_need": "string",
                "timeline": "string"
            }},
            "main_concerns": ["concern1", "concern2", ...],
            "recommended_actions": ["action1", "action2", ...],
            "conversation_quality": "excellent/good/fair/poor",
            "urgency_level": "high/medium/low",
            "summary": "brief overall summary"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            summary = json.loads(content)
            return summary
            
        except Exception as e:
            print(f"Error generating conversation summary: {e}")
            return {
                "error": str(e),
                "summary": "Manual conversation review required",
                "qualification_status": "needs_review"
            }
    
    def get_chatbot_analytics(self, session_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate analytics on chatbot performance and user interactions
        """
        if not session_data:
            return {"error": "No session data provided"}
        
        total_sessions = len(session_data)
        total_messages = sum(len(session.get("messages", [])) for session in session_data)
        
        # Calculate engagement metrics
        avg_messages_per_session = total_messages / total_sessions if total_sessions > 0 else 0
        
        # Qualification rates
        qualified_sessions = sum(1 for session in session_data 
                               if session.get("qualification_result", {}).get("qualified", False))
        qualification_rate = (qualified_sessions / total_sessions) * 100 if total_sessions > 0 else 0
        
        # Common intents
        intent_counts = {}
        for session in session_data:
            for message in session.get("messages", []):
                intent = message.get("intent", "unknown")
                intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        # Top entities collected
        entity_counts = {}
        for session in session_data:
            for message in session.get("messages", []):
                entities = message.get("entities_extracted", {})
                for entity_type in entities.keys():
                    entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "avg_messages_per_session": round(avg_messages_per_session, 1),
            "qualification_rate": round(qualification_rate, 1),
            "qualified_sessions": qualified_sessions,
            "common_intents": dict(sorted(intent_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            "entities_collected": dict(sorted(entity_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            "analysis_date": datetime.now().isoformat()
        }
