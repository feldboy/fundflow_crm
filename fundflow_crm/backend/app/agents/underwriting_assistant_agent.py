import google.generativeai as genai
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import asyncio
from dataclasses import dataclass

@dataclass
class UnderwritingRecommendation:
    """Structure for underwriting recommendations"""
    decision: str  # "APPROVE", "DECLINE", "CONDITIONAL", "NEEDS_REVIEW"
    confidence: float
    reasoning: List[str]
    conditions: List[str]
    additional_info_needed: List[str]
    recommended_amount: Optional[float]
    risk_mitigation: List[str]

class UnderwritingAssistantAgent:
    """
    Advanced AI agent that assists underwriters in making funding decisions
    """
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Underwriting criteria and thresholds
        self.underwriting_criteria = {
            "minimum_case_value": 10000,
            "maximum_funding_ratio": 0.15,  # 15% of estimated case value
            "minimum_liability_confidence": 60,
            "maximum_acceptable_risk": 70,
            "required_documents": [
                "retainer_agreement", "incident_report", "medical_records"
            ],
            "case_type_multipliers": {
                "Auto Accident": 1.0,
                "Slip and Fall": 1.2,
                "Medical Malpractice": 1.5,
                "Workers Compensation": 0.9,
                "Product Liability": 1.3,
                "Other": 1.1
            }
        }
    
    async def comprehensive_underwriting_analysis(self, 
                                                plaintiff_data: Dict[str, Any],
                                                risk_analysis: Dict[str, Any],
                                                document_analysis: List[Dict[str, Any]] = None,
                                                law_firm_data: Dict[str, Any] = None,
                                                comparable_cases: List[Dict[str, Any]] = None) -> UnderwritingRecommendation:
        """
        Perform comprehensive underwriting analysis using all available data
        """
        try:
            # Analyze case fundamentals
            case_fundamentals = await self._analyze_case_fundamentals(plaintiff_data, document_analysis)
            
            # Evaluate liability prospects
            liability_assessment = await self._evaluate_liability_prospects(
                plaintiff_data, document_analysis, risk_analysis
            )
            
            # Estimate case value
            case_valuation = await self._estimate_case_value(
                plaintiff_data, document_analysis, comparable_cases
            )
            
            # Assess law firm quality
            law_firm_assessment = self._assess_law_firm_quality(law_firm_data)
            
            # Evaluate financial factors
            financial_assessment = self._evaluate_financial_factors(
                plaintiff_data, case_valuation, risk_analysis
            )
            
            # Generate comprehensive recommendation
            recommendation = await self._generate_underwriting_recommendation(
                case_fundamentals, liability_assessment, case_valuation,
                law_firm_assessment, financial_assessment, risk_analysis
            )
            
            return recommendation
            
        except Exception as e:
            print(f"Error in comprehensive underwriting analysis: {e}")
            return self._create_error_recommendation(str(e))
    
    async def _analyze_case_fundamentals(self, plaintiff_data: Dict[str, Any],
                                       document_analysis: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze fundamental aspects of the case
        """
        case_type = plaintiff_data.get("caseType", "Other")
        incident_date = plaintiff_data.get("incidentDate")
        case_notes = plaintiff_data.get("caseNotes", "")
        
        # Calculate case age
        case_age_days = 0
        if incident_date:
            try:
                if isinstance(incident_date, str):
                    incident_dt = datetime.fromisoformat(incident_date.replace('Z', '+00:00'))
                else:
                    incident_dt = incident_date
                case_age_days = (datetime.now(incident_dt.tzinfo) - incident_dt).days
            except Exception:
                pass
        
        # Analyze case notes with AI
        notes_analysis = await self._analyze_case_notes(case_notes, case_type)
        
        # Document availability assessment
        doc_availability = self._assess_document_availability(document_analysis)
        
        fundamentals = {
            "case_type": case_type,
            "case_age_days": case_age_days,
            "case_age_category": self._categorize_case_age(case_age_days),
            "notes_analysis": notes_analysis,
            "document_availability": doc_availability,
            "complexity_score": self._calculate_complexity_score(case_type, case_notes, document_analysis),
            "statute_of_limitations_risk": self._assess_statute_risk(case_type, case_age_days)
        }
        
        return fundamentals
    
    async def _analyze_case_notes(self, case_notes: str, case_type: str) -> Dict[str, Any]:
        """
        Use AI to analyze case notes for key insights
        """
        if not case_notes:
            return {"analysis": "No case notes provided", "key_points": [], "concerns": []}
        
        prompt = f"""
        Analyze the following case notes for a {case_type} case from an underwriting perspective.
        
        Case Notes:
        {case_notes}
        
        Provide analysis focusing on:
        1. Key facts that support the case
        2. Potential weaknesses or concerns
        3. Clarity of liability
        4. Severity of damages/injuries
        5. Any red flags for funding
        
        Return as JSON:
        {{
            "key_points": ["point1", "point2", ...],
            "concerns": ["concern1", "concern2", ...],
            "liability_clarity": "clear/unclear/disputed",
            "damage_severity": "minor/moderate/severe",
            "funding_suitability": "excellent/good/fair/poor",
            "summary": "brief summary of the case strength"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            analysis = json.loads(content)
            return analysis
            
        except Exception as e:
            print(f"Error analyzing case notes: {e}")
            return {
                "key_points": [],
                "concerns": [f"Error analyzing notes: {str(e)}"],
                "liability_clarity": "unclear",
                "damage_severity": "unknown",
                "funding_suitability": "unknown",
                "summary": "Manual analysis required"
            }
    
    async def _evaluate_liability_prospects(self, plaintiff_data: Dict[str, Any],
                                          document_analysis: List[Dict[str, Any]] = None,
                                          risk_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Evaluate the likelihood of establishing liability
        """
        case_type = plaintiff_data.get("caseType", "Other")
        case_notes = plaintiff_data.get("caseNotes", "")
        
        # Extract liability indicators from documents
        liability_indicators = []
        if document_analysis:
            for doc in document_analysis:
                key_findings = doc.get("key_findings", [])
                liability_indicators.extend([
                    finding for finding in key_findings 
                    if any(keyword in finding.lower() for keyword in [
                        "liability", "fault", "negligence", "breach", "violation"
                    ])
                ])
        
        # AI analysis of liability prospects
        liability_assessment = await self._ai_liability_analysis(
            case_type, case_notes, liability_indicators
        )
        
        # Rule-based liability scoring
        rule_based_score = self._rule_based_liability_score(case_type, risk_analysis)
        
        # Combine assessments
        combined_score = (liability_assessment.get("score", 50) * 0.7) + (rule_based_score * 0.3)
        
        return {
            "liability_score": round(combined_score, 1),
            "liability_confidence": liability_assessment.get("confidence", "medium"),
            "key_factors": liability_assessment.get("key_factors", []),
            "concerns": liability_assessment.get("concerns", []),
            "supporting_evidence": liability_indicators,
            "assessment_summary": liability_assessment.get("summary", "")
        }
    
    async def _ai_liability_analysis(self, case_type: str, case_notes: str, 
                                   liability_indicators: List[str]) -> Dict[str, Any]:
        """
        AI-powered liability analysis
        """
        prompt = f"""
        As an expert legal analyst, evaluate the liability prospects for this {case_type} case.
        
        Case Information:
        - Case Type: {case_type}
        - Case Notes: {case_notes}
        - Liability Indicators: {json.dumps(liability_indicators)}
        
        Assess the likelihood of establishing defendant liability on a scale of 0-100:
        - 0-30: Poor liability prospects
        - 31-60: Moderate liability prospects  
        - 61-85: Good liability prospects
        - 86-100: Excellent liability prospects
        
        Consider factors such as:
        - Clear evidence of negligence or fault
        - Witness testimony availability
        - Documentary evidence strength
        - Potential defenses
        - Comparative/contributory negligence issues
        
        Return as JSON:
        {{
            "score": 0-100,
            "confidence": "low/medium/high",
            "key_factors": ["factor1", "factor2", ...],
            "concerns": ["concern1", "concern2", ...],
            "summary": "brief assessment of liability prospects"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            assessment = json.loads(content)
            return assessment
            
        except Exception as e:
            print(f"Error in AI liability analysis: {e}")
            return {
                "score": 50,
                "confidence": "low",
                "key_factors": [],
                "concerns": [f"Analysis error: {str(e)}"],
                "summary": "Manual review required"
            }
    
    def _rule_based_liability_score(self, case_type: str, risk_analysis: Dict[str, Any]) -> float:
        """
        Calculate liability score based on rules and risk factors
        """
        base_scores = {
            "Auto Accident": 70,
            "Slip and Fall": 55,
            "Medical Malpractice": 45,
            "Workers Compensation": 75,
            "Product Liability": 60,
            "Other": 50
        }
        
        base_score = base_scores.get(case_type, 50)
        
        # Adjust based on risk analysis
        if risk_analysis:
            risk_score = risk_analysis.get("risk_score", 50)
            # Higher risk = lower liability prospects
            adjustment = (50 - risk_score) * 0.3
            base_score += adjustment
        
        return max(0, min(100, base_score))
    
    async def _estimate_case_value(self, plaintiff_data: Dict[str, Any],
                                 document_analysis: List[Dict[str, Any]] = None,
                                 comparable_cases: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Estimate the potential value of the case
        """
        case_type = plaintiff_data.get("caseType", "Other")
        case_notes = plaintiff_data.get("caseNotes", "")
        
        # Extract damage indicators from documents
        damage_indicators = []
        if document_analysis:
            for doc in document_analysis:
                key_findings = doc.get("key_findings", [])
                damage_indicators.extend([
                    finding for finding in key_findings 
                    if any(keyword in finding.lower() for keyword in [
                        "injury", "damage", "treatment", "surgery", "disability", "pain"
                    ])
                ])
        
        # AI-powered valuation
        ai_valuation = await self._ai_case_valuation(case_type, case_notes, damage_indicators)
        
        # Comparable case analysis
        comparable_analysis = self._analyze_comparable_cases(case_type, comparable_cases)
        
        # Combine valuations
        estimated_value = self._combine_valuations(ai_valuation, comparable_analysis)
        
        return {
            "estimated_value": estimated_value,
            "value_range": {
                "low": estimated_value * 0.6,
                "high": estimated_value * 1.4
            },
            "ai_assessment": ai_valuation,
            "comparable_analysis": comparable_analysis,
            "confidence_level": self._calculate_valuation_confidence(
                ai_valuation, comparable_analysis, damage_indicators
            )
        }
    
    async def _ai_case_valuation(self, case_type: str, case_notes: str, 
                               damage_indicators: List[str]) -> Dict[str, Any]:
        """
        AI-powered case valuation
        """
        prompt = f"""
        As an expert case valuation analyst, estimate the potential settlement value for this {case_type} case.
        
        Case Information:
        - Case Type: {case_type}
        - Case Notes: {case_notes}
        - Damage Indicators: {json.dumps(damage_indicators)}
        
        Consider typical settlement ranges for this type of case and the specific factors present.
        
        Provide an estimated settlement value range and explain your reasoning.
        
        Return as JSON:
        {{
            "estimated_value": dollar_amount,
            "reasoning": "explanation of valuation factors",
            "key_value_drivers": ["driver1", "driver2", ...],
            "value_detractors": ["detractor1", "detractor2", ...],
            "confidence": "low/medium/high"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            valuation = json.loads(content)
            return valuation
            
        except Exception as e:
            print(f"Error in AI case valuation: {e}")
            return {
                "estimated_value": 50000,  # Default conservative estimate
                "reasoning": f"Valuation error: {str(e)}",
                "key_value_drivers": [],
                "value_detractors": [],
                "confidence": "low"
            }
    
    def _analyze_comparable_cases(self, case_type: str, 
                                comparable_cases: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze comparable cases for valuation insights
        """
        if not comparable_cases:
            return {
                "average_value": None,
                "case_count": 0,
                "analysis": "No comparable cases available"
            }
        
        # Filter cases by type
        relevant_cases = [case for case in comparable_cases 
                         if case.get("case_type") == case_type]
        
        if not relevant_cases:
            return {
                "average_value": None,
                "case_count": 0,
                "analysis": f"No comparable {case_type} cases available"
            }
        
        # Calculate statistics
        values = [case.get("settlement_value", 0) for case in relevant_cases]
        values = [v for v in values if v > 0]  # Filter out zero values
        
        if not values:
            return {
                "average_value": None,
                "case_count": len(relevant_cases),
                "analysis": "No settlement values available in comparable cases"
            }
        
        return {
            "average_value": sum(values) / len(values),
            "median_value": sorted(values)[len(values) // 2],
            "value_range": {"min": min(values), "max": max(values)},
            "case_count": len(relevant_cases),
            "analysis": f"Based on {len(relevant_cases)} comparable {case_type} cases"
        }
    
    def _combine_valuations(self, ai_valuation: Dict[str, Any], 
                          comparable_analysis: Dict[str, Any]) -> float:
        """
        Combine AI and comparable case valuations
        """
        ai_value = ai_valuation.get("estimated_value", 50000)
        comparable_value = comparable_analysis.get("average_value")
        
        if comparable_value:
            # Weight: 60% AI, 40% comparables
            combined_value = (ai_value * 0.6) + (comparable_value * 0.4)
        else:
            combined_value = ai_value
        
        return round(combined_value, 2)
    
    def _assess_law_firm_quality(self, law_firm_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Assess the quality and capability of the representing law firm
        """
        if not law_firm_data:
            return {
                "quality_score": 50,
                "assessment": "No law firm data available",
                "factors": []
            }
        
        # Basic quality indicators
        quality_factors = []
        score = 50  # Base score
        
        # Firm size and experience (if available)
        if law_firm_data.get("employees"):
            employee_count = len(law_firm_data["employees"])
            if employee_count > 10:
                score += 10
                quality_factors.append("Large firm with substantial resources")
            elif employee_count > 5:
                score += 5
                quality_factors.append("Medium-sized firm")
        
        # Contact information completeness
        contact_fields = ["phone", "email", "website", "address"]
        complete_contacts = sum(1 for field in contact_fields 
                              if law_firm_data.get(field))
        
        if complete_contacts >= 3:
            score += 5
            quality_factors.append("Complete contact information")
        
        # Professional presentation
        if law_firm_data.get("website"):
            score += 5
            quality_factors.append("Professional web presence")
        
        return {
            "quality_score": min(100, score),
            "assessment": "Adequate" if score >= 60 else "Needs verification",
            "factors": quality_factors
        }
    
    def _evaluate_financial_factors(self, plaintiff_data: Dict[str, Any],
                                  case_valuation: Dict[str, Any],
                                  risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate financial aspects of the funding decision
        """
        requested_amount = plaintiff_data.get("requestedAmount", 0)
        estimated_value = case_valuation.get("estimated_value", 0)
        risk_score = risk_analysis.get("risk_score", 50)
        
        # Calculate funding ratio
        funding_ratio = (requested_amount / estimated_value) if estimated_value > 0 else 1.0
        
        # Assess financial viability
        max_recommended = estimated_value * self.underwriting_criteria["maximum_funding_ratio"]
        
        financial_assessment = {
            "requested_amount": requested_amount,
            "estimated_case_value": estimated_value,
            "funding_ratio": round(funding_ratio, 3),
            "max_recommended_funding": round(max_recommended, 2),
            "funding_ratio_acceptable": funding_ratio <= self.underwriting_criteria["maximum_funding_ratio"],
            "risk_adjusted_amount": self._calculate_risk_adjusted_amount(
                requested_amount, risk_score, estimated_value
            )
        }
        
        return financial_assessment
    
    def _calculate_risk_adjusted_amount(self, requested_amount: float, 
                                      risk_score: float, estimated_value: float) -> float:
        """
        Calculate risk-adjusted funding amount
        """
        # Base adjustment based on risk score
        risk_multiplier = 1.0 - (risk_score / 200)  # Higher risk = lower multiplier
        
        # Ensure minimum multiplier
        risk_multiplier = max(0.3, risk_multiplier)
        
        # Apply to requested amount
        risk_adjusted = requested_amount * risk_multiplier
        
        # Cap at maximum funding ratio
        max_funding = estimated_value * self.underwriting_criteria["maximum_funding_ratio"]
        
        return min(risk_adjusted, max_funding)
    
    async def _generate_underwriting_recommendation(self, 
                                                  case_fundamentals: Dict[str, Any],
                                                  liability_assessment: Dict[str, Any],
                                                  case_valuation: Dict[str, Any],
                                                  law_firm_assessment: Dict[str, Any],
                                                  financial_assessment: Dict[str, Any],
                                                  risk_analysis: Dict[str, Any]) -> UnderwritingRecommendation:
        """
        Generate comprehensive underwriting recommendation
        """
        # Scoring factors
        scores = {
            "liability": liability_assessment.get("liability_score", 50),
            "risk": 100 - risk_analysis.get("risk_score", 50),  # Invert risk score
            "financial": 100 if financial_assessment.get("funding_ratio_acceptable", False) else 30,
            "law_firm": law_firm_assessment.get("quality_score", 50),
            "case_age": self._score_case_age(case_fundamentals.get("case_age_days", 0))
        }
        
        # Weighted overall score
        weights = {"liability": 0.3, "risk": 0.25, "financial": 0.2, "law_firm": 0.15, "case_age": 0.1}
        overall_score = sum(scores[factor] * weights[factor] for factor in scores)
        
        # Determine decision
        if overall_score >= 75:
            decision = "APPROVE"
            confidence = 0.85
        elif overall_score >= 60:
            decision = "CONDITIONAL"
            confidence = 0.70
        elif overall_score >= 40:
            decision = "NEEDS_REVIEW"
            confidence = 0.60
        else:
            decision = "DECLINE"
            confidence = 0.80
        
        # Generate reasoning
        reasoning = self._generate_reasoning(scores, case_fundamentals, liability_assessment, 
                                           financial_assessment, risk_analysis)
        
        # Generate conditions (for conditional approvals)
        conditions = self._generate_conditions(decision, scores, financial_assessment, 
                                             risk_analysis) if decision == "CONDITIONAL" else []
        
        # Additional information needed
        additional_info = self._identify_additional_info_needed(case_fundamentals, 
                                                              liability_assessment, decision)
        
        # Risk mitigation strategies
        risk_mitigation = self._suggest_risk_mitigation(risk_analysis, decision)
        
        # Recommended amount
        recommended_amount = self._determine_recommended_amount(decision, financial_assessment)
        
        return UnderwritingRecommendation(
            decision=decision,
            confidence=confidence,
            reasoning=reasoning,
            conditions=conditions,
            additional_info_needed=additional_info,
            recommended_amount=recommended_amount,
            risk_mitigation=risk_mitigation
        )
    
    def _generate_reasoning(self, scores: Dict[str, float], case_fundamentals: Dict[str, Any],
                          liability_assessment: Dict[str, Any], financial_assessment: Dict[str, Any],
                          risk_analysis: Dict[str, Any]) -> List[str]:
        """
        Generate reasoning for the underwriting decision
        """
        reasoning = []
        
        # Liability reasoning
        if scores["liability"] >= 70:
            reasoning.append("Strong liability prospects based on case analysis")
        elif scores["liability"] >= 50:
            reasoning.append("Moderate liability prospects - case has merit")
        else:
            reasoning.append("Weak liability prospects - significant concerns identified")
        
        # Risk reasoning
        risk_score = risk_analysis.get("risk_score", 50)
        if risk_score <= 40:
            reasoning.append("Low risk profile - good funding candidate")
        elif risk_score <= 60:
            reasoning.append("Moderate risk profile - acceptable with monitoring")
        else:
            reasoning.append("High risk profile - requires careful consideration")
        
        # Financial reasoning
        if financial_assessment.get("funding_ratio_acceptable", False):
            reasoning.append("Requested amount within acceptable funding parameters")
        else:
            reasoning.append("Requested amount exceeds recommended funding ratio")
        
        # Case age reasoning
        case_age = case_fundamentals.get("case_age_days", 0)
        if case_age > 730:
            reasoning.append("Case age raises statute of limitations concerns")
        elif case_age < 30:
            reasoning.append("Recent case with fresh evidence")
        
        return reasoning
    
    def _generate_conditions(self, decision: str, scores: Dict[str, float],
                           financial_assessment: Dict[str, Any], 
                           risk_analysis: Dict[str, Any]) -> List[str]:
        """
        Generate conditions for conditional approvals
        """
        conditions = []
        
        if decision != "CONDITIONAL":
            return conditions
        
        # Financial conditions
        if not financial_assessment.get("funding_ratio_acceptable", False):
            recommended = financial_assessment.get("risk_adjusted_amount", 0)
            conditions.append(f"Reduce funding amount to ${recommended:,.2f}")
        
        # Risk conditions
        risk_score = risk_analysis.get("risk_score", 50)
        if risk_score > 60:
            conditions.append("Enhanced monitoring and progress reporting required")
        
        # Liability conditions
        if scores["liability"] < 60:
            conditions.append("Additional liability documentation required")
        
        return conditions
    
    def _identify_additional_info_needed(self, case_fundamentals: Dict[str, Any],
                                       liability_assessment: Dict[str, Any],
                                       decision: str) -> List[str]:
        """
        Identify additional information needed for the decision
        """
        additional_info = []
        
        # Document gaps
        doc_availability = case_fundamentals.get("document_availability", {})
        missing_docs = doc_availability.get("missing_documents", [])
        if missing_docs:
            additional_info.extend([f"Provide {doc}" for doc in missing_docs])
        
        # Liability information
        if liability_assessment.get("liability_score", 50) < 60:
            additional_info.append("Additional evidence of defendant liability")
        
        # Case-specific information
        if decision in ["NEEDS_REVIEW", "CONDITIONAL"]:
            additional_info.append("Updated case status and settlement discussions")
        
        return additional_info
    
    def _suggest_risk_mitigation(self, risk_analysis: Dict[str, Any], decision: str) -> List[str]:
        """
        Suggest risk mitigation strategies
        """
        mitigation = []
        
        risk_score = risk_analysis.get("risk_score", 50)
        
        if risk_score > 50:
            mitigation.append("Regular case progress monitoring")
        
        if risk_score > 70:
            mitigation.extend([
                "Quarterly attorney communication",
                "Medical record updates as available",
                "Settlement negotiation status updates"
            ])
        
        if decision == "CONDITIONAL":
            mitigation.append("Approval contingent on meeting specified conditions")
        
        return mitigation
    
    def _determine_recommended_amount(self, decision: str, 
                                    financial_assessment: Dict[str, Any]) -> Optional[float]:
        """
        Determine recommended funding amount
        """
        if decision in ["DECLINE", "NEEDS_REVIEW"]:
            return None
        
        requested = financial_assessment.get("requested_amount", 0)
        risk_adjusted = financial_assessment.get("risk_adjusted_amount", 0)
        
        return min(requested, risk_adjusted) if risk_adjusted > 0 else requested
    
    def _score_case_age(self, case_age_days: int) -> float:
        """
        Score case based on age (for statute of limitations considerations)
        """
        if case_age_days <= 180:
            return 90  # Excellent
        elif case_age_days <= 365:
            return 80  # Good
        elif case_age_days <= 730:
            return 60  # Fair
        elif case_age_days <= 1095:
            return 40  # Poor
        else:
            return 20  # Very poor
    
    def _categorize_case_age(self, case_age_days: int) -> str:
        """
        Categorize case age for reporting
        """
        if case_age_days <= 90:
            return "Fresh"
        elif case_age_days <= 365:
            return "Recent"
        elif case_age_days <= 730:
            return "Moderate"
        else:
            return "Aged"
    
    def _calculate_complexity_score(self, case_type: str, case_notes: str, 
                                  document_analysis: List[Dict[str, Any]] = None) -> float:
        """
        Calculate case complexity score
        """
        base_complexity = {
            "Auto Accident": 30,
            "Slip and Fall": 40,
            "Medical Malpractice": 80,
            "Workers Compensation": 50,
            "Product Liability": 70,
            "Other": 45
        }
        
        complexity = base_complexity.get(case_type, 45)
        
        # Adjust based on case notes length (more details = potentially more complex)
        if case_notes:
            note_length = len(case_notes)
            if note_length > 1000:
                complexity += 10
            elif note_length > 500:
                complexity += 5
        
        # Adjust based on number of documents
        if document_analysis:
            doc_count = len(document_analysis)
            if doc_count > 10:
                complexity += 15
            elif doc_count > 5:
                complexity += 10
        
        return min(100, complexity)
    
    def _assess_statute_risk(self, case_type: str, case_age_days: int) -> Dict[str, Any]:
        """
        Assess statute of limitations risk
        """
        # Typical statute periods (simplified)
        statute_periods = {
            "Auto Accident": 1095,  # 3 years
            "Slip and Fall": 1095,  # 3 years
            "Medical Malpractice": 730,  # 2 years
            "Workers Compensation": 365,  # 1 year
            "Product Liability": 1095,  # 3 years
            "Other": 1095  # 3 years default
        }
        
        statute_limit = statute_periods.get(case_type, 1095)
        days_remaining = statute_limit - case_age_days
        
        if days_remaining <= 0:
            risk_level = "CRITICAL"
            risk_score = 100
        elif days_remaining <= 90:
            risk_level = "HIGH"
            risk_score = 80
        elif days_remaining <= 180:
            risk_level = "MEDIUM"
            risk_score = 60
        else:
            risk_level = "LOW"
            risk_score = 20
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "days_remaining": max(0, days_remaining),
            "statute_limit_days": statute_limit
        }
    
    def _assess_document_availability(self, document_analysis: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Assess availability of required documents
        """
        required_docs = self.underwriting_criteria["required_documents"]
        
        if not document_analysis:
            return {
                "available_documents": [],
                "missing_documents": required_docs.copy(),
                "completeness_score": 0
            }
        
        available_types = [doc.get("document_type", "").lower() for doc in document_analysis]
        
        # Map required documents to available types
        doc_mapping = {
            "retainer_agreement": "legal_retainer",
            "incident_report": "police_report",
            "medical_records": "medical_record"
        }
        
        available_required = []
        for req_doc in required_docs:
            mapped_type = doc_mapping.get(req_doc, req_doc)
            if mapped_type in available_types:
                available_required.append(req_doc)
        
        missing_docs = [doc for doc in required_docs if doc not in available_required]
        completeness_score = (len(available_required) / len(required_docs)) * 100
        
        return {
            "available_documents": available_required,
            "missing_documents": missing_docs,
            "completeness_score": round(completeness_score, 1),
            "total_documents": len(document_analysis)
        }
    
    def _calculate_valuation_confidence(self, ai_valuation: Dict[str, Any],
                                      comparable_analysis: Dict[str, Any],
                                      damage_indicators: List[str]) -> str:
        """
        Calculate confidence level for case valuation
        """
        confidence_score = 0
        
        # AI valuation confidence
        ai_confidence = ai_valuation.get("confidence", "medium")
        if ai_confidence == "high":
            confidence_score += 40
        elif ai_confidence == "medium":
            confidence_score += 25
        else:
            confidence_score += 10
        
        # Comparable cases availability
        comparable_count = comparable_analysis.get("case_count", 0)
        if comparable_count >= 10:
            confidence_score += 30
        elif comparable_count >= 5:
            confidence_score += 20
        elif comparable_count >= 1:
            confidence_score += 10
        
        # Evidence quality
        if len(damage_indicators) >= 5:
            confidence_score += 20
        elif len(damage_indicators) >= 3:
            confidence_score += 15
        elif len(damage_indicators) >= 1:
            confidence_score += 10
        
        # Categorize confidence
        if confidence_score >= 75:
            return "high"
        elif confidence_score >= 50:
            return "medium"
        else:
            return "low"
    
    def _create_error_recommendation(self, error_message: str) -> UnderwritingRecommendation:
        """
        Create error recommendation when analysis fails
        """
        return UnderwritingRecommendation(
            decision="NEEDS_REVIEW",
            confidence=0.0,
            reasoning=[f"Analysis error: {error_message}"],
            conditions=["Manual underwriter review required"],
            additional_info_needed=["Complete case file review"],
            recommended_amount=None,
            risk_mitigation=["Comprehensive manual analysis required"]
        )
