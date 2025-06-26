import google.generativeai as genai
import os
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import json
import base64
from dataclasses import dataclass

@dataclass
class DocumentAnalysisResult:
    """Structure for document analysis results"""
    document_type: str
    extracted_data: Dict[str, Any]
    key_findings: List[str]
    red_flags: List[str]
    completeness_score: float
    confidence_score: float
    recommendations: List[str]

class DocumentAnalysisAgent:
    """
    Advanced AI agent for analyzing and extracting information from legal documents
    """
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Document type templates for structured extraction
        self.document_templates = {
            "police_report": {
                "required_fields": [
                    "incident_date", "incident_time", "location", "officers", 
                    "involved_parties", "injuries", "property_damage", "fault_determination"
                ],
                "critical_flags": [
                    "alcohol_involved", "speeding", "reckless_driving", 
                    "contributory_negligence", "disputed_facts"
                ]
            },
            "medical_record": {
                "required_fields": [
                    "patient_name", "treatment_date", "diagnosis", "treatment_provided",
                    "prognosis", "work_restrictions", "follow_up_required"
                ],
                "critical_flags": [
                    "pre_existing_condition", "non_compliance", "missed_appointments",
                    "treatment_gaps", "inconsistent_symptoms"
                ]
            },
            "insurance_policy": {
                "required_fields": [
                    "policy_number", "coverage_limits", "deductible", "effective_dates",
                    "insured_parties", "coverage_types"
                ],
                "critical_flags": [
                    "coverage_exclusions", "policy_lapse", "coverage_disputes",
                    "insufficient_limits", "claims_history"
                ]
            },
            "legal_retainer": {
                "required_fields": [
                    "client_name", "attorney_name", "firm_name", "case_type",
                    "fee_structure", "contingency_rate", "scope_of_representation"
                ],
                "critical_flags": [
                    "fee_disputes", "scope_limitations", "conflicts_of_interest",
                    "unusual_terms", "attorney_discipline"
                ]
            },
            "employment_record": {
                "required_fields": [
                    "employee_name", "employer", "position", "hire_date",
                    "wage_information", "work_status", "injury_details"
                ],
                "critical_flags": [
                    "employment_disputes", "wage_discrepancies", "safety_violations",
                    "worker_compensation_issues", "employment_gaps"
                ]
            }
        }
    
    async def analyze_document(self, document_content: str, 
                             document_type: str = "unknown",
                             document_metadata: Dict[str, Any] = None) -> DocumentAnalysisResult:
        """
        Comprehensive document analysis with AI-powered extraction
        """
        try:
            # Determine document type if unknown
            if document_type == "unknown":
                document_type = await self._classify_document_type(document_content)
            
            # Extract structured data
            extracted_data = await self._extract_structured_data(document_content, document_type)
            
            # Identify key findings
            key_findings = await self._identify_key_findings(document_content, document_type)
            
            # Detect red flags
            red_flags = await self._detect_red_flags(document_content, document_type)
            
            # Calculate completeness and confidence scores
            completeness_score = self._calculate_completeness_score(extracted_data, document_type)
            confidence_score = self._calculate_confidence_score(extracted_data, key_findings)
            
            # Generate recommendations
            recommendations = await self._generate_document_recommendations(
                extracted_data, key_findings, red_flags, document_type
            )
            
            return DocumentAnalysisResult(
                document_type=document_type,
                extracted_data=extracted_data,
                key_findings=key_findings,
                red_flags=red_flags,
                completeness_score=completeness_score,
                confidence_score=confidence_score,
                recommendations=recommendations
            )
            
        except Exception as e:
            print(f"Error analyzing document: {e}")
            return self._create_error_result(str(e))
    
    async def _classify_document_type(self, document_content: str) -> str:
        """
        Classify the type of legal document using AI
        """
        prompt = f"""
        Analyze the following document content and classify its type. 
        
        Document content:
        {document_content[:2000]}...  # Truncate for prompt efficiency
        
        Classify this document as one of the following types:
        - police_report
        - medical_record
        - insurance_policy
        - legal_retainer
        - employment_record
        - correspondence
        - court_document
        - financial_record
        - other
        
        Return only the document type as a single word.
        """
        
        try:
            response = self.model.generate_content(prompt)
            doc_type = response.text.strip().lower()
            
            # Validate against known types
            valid_types = list(self.document_templates.keys()) + ["correspondence", "court_document", "financial_record", "other"]
            return doc_type if doc_type in valid_types else "other"
            
        except Exception as e:
            print(f"Error classifying document: {e}")
            return "other"
    
    async def _extract_structured_data(self, document_content: str, document_type: str) -> Dict[str, Any]:
        """
        Extract structured data based on document type
        """
        template = self.document_templates.get(document_type, {})
        required_fields = template.get("required_fields", [])
        
        prompt = f"""
        You are an expert legal document analyst. Extract structured information from the following document.
        
        Document Type: {document_type}
        
        Extract the following information if available:
        {json.dumps(required_fields, indent=2)}
        
        Document Content:
        {document_content}
        
        For each field, extract the relevant information. If a field is not found, use null.
        
        Also extract any additional relevant information not in the required fields.
        
        Return the extracted data as valid JSON with clear field names and values.
        
        Example structure:
        {{
            "required_fields": {{
                "field_name": "extracted_value",
                ...
            }},
            "additional_information": {{
                "key": "value",
                ...
            }},
            "dates_mentioned": ["2024-01-01", ...],
            "monetary_amounts": ["$5000", ...],
            "names_mentioned": ["John Doe", ...],
            "addresses_mentioned": ["123 Main St", ...]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            # Clean up JSON response
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            extracted_data = json.loads(content)
            return extracted_data
            
        except Exception as e:
            print(f"Error extracting structured data: {e}")
            return {"error": f"Failed to extract data: {str(e)}"}
    
    async def _identify_key_findings(self, document_content: str, document_type: str) -> List[str]:
        """
        Identify key findings and important information in the document
        """
        prompt = f"""
        You are an expert legal document analyst reviewing a {document_type} for a pre-settlement funding case.
        
        Document Content:
        {document_content}
        
        Identify the key findings and important information that would be relevant for:
        1. Case valuation
        2. Liability assessment
        3. Risk evaluation
        4. Settlement potential
        
        Focus on factual findings, not legal conclusions.
        
        Return a list of key findings as a JSON array of strings.
        Example: ["Clear liability on defendant's part", "Significant injuries documented", "Multiple witnesses present"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            key_findings = json.loads(content)
            return key_findings if isinstance(key_findings, list) else []
            
        except Exception as e:
            print(f"Error identifying key findings: {e}")
            return [f"Error analyzing document: {str(e)}"]
    
    async def _detect_red_flags(self, document_content: str, document_type: str) -> List[str]:
        """
        Detect potential red flags or concerning issues in the document
        """
        template = self.document_templates.get(document_type, {})
        critical_flags = template.get("critical_flags", [])
        
        prompt = f"""
        You are an expert underwriter reviewing a {document_type} for potential red flags or concerning issues.
        
        Document Content:
        {document_content}
        
        Look for the following types of red flags:
        {json.dumps(critical_flags, indent=2)}
        
        Also identify any other concerning issues such as:
        - Inconsistencies in the document
        - Missing critical information
        - Contradictory statements
        - Unusual circumstances
        - Potential liability issues
        - Coverage concerns
        - Credibility issues
        
        Return a list of red flags as a JSON array of strings.
        If no red flags are found, return an empty array.
        
        Example: ["Inconsistent injury descriptions", "No witnesses mentioned", "Pre-existing condition noted"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            red_flags = json.loads(content)
            return red_flags if isinstance(red_flags, list) else []
            
        except Exception as e:
            print(f"Error detecting red flags: {e}")
            return [f"Error analyzing document for red flags: {str(e)}"]
    
    def _calculate_completeness_score(self, extracted_data: Dict[str, Any], document_type: str) -> float:
        """
        Calculate how complete the document is based on required fields
        """
        template = self.document_templates.get(document_type, {})
        required_fields = template.get("required_fields", [])
        
        if not required_fields:
            return 50.0  # Default score for unknown document types
        
        required_data = extracted_data.get("required_fields", {})
        
        # Count non-null required fields
        completed_fields = sum(1 for field in required_fields 
                             if required_data.get(field) is not None and required_data.get(field) != "")
        
        completeness_score = (completed_fields / len(required_fields)) * 100
        return round(completeness_score, 1)
    
    def _calculate_confidence_score(self, extracted_data: Dict[str, Any], key_findings: List[str]) -> float:
        """
        Calculate confidence score based on data quality and completeness
        """
        # Base confidence
        confidence = 60.0
        
        # Boost for successful data extraction
        if extracted_data and "error" not in extracted_data:
            confidence += 20
        
        # Boost for key findings
        if key_findings and len(key_findings) > 0:
            confidence += min(20, len(key_findings) * 5)
        
        # Penalize for errors
        if "error" in extracted_data:
            confidence -= 30
        
        return min(100.0, max(0.0, confidence))
    
    async def _generate_document_recommendations(self, extracted_data: Dict[str, Any],
                                               key_findings: List[str],
                                               red_flags: List[str],
                                               document_type: str) -> List[str]:
        """
        Generate actionable recommendations based on document analysis
        """
        prompt = f"""
        Based on the analysis of a {document_type}, provide actionable recommendations for the underwriting team.
        
        Extracted Data Summary:
        {json.dumps(extracted_data, indent=2)[:1000]}...
        
        Key Findings:
        {json.dumps(key_findings, indent=2)}
        
        Red Flags:
        {json.dumps(red_flags, indent=2)}
        
        Provide 3-5 specific, actionable recommendations for the underwriting team, such as:
        - What additional documents to request
        - What information to verify
        - What risks to monitor
        - What follow-up actions to take
        
        Return as a JSON array of strings.
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            recommendations = json.loads(content)
            return recommendations if isinstance(recommendations, list) else []
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return ["Manual review recommended due to analysis error"]
    
    def _create_error_result(self, error_message: str) -> DocumentAnalysisResult:
        """
        Create an error result when document analysis fails
        """
        return DocumentAnalysisResult(
            document_type="error",
            extracted_data={"error": error_message},
            key_findings=[],
            red_flags=[f"Analysis failed: {error_message}"],
            completeness_score=0.0,
            confidence_score=0.0,
            recommendations=["Manual document review required due to analysis error"]
        )
    
    async def batch_analyze_documents(self, documents: List[Dict[str, Any]]) -> List[DocumentAnalysisResult]:
        """
        Analyze multiple documents in batch
        """
        results = []
        
        for doc in documents:
            try:
                content = doc.get("content", "")
                doc_type = doc.get("type", "unknown")
                metadata = doc.get("metadata", {})
                
                result = await self.analyze_document(content, doc_type, metadata)
                results.append(result)
                
            except Exception as e:
                print(f"Error analyzing document in batch: {e}")
                results.append(self._create_error_result(str(e)))
        
        return results
    
    async def compare_documents(self, doc1_content: str, doc2_content: str,
                              comparison_type: str = "consistency") -> Dict[str, Any]:
        """
        Compare two documents for consistency, contradictions, or complementary information
        """
        prompt = f"""
        You are an expert legal document analyst. Compare the following two documents for {comparison_type}.
        
        Document 1:
        {doc1_content[:1500]}...
        
        Document 2:
        {doc2_content[:1500]}...
        
        Analyze the documents for:
        1. Consistent information (facts that agree between documents)
        2. Contradictions (facts that conflict between documents)
        3. Complementary information (additional details in each document)
        4. Missing information (what's in one but not the other)
        
        Return the analysis as JSON:
        {{
            "consistency_score": 0-100,
            "consistent_facts": ["fact1", "fact2", ...],
            "contradictions": [
                {{
                    "issue": "description",
                    "doc1_says": "statement",
                    "doc2_says": "statement"
                }}
            ],
            "complementary_info": {{
                "doc1_unique": ["info1", "info2", ...],
                "doc2_unique": ["info1", "info2", ...]
            }},
            "recommendations": ["recommendation1", "recommendation2", ...]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            comparison_result = json.loads(content)
            return comparison_result
            
        except Exception as e:
            print(f"Error comparing documents: {e}")
            return {
                "error": f"Document comparison failed: {str(e)}",
                "consistency_score": 0,
                "recommendations": ["Manual comparison required"]
            }
    
    async def summarize_document_set(self, documents: List[DocumentAnalysisResult]) -> Dict[str, Any]:
        """
        Create a comprehensive summary of all analyzed documents for a case
        """
        if not documents:
            return {"error": "No documents provided for summary"}
        
        # Aggregate data from all documents
        all_findings = []
        all_red_flags = []
        all_recommendations = []
        document_types = []
        
        for doc in documents:
            all_findings.extend(doc.key_findings)
            all_red_flags.extend(doc.red_flags)
            all_recommendations.extend(doc.recommendations)
            document_types.append(doc.document_type)
        
        # Calculate overall scores
        avg_completeness = sum(doc.completeness_score for doc in documents) / len(documents)
        avg_confidence = sum(doc.confidence_score for doc in documents) / len(documents)
        
        summary = {
            "total_documents": len(documents),
            "document_types": list(set(document_types)),
            "overall_completeness_score": round(avg_completeness, 1),
            "overall_confidence_score": round(avg_confidence, 1),
            "consolidated_findings": list(set(all_findings)),
            "consolidated_red_flags": list(set(all_red_flags)),
            "priority_recommendations": list(set(all_recommendations)),
            "document_quality_assessment": self._assess_document_quality(documents),
            "case_strength_indicators": self._identify_case_strength_indicators(all_findings, all_red_flags)
        }
        
        return summary
    
    def _assess_document_quality(self, documents: List[DocumentAnalysisResult]) -> Dict[str, Any]:
        """
        Assess the overall quality of the document set
        """
        high_quality = sum(1 for doc in documents if doc.completeness_score >= 80)
        medium_quality = sum(1 for doc in documents if 50 <= doc.completeness_score < 80)
        low_quality = sum(1 for doc in documents if doc.completeness_score < 50)
        
        return {
            "high_quality_documents": high_quality,
            "medium_quality_documents": medium_quality,
            "low_quality_documents": low_quality,
            "quality_distribution": {
                "high": round((high_quality / len(documents)) * 100, 1),
                "medium": round((medium_quality / len(documents)) * 100, 1),
                "low": round((low_quality / len(documents)) * 100, 1)
            },
            "overall_quality": "high" if high_quality / len(documents) > 0.6 else 
                             "medium" if medium_quality / len(documents) > 0.5 else "low"
        }
    
    def _identify_case_strength_indicators(self, findings: List[str], red_flags: List[str]) -> Dict[str, Any]:
        """
        Identify indicators of case strength based on document analysis
        """
        positive_indicators = []
        negative_indicators = []
        
        # Simple keyword analysis for case strength
        positive_keywords = ["clear liability", "strong evidence", "credible witness", "severe injury", "good prognosis"]
        negative_keywords = ["disputed", "unclear", "pre-existing", "non-compliance", "inconsistent"]
        
        for finding in findings:
            finding_lower = finding.lower()
            if any(keyword in finding_lower for keyword in positive_keywords):
                positive_indicators.append(finding)
            elif any(keyword in finding_lower for keyword in negative_keywords):
                negative_indicators.append(finding)
        
        # Add red flags as negative indicators
        negative_indicators.extend(red_flags)
        
        # Calculate strength score
        pos_count = len(positive_indicators)
        neg_count = len(negative_indicators)
        
        if pos_count + neg_count == 0:
            strength_score = 50  # Neutral if no indicators
        else:
            strength_score = (pos_count / (pos_count + neg_count)) * 100
        
        return {
            "strength_score": round(strength_score, 1),
            "positive_indicators": positive_indicators,
            "negative_indicators": negative_indicators,
            "overall_assessment": "strong" if strength_score >= 70 else 
                                "moderate" if strength_score >= 40 else "weak"
        }
