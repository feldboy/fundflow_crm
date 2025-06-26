import google.generativeai as genai
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import asyncio

class RiskScoringAgent:
    """
    Advanced AI agent for comprehensive risk analysis and scoring
    """
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Risk factor weights and scoring criteria
        self.risk_factors = {
            "case_type_risk": {
                "Auto Accident": 0.3,
                "Slip and Fall": 0.5,
                "Medical Malpractice": 0.7,
                "Workers Compensation": 0.4,
                "Product Liability": 0.6,
                "Other": 0.5
            },
            "financial_risk_thresholds": {
                "low": 5000,
                "medium": 25000,
                "high": 100000
            }
        }
    
    async def analyze_comprehensive_risk(self, plaintiff_data: Dict[str, Any], 
                                       case_documents: List[Dict] = None,
                                       communication_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Perform comprehensive risk analysis using AI and rule-based factors
        """
        try:
            # Prepare data for AI analysis
            analysis_data = self._prepare_analysis_data(plaintiff_data, case_documents, communication_history)
            
            # Run AI-powered risk assessment
            ai_assessment = await self._ai_risk_assessment(analysis_data)
            
            # Calculate rule-based risk factors
            rule_based_factors = self._calculate_rule_based_risk(plaintiff_data)
            
            # Combine AI and rule-based assessments
            comprehensive_score = self._combine_risk_assessments(ai_assessment, rule_based_factors)
            
            # Generate risk report
            risk_report = self._generate_risk_report(ai_assessment, rule_based_factors, comprehensive_score)
            
            return {
                "risk_score": comprehensive_score["overall_score"],
                "risk_level": comprehensive_score["risk_level"],
                "ai_assessment": ai_assessment,
                "rule_based_factors": rule_based_factors,
                "risk_report": risk_report,
                "recommendations": comprehensive_score["recommendations"],
                "confidence_score": comprehensive_score["confidence"],
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error in comprehensive risk analysis: {e}")
            return self._default_risk_assessment()
    
    async def _ai_risk_assessment(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use AI to assess risk factors from case data
        """
        prompt = f"""
        You are an expert underwriter for a pre-settlement funding company. Analyze the following case data and provide a comprehensive risk assessment.
        
        Case Data:
        {json.dumps(analysis_data, indent=2)}
        
        Analyze the following risk factors and provide scores (0-100, where 100 is highest risk):
        
        1. LIABILITY_RISK: How clear is the defendant's liability? Are there any contributory negligence issues?
        2. DAMAGES_RISK: Are the injuries/damages substantial enough to justify the requested funding?
        3. COLLECTIBILITY_RISK: How likely is it that the defendant/insurance can pay a judgment?
        4. TIME_RISK: How long might this case take to resolve?
        5. LEGAL_REPRESENTATION_RISK: Quality and experience of the representing law firm
        6. COMMUNICATION_RISK: How responsive and cooperative is the plaintiff?
        7. DOCUMENTATION_RISK: Are key documents available and complete?
        
        For each factor, provide:
        - score (0-100)
        - reasoning (brief explanation)
        - red_flags (list any concerning issues)
        - positive_indicators (list any favorable aspects)
        
        Also provide:
        - overall_assessment (summary of the case risk profile)
        - key_concerns (top 3 risk concerns)
        - mitigation_strategies (suggestions to reduce risk)
        
        Return as valid JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            # Parse JSON response
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            ai_assessment = json.loads(content)
            return ai_assessment
            
        except Exception as e:
            print(f"Error in AI risk assessment: {e}")
            return self._default_ai_assessment()
    
    def _calculate_rule_based_risk(self, plaintiff_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk based on predefined rules and thresholds
        """
        factors = {}
        
        # Case type risk
        case_type = plaintiff_data.get("caseType", "Other")
        factors["case_type_risk"] = {
            "score": self.risk_factors["case_type_risk"].get(case_type, 0.5) * 100,
            "factor": case_type,
            "reasoning": f"Base risk level for {case_type} cases"
        }
        
        # Financial risk based on requested amount
        requested_amount = plaintiff_data.get("requestedAmount", 0)
        if requested_amount == 0:
            financial_risk = 70  # High risk if no amount specified
            reasoning = "No funding amount specified - high uncertainty"
        elif requested_amount < self.risk_factors["financial_risk_thresholds"]["low"]:
            financial_risk = 30  # Lower risk for smaller amounts
            reasoning = "Low funding amount - manageable risk"
        elif requested_amount < self.risk_factors["financial_risk_thresholds"]["medium"]:
            financial_risk = 50  # Medium risk
            reasoning = "Moderate funding amount - standard risk"
        elif requested_amount < self.risk_factors["financial_risk_thresholds"]["high"]:
            financial_risk = 70  # Higher risk for large amounts
            reasoning = "High funding amount - increased risk"
        else:
            financial_risk = 85  # Very high risk for very large amounts
            reasoning = "Very high funding amount - significant risk"
        
        factors["financial_risk"] = {
            "score": financial_risk,
            "factor": f"${requested_amount:,.2f}",
            "reasoning": reasoning
        }
        
        # Time-based risk (how long since incident)
        incident_date = plaintiff_data.get("incidentDate")
        if incident_date:
            try:
                if isinstance(incident_date, str):
                    incident_dt = datetime.fromisoformat(incident_date.replace('Z', '+00:00'))
                else:
                    incident_dt = incident_date
                
                days_since_incident = (datetime.now(incident_dt.tzinfo) - incident_dt).days
                
                if days_since_incident < 30:
                    time_risk = 40  # Recent incident - good
                    reasoning = "Recent incident - likely good documentation"
                elif days_since_incident < 180:
                    time_risk = 30  # Optimal timeframe
                    reasoning = "Optimal timeframe for case development"
                elif days_since_incident < 365:
                    time_risk = 50  # Getting older
                    reasoning = "Case aging - may face statute of limitations pressure"
                elif days_since_incident < 730:
                    time_risk = 70  # Old case
                    reasoning = "Older case - higher statute of limitations risk"
                else:
                    time_risk = 85  # Very old
                    reasoning = "Very old case - high statute of limitations risk"
                
                factors["time_risk"] = {
                    "score": time_risk,
                    "factor": f"{days_since_incident} days",
                    "reasoning": reasoning
                }
            except Exception:
                factors["time_risk"] = {
                    "score": 60,
                    "factor": "Unknown",
                    "reasoning": "Invalid incident date - moderate risk assigned"
                }
        else:
            factors["time_risk"] = {
                "score": 65,
                "factor": "Not provided",
                "reasoning": "No incident date provided - moderate-high risk"
            }
        
        # Information completeness risk
        required_fields = ["firstName", "lastName", "phone", "email", "address", "caseType"]
        provided_fields = sum(1 for field in required_fields if plaintiff_data.get(field))
        completeness_ratio = provided_fields / len(required_fields)
        
        info_risk = (1 - completeness_ratio) * 100
        factors["information_completeness_risk"] = {
            "score": info_risk,
            "factor": f"{provided_fields}/{len(required_fields)} fields",
            "reasoning": f"Information completeness: {completeness_ratio:.1%}"
        }
        
        return factors
    
    def _combine_risk_assessments(self, ai_assessment: Dict[str, Any], 
                                rule_based_factors: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine AI and rule-based risk assessments into overall score
        """
        try:
            # Extract AI scores
            ai_scores = []
            if isinstance(ai_assessment, dict):
                for key, value in ai_assessment.items():
                    if isinstance(value, dict) and "score" in value:
                        ai_scores.append(value["score"])
            
            ai_average = sum(ai_scores) / len(ai_scores) if ai_scores else 50
            
            # Extract rule-based scores
            rule_scores = [factor["score"] for factor in rule_based_factors.values()]
            rule_average = sum(rule_scores) / len(rule_scores) if rule_scores else 50
            
            # Weighted combination (60% AI, 40% rules)
            overall_score = (ai_average * 0.6) + (rule_average * 0.4)
            
            # Determine risk level
            if overall_score <= 30:
                risk_level = "LOW"
                recommendations = [
                    "Proceed with standard processing",
                    "Monitor for any changes in case status",
                    "Consider expedited review for quick approval"
                ]
            elif overall_score <= 50:
                risk_level = "MEDIUM"
                recommendations = [
                    "Proceed with enhanced due diligence",
                    "Request additional documentation",
                    "Monitor case progress closely"
                ]
            elif overall_score <= 70:
                risk_level = "HIGH"
                recommendations = [
                    "Require additional approvals",
                    "Consider reduced funding amount",
                    "Implement enhanced monitoring",
                    "Request legal opinion on case strength"
                ]
            else:
                risk_level = "VERY HIGH"
                recommendations = [
                    "Consider declining funding",
                    "If proceeding, require senior management approval",
                    "Significantly reduce funding amount",
                    "Implement maximum monitoring protocols"
                ]
            
            # Calculate confidence based on data availability
            confidence = min(100, 50 + (len(ai_scores) * 5) + (len(rule_scores) * 3))
            
            return {
                "overall_score": round(overall_score, 1),
                "risk_level": risk_level,
                "ai_contribution": round(ai_average, 1),
                "rules_contribution": round(rule_average, 1),
                "recommendations": recommendations,
                "confidence": confidence
            }
            
        except Exception as e:
            print(f"Error combining risk assessments: {e}")
            return {
                "overall_score": 50.0,
                "risk_level": "MEDIUM",
                "recommendations": ["Manual review required due to analysis error"],
                "confidence": 30
            }
    
    def _prepare_analysis_data(self, plaintiff_data: Dict[str, Any], 
                             case_documents: List[Dict] = None,
                             communication_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Prepare data for AI analysis
        """
        return {
            "plaintiff_info": {
                "case_type": plaintiff_data.get("caseType"),
                "incident_date": plaintiff_data.get("incidentDate"),
                "requested_amount": plaintiff_data.get("requestedAmount"),
                "case_notes": plaintiff_data.get("caseNotes"),
                "current_stage": plaintiff_data.get("currentStage"),
                "address": plaintiff_data.get("address")  # For jurisdictional analysis
            },
            "documents_available": len(case_documents) if case_documents else 0,
            "communication_responsiveness": len(communication_history) if communication_history else 0,
            "law_firm_id": plaintiff_data.get("lawFirmId"),
            "attorney_id": plaintiff_data.get("attorneyId")
        }
    
    def _generate_risk_report(self, ai_assessment: Dict[str, Any], 
                            rule_based_factors: Dict[str, Any],
                            comprehensive_score: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive risk report
        """
        return {
            "executive_summary": f"Overall risk level: {comprehensive_score['risk_level']} "
                               f"(Score: {comprehensive_score['overall_score']}/100)",
            "key_risk_factors": self._extract_key_risk_factors(ai_assessment, rule_based_factors),
            "risk_breakdown": {
                "ai_factors": ai_assessment,
                "rule_based_factors": rule_based_factors
            },
            "actionable_recommendations": comprehensive_score["recommendations"],
            "confidence_assessment": f"{comprehensive_score['confidence']}% confidence in analysis"
        }
    
    def _extract_key_risk_factors(self, ai_assessment: Dict[str, Any], 
                                rule_based_factors: Dict[str, Any]) -> List[str]:
        """
        Extract the most significant risk factors
        """
        key_factors = []
        
        # From rule-based factors
        for factor_name, factor_data in rule_based_factors.items():
            if factor_data["score"] > 60:
                key_factors.append(f"{factor_name}: {factor_data['reasoning']}")
        
        # From AI assessment
        if isinstance(ai_assessment, dict) and "key_concerns" in ai_assessment:
            key_factors.extend(ai_assessment["key_concerns"])
        
        return key_factors[:5]  # Top 5 risk factors
    
    def _default_risk_assessment(self) -> Dict[str, Any]:
        """
        Return default risk assessment when analysis fails
        """
        return {
            "risk_score": 50.0,
            "risk_level": "MEDIUM",
            "ai_assessment": {"error": "AI analysis failed"},
            "rule_based_factors": {"error": "Rule-based analysis failed"},
            "risk_report": {
                "executive_summary": "Manual review required due to analysis error"
            },
            "recommendations": ["Manual underwriter review required"],
            "confidence_score": 20,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
    
    def _default_ai_assessment(self) -> Dict[str, Any]:
        """
        Return default AI assessment when AI analysis fails
        """
        return {
            "overall_assessment": "AI analysis unavailable - manual review required",
            "key_concerns": ["Unable to perform AI risk assessment"],
            "mitigation_strategies": ["Conduct thorough manual review"]
        }
    
    async def generate_risk_trends(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze risk trends across multiple cases for portfolio insights
        """
        if not historical_data:
            return {"error": "No historical data provided"}
        
        try:
            trend_analysis = {
                "total_cases_analyzed": len(historical_data),
                "risk_distribution": self._calculate_risk_distribution(historical_data),
                "case_type_trends": self._analyze_case_type_trends(historical_data),
                "funding_amount_trends": self._analyze_funding_trends(historical_data),
                "seasonal_patterns": self._detect_seasonal_patterns(historical_data),
                "recommendations": self._generate_portfolio_recommendations(historical_data)
            }
            
            return trend_analysis
            
        except Exception as e:
            print(f"Error generating risk trends: {e}")
            return {"error": f"Failed to generate trends: {str(e)}"}
    
    def _calculate_risk_distribution(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate distribution of risk levels"""
        risk_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "VERY HIGH": 0}
        
        for case in data:
            risk_level = case.get("risk_level", "MEDIUM")
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
        
        total = len(data)
        return {
            "counts": risk_counts,
            "percentages": {level: (count/total)*100 for level, count in risk_counts.items()}
        }
    
    def _analyze_case_type_trends(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze risk trends by case type"""
        case_type_risks = {}
        
        for case in data:
            case_type = case.get("case_type", "Other")
            risk_score = case.get("risk_score", 50)
            
            if case_type not in case_type_risks:
                case_type_risks[case_type] = []
            case_type_risks[case_type].append(risk_score)
        
        return {
            case_type: {
                "average_risk": sum(scores) / len(scores),
                "case_count": len(scores),
                "risk_range": f"{min(scores):.1f} - {max(scores):.1f}"
            }
            for case_type, scores in case_type_risks.items()
        }
    
    def _analyze_funding_trends(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze relationship between funding amounts and risk"""
        funding_brackets = {
            "Under $10K": [],
            "$10K - $50K": [],
            "$50K - $100K": [],
            "Over $100K": []
        }
        
        for case in data:
            amount = case.get("funding_amount", 0)
            risk_score = case.get("risk_score", 50)
            
            if amount < 10000:
                funding_brackets["Under $10K"].append(risk_score)
            elif amount < 50000:
                funding_brackets["$10K - $50K"].append(risk_score)
            elif amount < 100000:
                funding_brackets["$50K - $100K"].append(risk_score)
            else:
                funding_brackets["Over $100K"].append(risk_score)
        
        return {
            bracket: {
                "average_risk": sum(scores) / len(scores) if scores else 0,
                "case_count": len(scores)
            }
            for bracket, scores in funding_brackets.items()
        }
    
    def _detect_seasonal_patterns(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect seasonal patterns in case risk"""
        monthly_risks = {}
        
        for case in data:
            try:
                date_str = case.get("incident_date") or case.get("created_date", "")
                if date_str:
                    date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    month = date_obj.strftime('%B')
                    risk_score = case.get("risk_score", 50)
                    
                    if month not in monthly_risks:
                        monthly_risks[month] = []
                    monthly_risks[month].append(risk_score)
            except Exception:
                continue
        
        return {
            month: {
                "average_risk": sum(scores) / len(scores),
                "case_count": len(scores)
            }
            for month, scores in monthly_risks.items()
        }
    
    def _generate_portfolio_recommendations(self, data: List[Dict[str, Any]]) -> List[str]:
        """Generate portfolio-level recommendations"""
        recommendations = []
        
        # Calculate overall portfolio risk
        risk_scores = [case.get("risk_score", 50) for case in data]
        avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 50
        
        if avg_risk > 60:
            recommendations.append("Portfolio showing elevated risk levels - consider tightening underwriting criteria")
        elif avg_risk < 40:
            recommendations.append("Portfolio risk levels are conservative - consider exploring additional market opportunities")
        
        # Check for case type concentration
        case_types = [case.get("case_type", "Other") for case in data]
        type_counts = {}
        for case_type in case_types:
            type_counts[case_type] = type_counts.get(case_type, 0) + 1
        
        max_concentration = max(type_counts.values()) / len(data) if data else 0
        if max_concentration > 0.5:
            recommendations.append("High concentration in single case type - consider diversification")
        
        return recommendations
