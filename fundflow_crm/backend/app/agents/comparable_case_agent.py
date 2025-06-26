import google.generativeai as genai
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import asyncio
from dataclasses import dataclass
import math

@dataclass
class ComparableCase:
    """Structure for comparable case data"""
    case_id: str
    case_type: str
    settlement_amount: float
    funding_amount: float
    case_duration_months: int
    outcome: str
    jurisdiction: str
    key_factors: List[str]
    similarity_score: float

class ComparableCaseAgent:
    """
    Advanced AI agent for finding and analyzing comparable cases for valuation and risk assessment
    """
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Case similarity weights for different factors
        self.similarity_weights = {
            "case_type": 0.25,
            "injury_severity": 0.20,
            "liability_clarity": 0.15,
            "jurisdiction": 0.10,
            "case_age": 0.10,
            "funding_amount": 0.10,
            "law_firm_quality": 0.05,
            "damages_type": 0.05
        }
        
        # Remove scikit-learn dependency - use simple text comparison
        # self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    
    async def find_comparable_cases(self, 
                                  target_case: Dict[str, Any],
                                  historical_cases: List[Dict[str, Any]],
                                  min_similarity: float = 0.3,
                                  max_results: int = 10) -> List[ComparableCase]:
        """
        Find comparable cases from historical data using AI-powered similarity analysis
        """
        try:
            if not historical_cases:
                return []
            
            # Analyze target case characteristics
            target_features = await self._extract_case_features(target_case)
            
            # Calculate similarity scores for all historical cases
            comparable_cases = []
            
            for historical_case in historical_cases:
                try:
                    # Extract features from historical case
                    historical_features = await self._extract_case_features(historical_case)
                    
                    # Calculate similarity score
                    similarity_score = await self._calculate_case_similarity(
                        target_features, historical_features
                    )
                    
                    if similarity_score >= min_similarity:
                        comparable_case = ComparableCase(
                            case_id=historical_case.get("id", "unknown"),
                            case_type=historical_case.get("case_type", "Unknown"),
                            settlement_amount=historical_case.get("settlement_amount", 0),
                            funding_amount=historical_case.get("funding_amount", 0),
                            case_duration_months=historical_case.get("duration_months", 0),
                            outcome=historical_case.get("outcome", "Unknown"),
                            jurisdiction=historical_case.get("jurisdiction", "Unknown"),
                            key_factors=historical_features.get("key_factors", []),
                            similarity_score=similarity_score
                        )
                        comparable_cases.append(comparable_case)
                        
                except Exception as e:
                    print(f"Error processing historical case: {e}")
                    continue
            
            # Sort by similarity score and return top results
            comparable_cases.sort(key=lambda x: x.similarity_score, reverse=True)
            return comparable_cases[:max_results]
            
        except Exception as e:
            print(f"Error finding comparable cases: {e}")
            return []
    
    async def _extract_case_features(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract key features from case data using AI analysis
        """
        case_notes = case_data.get("case_notes", case_data.get("caseNotes", ""))
        case_type = case_data.get("case_type", case_data.get("caseType", ""))
        
        prompt = f"""
        Analyze this legal case and extract key features for similarity comparison.
        
        Case Type: {case_type}
        Case Description: {case_notes}
        Additional Data: {json.dumps({k: v for k, v in case_data.items() if k not in ['case_notes', 'caseNotes']}, indent=2)}
        
        Extract and categorize the following features:
        
        1. INJURY_SEVERITY: "minor", "moderate", "severe", "catastrophic"
        2. LIABILITY_CLARITY: "clear", "disputed", "unclear"  
        3. DAMAGES_TYPE: ["medical", "lost_wages", "pain_suffering", "property", "punitive"]
        4. CASE_COMPLEXITY: "simple", "moderate", "complex"
        5. KEY_FACTORS: List of important case characteristics
        6. VENUE_CHARACTERISTICS: "urban", "suburban", "rural"
        7. DEFENDANT_TYPE: "individual", "corporation", "government", "insurance"
        
        Return as JSON:
        {{
            "injury_severity": "category",
            "liability_clarity": "category",
            "damages_type": ["type1", "type2", ...],
            "case_complexity": "category",
            "key_factors": ["factor1", "factor2", ...],
            "venue_characteristics": "category",
            "defendant_type": "category",
            "estimated_case_strength": 0-100
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            features = json.loads(content)
            
            # Add calculated features
            features.update({
                "case_type": case_type,
                "jurisdiction": case_data.get("jurisdiction", "unknown"),
                "funding_amount": case_data.get("funding_amount", case_data.get("requestedAmount", 0)),
                "case_age_days": self._calculate_case_age(case_data.get("incident_date", case_data.get("incidentDate"))),
                "law_firm_id": case_data.get("law_firm_id", case_data.get("lawFirmId"))
            })
            
            return features
            
        except Exception as e:
            print(f"Error extracting case features: {e}")
            return self._get_default_features(case_data)
    
    async def _calculate_case_similarity(self, target_features: Dict[str, Any], 
                                       historical_features: Dict[str, Any]) -> float:
        """
        Calculate similarity score between two cases
        """
        try:
            similarity_scores = {}
            
            # Case type similarity
            similarity_scores["case_type"] = 1.0 if target_features.get("case_type") == historical_features.get("case_type") else 0.0
            
            # Injury severity similarity  
            severity_map = {"minor": 1, "moderate": 2, "severe": 3, "catastrophic": 4}
            target_severity = severity_map.get(target_features.get("injury_severity", "moderate"), 2)
            historical_severity = severity_map.get(historical_features.get("injury_severity", "moderate"), 2)
            severity_diff = abs(target_severity - historical_severity)
            similarity_scores["injury_severity"] = max(0, 1 - (severity_diff / 3))
            
            # Liability clarity similarity
            liability_map = {"clear": 3, "disputed": 2, "unclear": 1}
            target_liability = liability_map.get(target_features.get("liability_clarity", "disputed"), 2)
            historical_liability = liability_map.get(historical_features.get("liability_clarity", "disputed"), 2)
            liability_diff = abs(target_liability - historical_liability)
            similarity_scores["liability_clarity"] = max(0, 1 - (liability_diff / 2))
            
            # Jurisdiction similarity
            similarity_scores["jurisdiction"] = 1.0 if target_features.get("jurisdiction") == historical_features.get("jurisdiction") else 0.3
            
            # Case age similarity (normalized to 0-1)
            target_age = target_features.get("case_age_days", 365)
            historical_age = historical_features.get("case_age_days", 365)
            age_diff = abs(target_age - historical_age)
            similarity_scores["case_age"] = max(0, 1 - (age_diff / 1095))  # Normalize by 3 years
            
            # Funding amount similarity (log scale)
            target_funding = max(1, target_features.get("funding_amount", 1))
            historical_funding = max(1, historical_features.get("funding_amount", 1))
            funding_ratio = min(target_funding, historical_funding) / max(target_funding, historical_funding)
            similarity_scores["funding_amount"] = funding_ratio
            
            # Law firm similarity (simple binary for now)
            similarity_scores["law_firm_quality"] = 1.0 if target_features.get("law_firm_id") == historical_features.get("law_firm_id") else 0.5
            
            # Damages type similarity (Jaccard similarity)
            target_damages = set(target_features.get("damages_type", []))
            historical_damages = set(historical_features.get("damages_type", []))
            if target_damages or historical_damages:
                jaccard = len(target_damages.intersection(historical_damages)) / len(target_damages.union(historical_damages))
                similarity_scores["damages_type"] = jaccard
            else:
                similarity_scores["damages_type"] = 0.5
            
            # Calculate weighted overall similarity
            overall_similarity = sum(
                similarity_scores.get(factor, 0.5) * weight 
                for factor, weight in self.similarity_weights.items()
            )
            
            return round(overall_similarity, 3)
            
        except Exception as e:
            print(f"Error calculating case similarity: {e}")
            return 0.0
    
    def _calculate_case_age(self, incident_date: Any) -> int:
        """
        Calculate case age in days
        """
        if not incident_date:
            return 365  # Default to 1 year
        
        try:
            if isinstance(incident_date, str):
                date_obj = datetime.fromisoformat(incident_date.replace('Z', '+00:00'))
            else:
                date_obj = incident_date
            
            return (datetime.now(date_obj.tzinfo) - date_obj).days
        except Exception:
            return 365
    
    def _get_default_features(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get default features when AI extraction fails
        """
        return {
            "case_type": case_data.get("case_type", case_data.get("caseType", "Unknown")),
            "injury_severity": "moderate",
            "liability_clarity": "disputed", 
            "damages_type": ["medical", "pain_suffering"],
            "case_complexity": "moderate",
            "key_factors": ["Standard personal injury case"],
            "venue_characteristics": "suburban",
            "defendant_type": "individual",
            "estimated_case_strength": 50,
            "jurisdiction": case_data.get("jurisdiction", "unknown"),
            "funding_amount": case_data.get("funding_amount", case_data.get("requestedAmount", 0)),
            "case_age_days": self._calculate_case_age(case_data.get("incident_date", case_data.get("incidentDate"))),
            "law_firm_id": case_data.get("law_firm_id", case_data.get("lawFirmId"))
        }
    
    async def analyze_comparable_case_outcomes(self, comparable_cases: List[ComparableCase]) -> Dict[str, Any]:
        """
        Analyze outcomes from comparable cases to predict target case results
        """
        if not comparable_cases:
            return {
                "prediction_confidence": "low",
                "estimated_settlement_range": {"low": 0, "high": 0},
                "success_probability": 0.5,
                "average_duration_months": 18,
                "analysis": "No comparable cases available"
            }
        
        try:
            # Collect outcome data
            settlements = [case.settlement_amount for case in comparable_cases if case.settlement_amount > 0]
            durations = [case.case_duration_months for case in comparable_cases if case.case_duration_months > 0]
            outcomes = [case.outcome for case in comparable_cases]
            
            # Calculate settlement statistics
            if settlements:
                settlement_stats = {
                    "mean": sum(settlements) / len(settlements),
                    "median": sorted(settlements)[len(settlements) // 2],
                    "std": math.sqrt(sum((x - sum(settlements) / len(settlements)) ** 2 for x in settlements) / len(settlements)),
                    "min": min(settlements),
                    "max": max(settlements)
                }
                
                # Estimate settlement range (mean ± 1 std dev)
                estimated_range = {
                    "low": max(0, settlement_stats["mean"] - settlement_stats["std"]),
                    "high": settlement_stats["mean"] + settlement_stats["std"]
                }
            else:
                settlement_stats = {}
                estimated_range = {"low": 0, "high": 0}
            
            # Calculate success probability
            successful_outcomes = ["settled", "judgment_plaintiff", "favorable"]
            successful_cases = sum(1 for outcome in outcomes if outcome.lower() in successful_outcomes)
            success_probability = successful_cases / len(outcomes) if outcomes else 0.5
            
            # Calculate average duration
            avg_duration = sum(durations) / len(durations) if durations else 18
            
            # AI-powered analysis of trends
            trends_analysis = await self._analyze_outcome_trends(comparable_cases)
            
            # Determine prediction confidence
            confidence = self._calculate_prediction_confidence(comparable_cases, settlement_stats)
            
            return {
                "prediction_confidence": confidence,
                "estimated_settlement_range": estimated_range,
                "settlement_statistics": settlement_stats,
                "success_probability": round(success_probability, 3),
                "average_duration_months": round(avg_duration, 1),
                "case_count": len(comparable_cases),
                "trends_analysis": trends_analysis,
                "outcome_distribution": self._calculate_outcome_distribution(outcomes),
                "analysis": f"Based on {len(comparable_cases)} comparable cases with {confidence} confidence"
            }
            
        except Exception as e:
            print(f"Error analyzing comparable case outcomes: {e}")
            return {
                "prediction_confidence": "low",
                "error": str(e),
                "analysis": "Error in comparable case analysis"
            }
    
    async def _analyze_outcome_trends(self, comparable_cases: List[ComparableCase]) -> Dict[str, Any]:
        """
        Use AI to analyze trends in comparable case outcomes
        """
        # Prepare case summaries for AI analysis
        case_summaries = []
        for case in comparable_cases:
            case_summaries.append({
                "case_type": case.case_type,
                "settlement": case.settlement_amount,
                "duration": case.case_duration_months,
                "outcome": case.outcome,
                "key_factors": case.key_factors,
                "similarity": case.similarity_score
            })
        
        prompt = f"""
        Analyze these comparable legal cases to identify trends and patterns that could inform predictions.
        
        Comparable Cases:
        {json.dumps(case_summaries, indent=2)}
        
        Identify:
        1. Factors that correlate with higher settlements
        2. Factors that correlate with successful outcomes
        3. Patterns in case duration
        4. Risk factors that led to poor outcomes
        5. Jurisdictional or venue patterns
        
        Return analysis as JSON:
        {{
            "high_value_factors": ["factor1", "factor2", ...],
            "success_factors": ["factor1", "factor2", ...],
            "risk_factors": ["factor1", "factor2", ...],
            "duration_drivers": ["factor1", "factor2", ...],
            "key_insights": ["insight1", "insight2", ...],
            "prediction_indicators": {{
                "positive": ["indicator1", ...],
                "negative": ["indicator1", ...]
            }}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            trends = json.loads(content)
            return trends
            
        except Exception as e:
            print(f"Error analyzing outcome trends: {e}")
            return {
                "high_value_factors": [],
                "success_factors": [],
                "risk_factors": [],
                "key_insights": [f"Trends analysis failed: {str(e)}"]
            }
    
    def _calculate_prediction_confidence(self, comparable_cases: List[ComparableCase], 
                                       settlement_stats: Dict[str, float]) -> str:
        """
        Calculate confidence level for predictions based on comparable cases
        """
        try:
            confidence_score = 0
            
            # Number of cases factor
            case_count = len(comparable_cases)
            if case_count >= 10:
                confidence_score += 30
            elif case_count >= 5:
                confidence_score += 20
            elif case_count >= 3:
                confidence_score += 10
            
            # Similarity factor (average similarity of comparable cases)
            avg_similarity = sum(case.similarity_score for case in comparable_cases) / len(comparable_cases)
            if avg_similarity >= 0.7:
                confidence_score += 30
            elif avg_similarity >= 0.5:
                confidence_score += 20
            elif avg_similarity >= 0.3:
                confidence_score += 10
            
            # Data quality factor (settlement data availability)
            if settlement_stats and settlement_stats.get("std", 0) > 0:
                cv = settlement_stats["std"] / settlement_stats["mean"]  # Coefficient of variation
                if cv <= 0.5:  # Low variation = high confidence
                    confidence_score += 25
                elif cv <= 1.0:
                    confidence_score += 15
                else:
                    confidence_score += 5
            
            # Recent cases factor
            recent_cases = sum(1 for case in comparable_cases 
                             if hasattr(case, 'case_age_days') and case.case_age_days <= 1095)
            if recent_cases >= len(comparable_cases) * 0.7:
                confidence_score += 15
            
            # Map score to confidence level
            if confidence_score >= 80:
                return "high"
            elif confidence_score >= 50:
                return "medium"
            else:
                return "low"
                
        except Exception as e:
            print(f"Error calculating prediction confidence: {e}")
            return "low"
    
    def _calculate_outcome_distribution(self, outcomes: List[str]) -> Dict[str, Any]:
        """
        Calculate distribution of case outcomes
        """
        if not outcomes:
            return {}
        
        outcome_counts = {}
        for outcome in outcomes:
            normalized_outcome = outcome.lower().strip()
            outcome_counts[normalized_outcome] = outcome_counts.get(normalized_outcome, 0) + 1
        
        total = len(outcomes)
        outcome_percentages = {
            outcome: (count / total) * 100 
            for outcome, count in outcome_counts.items()
        }
        
        return {
            "counts": outcome_counts,
            "percentages": outcome_percentages,
            "total_cases": total
        }
    
    async def generate_case_valuation_report(self, target_case: Dict[str, Any],
                                           comparable_cases: List[ComparableCase]) -> Dict[str, Any]:
        """
        Generate comprehensive case valuation report based on comparable cases
        """
        if not comparable_cases:
            return {
                "valuation_summary": "No comparable cases available for valuation",
                "confidence": "none"
            }
        
        try:
            # Analyze comparable outcomes
            outcomes_analysis = await self.analyze_comparable_case_outcomes(comparable_cases)
            
            # AI-powered valuation analysis
            valuation_analysis = await self._ai_valuation_analysis(target_case, comparable_cases)
            
            # Calculate risk-adjusted valuation
            risk_adjusted_valuation = self._calculate_risk_adjusted_valuation(
                outcomes_analysis, valuation_analysis, target_case
            )
            
            # Generate funding recommendations
            funding_recommendations = await self._generate_funding_recommendations(
                risk_adjusted_valuation, outcomes_analysis, target_case
            )
            
            return {
                "valuation_summary": {
                    "estimated_value": risk_adjusted_valuation["estimated_value"],
                    "confidence_range": risk_adjusted_valuation["confidence_range"],
                    "risk_adjustment": risk_adjusted_valuation["risk_adjustment"]
                },
                "comparable_analysis": outcomes_analysis,
                "ai_insights": valuation_analysis,
                "funding_recommendations": funding_recommendations,
                "methodology": "AI-powered comparable case analysis with risk adjustment",
                "comparable_case_count": len(comparable_cases),
                "analysis_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating valuation report: {e}")
            return {
                "error": str(e),
                "valuation_summary": "Manual valuation required",
                "confidence": "none"
            }
    
    async def _ai_valuation_analysis(self, target_case: Dict[str, Any], 
                                   comparable_cases: List[ComparableCase]) -> Dict[str, Any]:
        """
        AI-powered analysis of case valuation factors
        """
        # Prepare data for AI analysis
        target_summary = {
            "case_type": target_case.get("caseType", target_case.get("case_type")),
            "case_notes": target_case.get("caseNotes", target_case.get("case_notes", "")),
            "requested_amount": target_case.get("requestedAmount", target_case.get("funding_amount", 0))
        }
        
        comparable_summary = [
            {
                "case_type": case.case_type,
                "settlement": case.settlement_amount,
                "outcome": case.outcome,
                "similarity": case.similarity_score
            }
            for case in comparable_cases[:5]  # Top 5 most similar
        ]
        
        prompt = f"""
        Analyze this target case against comparable cases to provide valuation insights.
        
        Target Case:
        {json.dumps(target_summary, indent=2)}
        
        Top Comparable Cases:
        {json.dumps(comparable_summary, indent=2)}
        
        Provide analysis on:
        1. Relative strength of target case vs. comparables
        2. Key value drivers specific to this case
        3. Potential value detractors or risks
        4. Estimated valuation range with reasoning
        5. Confidence factors for the valuation
        
        Return as JSON:
        {{
            "relative_strength": "stronger/similar/weaker",
            "strength_reasoning": "explanation",
            "value_drivers": ["driver1", "driver2", ...],
            "value_detractors": ["detractor1", "detractor2", ...],
            "estimated_range": {{"low": amount, "high": amount}},
            "valuation_reasoning": "detailed explanation",
            "confidence_factors": ["factor1", "factor2", ...]
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
            print(f"Error in AI valuation analysis: {e}")
            return {
                "relative_strength": "similar",
                "strength_reasoning": f"Analysis error: {str(e)}",
                "value_drivers": [],
                "value_detractors": [],
                "estimated_range": {"low": 0, "high": 0},
                "valuation_reasoning": "Manual analysis required",
                "confidence_factors": []
            }
    
    def _calculate_risk_adjusted_valuation(self, outcomes_analysis: Dict[str, Any],
                                         valuation_analysis: Dict[str, Any],
                                         target_case: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk-adjusted valuation combining statistical and AI analysis
        """
        try:
            # Base valuation from comparables
            comparable_range = outcomes_analysis.get("estimated_settlement_range", {"low": 0, "high": 0})
            comparable_mean = (comparable_range["low"] + comparable_range["high"]) / 2
            
            # AI valuation
            ai_range = valuation_analysis.get("estimated_range", {"low": 0, "high": 0})
            ai_mean = (ai_range["low"] + ai_range["high"]) / 2
            
            # Weighted combination (60% comparable, 40% AI)
            if comparable_mean > 0 and ai_mean > 0:
                estimated_value = (comparable_mean * 0.6) + (ai_mean * 0.4)
            elif comparable_mean > 0:
                estimated_value = comparable_mean
            elif ai_mean > 0:
                estimated_value = ai_mean
            else:
                # Fallback to case type averages
                case_type_averages = {
                    "Auto Accident": 45000,
                    "Slip and Fall": 35000,
                    "Medical Malpractice": 125000,
                    "Workers Compensation": 25000,
                    "Product Liability": 85000
                }
                case_type = target_case.get("caseType", target_case.get("case_type", "Auto Accident"))
                estimated_value = case_type_averages.get(case_type, 50000)
            
            # Risk adjustments
            risk_multiplier = 1.0
            
            # Success probability adjustment
            success_prob = outcomes_analysis.get("success_probability", 0.5)
            risk_multiplier *= success_prob
            
            # Case strength adjustment
            relative_strength = valuation_analysis.get("relative_strength", "similar")
            if relative_strength == "stronger":
                risk_multiplier *= 1.1
            elif relative_strength == "weaker":
                risk_multiplier *= 0.9
            
            # Apply risk adjustment
            risk_adjusted_value = estimated_value * risk_multiplier
            
            # Calculate confidence range
            confidence_range = {
                "low": risk_adjusted_value * 0.7,
                "high": risk_adjusted_value * 1.3
            }
            
            return {
                "estimated_value": round(risk_adjusted_value, 2),
                "confidence_range": confidence_range,
                "risk_adjustment": round(risk_multiplier, 3),
                "base_valuation": round(estimated_value, 2),
                "methodology": "Weighted combination of comparable cases and AI analysis with risk adjustment"
            }
            
        except Exception as e:
            print(f"Error calculating risk-adjusted valuation: {e}")
            return {
                "estimated_value": 50000,  # Conservative default
                "confidence_range": {"low": 35000, "high": 65000},
                "risk_adjustment": 1.0,
                "error": str(e)
            }
    
    async def _generate_funding_recommendations(self, risk_adjusted_valuation: Dict[str, Any],
                                              outcomes_analysis: Dict[str, Any],
                                              target_case: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate funding recommendations based on valuation analysis
        """
        estimated_value = risk_adjusted_valuation.get("estimated_value", 0)
        requested_amount = target_case.get("requestedAmount", target_case.get("funding_amount", 0))
        success_probability = outcomes_analysis.get("success_probability", 0.5)
        
        # Calculate maximum recommended funding (typically 10-15% of estimated case value)
        max_funding_ratio = 0.12 if success_probability >= 0.7 else 0.10
        max_recommended = estimated_value * max_funding_ratio
        
        # Funding recommendation logic
        if requested_amount <= max_recommended:
            recommendation = "APPROVE"
            risk_level = "LOW"
        elif requested_amount <= estimated_value * 0.20:
            recommendation = "CONDITIONAL"
            risk_level = "MEDIUM"
        else:
            recommendation = "REDUCE_AMOUNT"
            risk_level = "HIGH"
        
        return {
            "funding_recommendation": recommendation,
            "risk_level": risk_level,
            "max_recommended_amount": round(max_recommended, 2),
            "funding_ratio": round((requested_amount / estimated_value) * 100, 1) if estimated_value > 0 else 0,
            "success_probability": success_probability,
            "rationale": self._generate_funding_rationale(
                recommendation, estimated_value, requested_amount, success_probability
            )
        }
    
    def _generate_funding_rationale(self, recommendation: str, estimated_value: float,
                                  requested_amount: float, success_probability: float) -> str:
        """
        Generate rationale for funding recommendation
        """
        rationales = {
            "APPROVE": f"Requested amount (${requested_amount:,.2f}) is within acceptable range for estimated case value (${estimated_value:,.2f}) with {success_probability:.1%} success probability.",
            "CONDITIONAL": f"Requested amount (${requested_amount:,.2f}) is moderate relative to estimated case value (${estimated_value:,.2f}). Recommend enhanced monitoring.",
            "REDUCE_AMOUNT": f"Requested amount (${requested_amount:,.2f}) exceeds recommended funding ratio for estimated case value (${estimated_value:,.2f}). Suggest reducing to maximum recommended amount."
        }
        
        return rationales.get(recommendation, "Manual review recommended")
    
    async def update_case_database(self, new_case_outcome: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update the comparable case database with new case outcome for future comparisons
        """
        # In a real implementation, this would update a persistent database
        # For now, we'll return a success status and what would be stored
        
        case_record = {
            "case_id": new_case_outcome.get("case_id", f"case_{datetime.now().strftime('%Y%m%d%H%M%S')}"),
            "case_type": new_case_outcome.get("case_type"),
            "settlement_amount": new_case_outcome.get("settlement_amount", 0),
            "funding_amount": new_case_outcome.get("funding_amount", 0),
            "case_duration_months": new_case_outcome.get("duration_months", 0),
            "outcome": new_case_outcome.get("outcome"),
            "jurisdiction": new_case_outcome.get("jurisdiction"),
            "key_factors": new_case_outcome.get("key_factors", []),
            "incident_date": new_case_outcome.get("incident_date"),
            "resolution_date": new_case_outcome.get("resolution_date", datetime.now().isoformat()),
            "added_to_database": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": "Case outcome added to comparable case database",
            "case_record": case_record
        }
    
    async def generate_market_intelligence_report(self, historical_cases: List[Dict[str, Any]],
                                                time_period_months: int = 12) -> Dict[str, Any]:
        """
        Generate market intelligence report based on historical case data
        """
        try:
            # Filter cases by time period
            cutoff_date = datetime.now() - timedelta(days=time_period_months * 30)
            recent_cases = [
                case for case in historical_cases 
                if self._is_case_recent(case, cutoff_date)
            ]
            
            if not recent_cases:
                return {"error": "No recent cases available for market intelligence"}
            
            # Analyze market trends
            market_trends = await self._analyze_market_trends(recent_cases)
            
            # Calculate performance metrics
            performance_metrics = self._calculate_performance_metrics(recent_cases)
            
            # Generate AI insights
            ai_insights = await self._generate_market_insights(market_trends, performance_metrics)
            
            return {
                "report_period": f"Last {time_period_months} months",
                "cases_analyzed": len(recent_cases),
                "market_trends": market_trends,
                "performance_metrics": performance_metrics,
                "ai_insights": ai_insights,
                "generated_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating market intelligence report: {e}")
            return {"error": str(e)}
    
    def _is_case_recent(self, case: Dict[str, Any], cutoff_date: datetime) -> bool:
        """
        Check if case is within the specified time period
        """
        try:
            resolution_date = case.get("resolution_date")
            if resolution_date:
                if isinstance(resolution_date, str):
                    res_date = datetime.fromisoformat(resolution_date.replace('Z', '+00:00'))
                else:
                    res_date = resolution_date
                return res_date >= cutoff_date
        except Exception:
            pass
        return True  # Include case if date is unclear
    
    async def _analyze_market_trends(self, recent_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze market trends from recent cases
        """
        # Case type distribution
        case_types = [case.get("case_type", "Unknown") for case in recent_cases]
        case_type_counts = {}
        for case_type in case_types:
            case_type_counts[case_type] = case_type_counts.get(case_type, 0) + 1
        
        # Settlement amount trends
        settlements = [case.get("settlement_amount", 0) for case in recent_cases if case.get("settlement_amount", 0) > 0]
        
        # Duration trends
        durations = [case.get("duration_months", 0) for case in recent_cases if case.get("duration_months", 0) > 0]
        
        return {
            "case_type_distribution": case_type_counts,
            "average_settlement": sum(settlements) / len(settlements) if settlements else 0,
            "median_settlement": sorted(settlements)[len(settlements) // 2] if settlements else 0,
            "average_duration_months": sum(durations) / len(durations) if durations else 0,
            "settlement_trend": "increasing" if len(settlements) > 5 and sum(settlements[-3:]) > sum(settlements[:3]) else "stable"
        }
    
    def _calculate_performance_metrics(self, recent_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate performance metrics from recent cases
        """
        total_cases = len(recent_cases)
        successful_cases = sum(1 for case in recent_cases 
                             if case.get("outcome", "").lower() in ["settled", "judgment_plaintiff", "favorable"])
        
        funded_cases = [case for case in recent_cases if case.get("funding_amount", 0) > 0]
        total_funded = sum(case.get("funding_amount", 0) for case in funded_cases)
        total_recovered = sum(case.get("settlement_amount", 0) for case in funded_cases)
        
        return {
            "total_cases": total_cases,
            "success_rate": (successful_cases / total_cases) * 100 if total_cases > 0 else 0,
            "total_funding_deployed": total_funded,
            "total_recoveries": total_recovered,
            "return_multiple": (total_recovered / total_funded) if total_funded > 0 else 0,
            "average_case_size": total_funded / len(funded_cases) if funded_cases else 0
        }
    
    async def _generate_market_insights(self, market_trends: Dict[str, Any], 
                                      performance_metrics: Dict[str, Any]) -> List[str]:
        """
        Generate AI-powered market insights
        """
        prompt = f"""
        Generate market intelligence insights based on recent legal case data.
        
        Market Trends:
        {json.dumps(market_trends, indent=2)}
        
        Performance Metrics:
        {json.dumps(performance_metrics, indent=2)}
        
        Provide 5-7 actionable insights about:
        1. Market opportunities
        2. Risk factors to watch
        3. Performance trends
        4. Strategic recommendations
        5. Market outlook
        
        Return as JSON array of insight strings.
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            insights = json.loads(content)
            return insights if isinstance(insights, list) else []
            
        except Exception as e:
            print(f"Error generating market insights: {e}")
            return [
                "Market analysis requires manual review",
                f"Analysis error: {str(e)}"
            ]
