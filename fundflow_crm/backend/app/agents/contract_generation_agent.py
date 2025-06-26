import google.generativeai as genai
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import random
from dataclasses import dataclass

@dataclass
class ContractTemplate:
    """Structure for contract templates"""
    template_id: str
    name: str
    description: str
    template_content: str
    required_fields: List[str]
    conditional_fields: List[str]
    jurisdiction: Optional[str] = None

class ContractGenerationAgent:
    """
    Advanced AI agent for generating and managing legal contracts
    """
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Load contract templates
        self.templates = self._initialize_templates()
        
        # Legal compliance settings
        self.compliance_settings = {
            "require_witness": True,
            "require_notarization": False,
            "include_arbitration_clause": True,
            "include_fee_schedule": True,
            "include_default_provisions": True
        }
    
    def _initialize_templates(self) -> Dict[str, ContractTemplate]:
        """
        Initialize standard contract templates
        """
        templates = {}
        
        # Standard Pre-Settlement Funding Agreement
        standard_template = ContractTemplate(
            template_id="standard_funding",
            name="Standard Pre-Settlement Funding Agreement",
            description="Standard funding agreement for personal injury cases",
            template_content="""
PRE-SETTLEMENT FUNDING AGREEMENT

This Pre-Settlement Funding Agreement ("Agreement") is entered into on {{contract_date}} between {{company_name}} ("Company") and {{plaintiff_name}} ("Plaintiff").

CASE INFORMATION:
Case Type: {{case_type}}
Incident Date: {{incident_date}}
Representing Attorney: {{attorney_name}}
Law Firm: {{law_firm_name}}
Case Description: {{case_description}}

FUNDING TERMS:
Principal Amount: ${{principal_amount}}
Contract Fee: ${{contract_fee}} ({{fee_percentage}}%)
Total Repayment Amount: ${{total_repayment}}
Annual Percentage Rate: {{annual_rate}}%

REPAYMENT TERMS:
1. This is a non-recourse advance against Plaintiff's anticipated recovery from the above-described case.
2. Repayment is due only upon successful resolution of the case through settlement, judgment, or other recovery.
3. If no recovery is obtained, Plaintiff owes nothing to Company.
4. The total amount due shall not exceed the contracted repayment amount regardless of time to resolution.

CASE REQUIREMENTS:
1. Plaintiff must be represented by qualified legal counsel throughout the case.
2. Plaintiff agrees to notify Company of any settlement offers or significant case developments.
3. Plaintiff authorizes attorney to provide Company with case status updates upon request.
4. Attorney agrees to honor this assignment and pay Company directly from any recovery.

PLAINTIFF REPRESENTATIONS:
1. Plaintiff has good title to the claim and the right to assign a portion of the recovery.
2. There are no other assignments, liens, or encumbrances on the claim other than attorney fees.
3. All information provided to Company regarding the case is true and accurate.
4. Plaintiff will not settle the case without Company's written consent.

ATTORNEY ACKNOWLEDGMENT:
The undersigned attorney acknowledges this Agreement and agrees to:
1. Honor the assignment and pay Company directly from any recovery
2. Provide periodic case status updates to Company
3. Notify Company before accepting any settlement offer
4. Maintain professional liability insurance throughout representation

GOVERNING LAW:
This Agreement shall be governed by the laws of {{governing_state}} and any disputes shall be resolved through binding arbitration.

ENTIRE AGREEMENT:
This Agreement constitutes the entire agreement between the parties and may only be modified in writing signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.

PLAINTIFF:                           COMPANY:
{{plaintiff_name}}                   {{company_name}}
_________________________           By: _________________________
Date: ___________                    Name: {{authorized_signatory}}
                                     Title: {{signatory_title}}
                                     Date: ___________

ATTORNEY ACKNOWLEDGMENT:
{{attorney_name}}
{{law_firm_name}}
_________________________
Date: ___________

WITNESS:
_________________________
Name: {{witness_name}}
Date: ___________
            """,
            required_fields=[
                "plaintiff_name", "case_type", "incident_date", "attorney_name", 
                "law_firm_name", "principal_amount", "contract_fee", "total_repayment",
                "company_name", "authorized_signatory", "signatory_title"
            ],
            conditional_fields=[
                "case_description", "fee_percentage", "annual_rate", "governing_state",
                "witness_name", "contract_date"
            ]
        )
        
        templates["standard_funding"] = standard_template
        
        # High-Risk Funding Agreement (with additional protections)
        high_risk_template = ContractTemplate(
            template_id="high_risk_funding",
            name="High-Risk Pre-Settlement Funding Agreement",
            description="Enhanced funding agreement with additional protections for high-risk cases",
            template_content="""
HIGH-RISK PRE-SETTLEMENT FUNDING AGREEMENT

This High-Risk Pre-Settlement Funding Agreement ("Agreement") is entered into on {{contract_date}} between {{company_name}} ("Company") and {{plaintiff_name}} ("Plaintiff").

CASE INFORMATION:
Case Type: {{case_type}}
Incident Date: {{incident_date}}
Representing Attorney: {{attorney_name}}
Law Firm: {{law_firm_name}}
Case Description: {{case_description}}
Risk Level: HIGH

FUNDING TERMS:
Principal Amount: ${{principal_amount}}
Contract Fee: ${{contract_fee}} ({{fee_percentage}}%)
Total Repayment Amount: ${{total_repayment}}
Annual Percentage Rate: {{annual_rate}}%
Risk Premium: ${{risk_premium}}

ENHANCED MONITORING PROVISIONS:
1. Plaintiff agrees to monthly case status reports through attorney
2. Company reserves the right to request case file review at any time
3. Attorney must notify Company within 48 hours of any adverse developments
4. Plaintiff must obtain Company approval before changing legal representation

ADDITIONAL SECURITY PROVISIONS:
1. Plaintiff provides personal guarantee for accuracy of all case information
2. Plaintiff agrees to reimburse Company's costs if case information is materially false
3. Enhanced lien protection and recording requirements
4. Mandatory arbitration with expedited procedures

REPAYMENT TERMS:
1. This is a non-recourse advance against Plaintiff's anticipated recovery from the above-described case.
2. Repayment is due only upon successful resolution of the case through settlement, judgment, or other recovery.
3. If no recovery is obtained, Plaintiff owes nothing to Company except as provided in security provisions.
4. The total amount due shall not exceed the contracted repayment amount.

[Additional standard clauses as in standard template...]

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.

PLAINTIFF:                           COMPANY:
{{plaintiff_name}}                   {{company_name}}
_________________________           By: _________________________
Date: ___________                    Name: {{authorized_signatory}}
                                     Title: {{signatory_title}}
                                     Date: ___________

ATTORNEY ACKNOWLEDGMENT:
{{attorney_name}}
{{law_firm_name}}
_________________________
Date: ___________

WITNESS:
_________________________
Name: {{witness_name}}
Date: ___________

NOTARY:
_________________________
Notary Public
My Commission Expires: ___________
            """,
            required_fields=[
                "plaintiff_name", "case_type", "incident_date", "attorney_name", 
                "law_firm_name", "principal_amount", "contract_fee", "total_repayment",
                "company_name", "authorized_signatory", "signatory_title", "risk_premium"
            ],
            conditional_fields=[
                "case_description", "fee_percentage", "annual_rate", "governing_state",
                "witness_name", "contract_date"
            ],
            jurisdiction="multi_state"
        )
        
        templates["high_risk_funding"] = high_risk_template
        
        return templates
    
    async def generate_contract(self, 
                              plaintiff_data: Dict[str, Any],
                              funding_terms: Dict[str, Any],
                              law_firm_data: Dict[str, Any],
                              template_type: str = "standard_funding",
                              custom_clauses: List[str] = None) -> Dict[str, Any]:
        """
        Generate a complete funding contract with AI assistance
        """
        try:
            # Get template
            template = self.templates.get(template_type)
            if not template:
                raise ValueError(f"Template type '{template_type}' not found")
            
            # Prepare contract data
            contract_data = await self._prepare_contract_data(
                plaintiff_data, funding_terms, law_firm_data
            )
            
            # Validate required fields
            validation_result = self._validate_contract_data(contract_data, template)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": "Missing required data",
                    "missing_fields": validation_result["missing_fields"]
                }
            
            # Generate contract content
            contract_content = await self._populate_template(template, contract_data)
            
            # Add custom clauses if provided
            if custom_clauses:
                contract_content = await self._add_custom_clauses(contract_content, custom_clauses)
            
            # AI review and enhancement
            enhanced_contract = await self._ai_contract_review(contract_content, contract_data)
            
            # Generate contract metadata
            contract_metadata = self._generate_contract_metadata(
                template, plaintiff_data, funding_terms
            )
            
            return {
                "success": True,
                "contract_id": self._generate_contract_id(),
                "contract_content": enhanced_contract,
                "template_used": template_type,
                "metadata": contract_metadata,
                "validation_status": "passed",
                "ai_recommendations": await self._generate_ai_recommendations(contract_data)
            }
            
        except Exception as e:
            print(f"Error generating contract: {e}")
            return {
                "success": False,
                "error": str(e),
                "contract_id": None
            }
    
    async def _prepare_contract_data(self, 
                                   plaintiff_data: Dict[str, Any],
                                   funding_terms: Dict[str, Any],
                                   law_firm_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare comprehensive contract data from various sources
        """
        # Basic plaintiff information
        contract_data = {
            "plaintiff_name": f"{plaintiff_data.get('firstName', '')} {plaintiff_data.get('lastName', '')}".strip(),
            "case_type": plaintiff_data.get("caseType", "Personal Injury"),
            "incident_date": self._format_date(plaintiff_data.get("incidentDate")),
            "case_description": plaintiff_data.get("caseNotes", "Personal injury case")
        }
        
        # Law firm information
        if law_firm_data:
            contract_data.update({
                "law_firm_name": law_firm_data.get("name", "Law Firm"),
                "attorney_name": "Attorney Name",  # Would need attorney-specific data
                "law_firm_address": law_firm_data.get("address", ""),
                "law_firm_phone": law_firm_data.get("phone", ""),
                "law_firm_email": law_firm_data.get("email", "")
            })
        
        # Funding terms
        principal_amount = funding_terms.get("principal_amount", 0)
        fee_rate = funding_terms.get("fee_rate", 0.20)  # 20% default
        
        contract_fee = principal_amount * fee_rate
        total_repayment = principal_amount + contract_fee
        
        contract_data.update({
            "principal_amount": f"{principal_amount:,.2f}",
            "contract_fee": f"{contract_fee:,.2f}",
            "total_repayment": f"{total_repayment:,.2f}",
            "fee_percentage": f"{fee_rate * 100:.1f}",
            "annual_rate": f"{self._calculate_annual_rate(fee_rate):.1f}"
        })
        
        # Company information (would be from settings/config)
        contract_data.update({
            "company_name": "FundFlow Capital LLC",
            "authorized_signatory": "John Smith",
            "signatory_title": "President",
            "contract_date": datetime.now().strftime("%B %d, %Y"),
            "governing_state": "Delaware",
            "witness_name": "Jane Witness"
        })
        
        # Calculate risk premium for high-risk contracts
        if funding_terms.get("risk_level") == "HIGH":
            risk_premium = principal_amount * 0.05  # 5% risk premium
            contract_data["risk_premium"] = f"{risk_premium:,.2f}"
        
        return contract_data
    
    def _validate_contract_data(self, contract_data: Dict[str, Any], 
                              template: ContractTemplate) -> Dict[str, Any]:
        """
        Validate that all required contract data is present
        """
        missing_fields = []
        
        for field in template.required_fields:
            if field not in contract_data or not contract_data[field]:
                missing_fields.append(field)
        
        return {
            "valid": len(missing_fields) == 0,
            "missing_fields": missing_fields
        }
    
    async def _populate_template(self, template: ContractTemplate, 
                               contract_data: Dict[str, Any]) -> str:
        """
        Populate template with contract data
        """
        contract_content = template.template_content
        
        # Replace all template variables
        for key, value in contract_data.items():
            placeholder = "{{" + key + "}}"
            contract_content = contract_content.replace(placeholder, str(value))
        
        # Fill in any remaining placeholders with AI assistance
        if "{{" in contract_content:
            contract_content = await self._ai_fill_missing_fields(contract_content, contract_data)
        
        return contract_content
    
    async def _ai_fill_missing_fields(self, contract_content: str, 
                                    contract_data: Dict[str, Any]) -> str:
        """
        Use AI to fill in any missing template fields
        """
        prompt = f"""
        Complete this legal contract by filling in any remaining template placeholders with appropriate values.
        
        Contract Data Available:
        {json.dumps(contract_data, indent=2)}
        
        Contract Content:
        {contract_content}
        
        For any remaining {{placeholder}} values, provide reasonable defaults or standard legal language.
        Ensure all legal requirements are met and the contract is complete and professional.
        
        Return the completed contract content.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error filling missing fields: {e}")
            return contract_content
    
    async def _add_custom_clauses(self, contract_content: str, 
                                custom_clauses: List[str]) -> str:
        """
        Add custom clauses to the contract with AI assistance for proper integration
        """
        if not custom_clauses:
            return contract_content
        
        prompt = f"""
        Integrate the following custom clauses into this legal contract in the most appropriate locations.
        
        Custom Clauses to Add:
        {json.dumps(custom_clauses, indent=2)}
        
        Existing Contract:
        {contract_content}
        
        Please:
        1. Insert each clause in the most legally appropriate section
        2. Ensure proper numbering and formatting
        3. Maintain legal consistency and flow
        4. Avoid duplication with existing provisions
        
        Return the complete contract with custom clauses integrated.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error adding custom clauses: {e}")
            return contract_content
    
    async def _ai_contract_review(self, contract_content: str, 
                                contract_data: Dict[str, Any]) -> str:
        """
        AI review and enhancement of the contract
        """
        prompt = f"""
        Review this pre-settlement funding contract for completeness, accuracy, and legal compliance.
        
        Contract Data Context:
        {json.dumps(contract_data, indent=2)}
        
        Contract Content:
        {contract_content}
        
        Please review and enhance the contract by:
        1. Ensuring all legal requirements are met
        2. Checking for consistency in terms and amounts
        3. Improving clarity and readability
        4. Adding any missing standard provisions
        5. Ensuring proper legal formatting
        
        Return the enhanced contract content.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error in AI contract review: {e}")
            return contract_content
    
    def _generate_contract_metadata(self, template: ContractTemplate,
                                  plaintiff_data: Dict[str, Any],
                                  funding_terms: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate metadata for the contract
        """
        return {
            "template_id": template.template_id,
            "template_name": template.name,
            "generation_date": datetime.now().isoformat(),
            "plaintiff_id": plaintiff_data.get("id"),
            "principal_amount": funding_terms.get("principal_amount"),
            "contract_type": "pre_settlement_funding",
            "jurisdiction": template.jurisdiction or "default",
            "requires_notarization": "notary" in template.template_content.lower(),
            "requires_witness": "witness" in template.template_content.lower(),
            "status": "draft"
        }
    
    async def _generate_ai_recommendations(self, contract_data: Dict[str, Any]) -> List[str]:
        """
        Generate AI recommendations for the contract
        """
        prompt = f"""
        Based on this contract data, provide recommendations for the funding agreement.
        
        Contract Information:
        {json.dumps(contract_data, indent=2)}
        
        Provide 3-5 specific recommendations covering:
        1. Risk management considerations
        2. Additional clauses that might be beneficial
        3. Compliance considerations
        4. Documentation requirements
        5. Process improvements
        
        Return as a JSON array of recommendation strings.
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
            print(f"Error generating AI recommendations: {e}")
            return ["Consider additional legal review", "Verify all funding terms are accurate"]
    
    def _format_date(self, date_input: Any) -> str:
        """
        Format date for contract display
        """
        if not date_input:
            return "________________"
        
        try:
            if isinstance(date_input, str):
                date_obj = datetime.fromisoformat(date_input.replace('Z', '+00:00'))
            else:
                date_obj = date_input
            
            return date_obj.strftime("%B %d, %Y")
        except Exception:
            return "________________"
    
    def _calculate_annual_rate(self, fee_rate: float, 
                             estimated_case_duration_months: int = 18) -> float:
        """
        Calculate annual percentage rate for disclosure purposes
        """
        # Simple APR calculation for disclosure
        # In practice, this would be more complex and regulated
        monthly_rate = fee_rate / estimated_case_duration_months
        annual_rate = monthly_rate * 12 * 100
        return min(annual_rate, 99.9)  # Cap at reasonable maximum
    
    def _generate_contract_id(self) -> str:
        """
        Generate unique contract identifier
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_suffix = f"{random.randint(1000, 9999)}"
        return f"PSF{timestamp}{random_suffix}"
    
    async def validate_contract_compliance(self, contract_content: str,
                                         jurisdiction: str = "default") -> Dict[str, Any]:
        """
        Validate contract for legal compliance
        """
        prompt = f"""
        Review this pre-settlement funding contract for legal compliance in {jurisdiction} jurisdiction.
        
        Contract Content:
        {contract_content[:2000]}...
        
        Check for compliance with:
        1. Required disclosures
        2. Interest rate regulations
        3. Consumer protection requirements
        4. Proper legal formatting
        5. Essential contract elements
        
        Return analysis as JSON:
        {{
            "compliant": true/false,
            "compliance_score": 0-100,
            "required_disclosures": ["disclosure1", ...],
            "missing_elements": ["element1", ...],
            "recommendations": ["recommendation1", ...],
            "risk_level": "low/medium/high"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            compliance_result = json.loads(content)
            return compliance_result
            
        except Exception as e:
            print(f"Error validating contract compliance: {e}")
            return {
                "compliant": False,
                "compliance_score": 0,
                "error": str(e),
                "recommendations": ["Manual legal review required"]
            }
    
    async def generate_contract_amendments(self, original_contract: str,
                                         amendment_requests: List[str]) -> Dict[str, Any]:
        """
        Generate contract amendments
        """
        prompt = f"""
        Generate amendments to this pre-settlement funding contract based on the requested changes.
        
        Original Contract:
        {original_contract[:1500]}...
        
        Requested Amendments:
        {json.dumps(amendment_requests, indent=2)}
        
        For each amendment:
        1. Identify the specific section to modify
        2. Provide the exact new language
        3. Explain the legal implications
        4. Ensure consistency with the rest of the contract
        
        Return as JSON:
        {{
            "amendments": [
                {{
                    "section": "section_name",
                    "original_text": "original language",
                    "amended_text": "new language",
                    "rationale": "explanation"
                }}
            ],
            "summary": "overall summary of changes",
            "legal_implications": ["implication1", ...]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            amendments = json.loads(content)
            return amendments
            
        except Exception as e:
            print(f"Error generating contract amendments: {e}")
            return {
                "error": str(e),
                "amendments": [],
                "summary": "Manual amendment required"
            }
    
    def get_available_templates(self) -> List[Dict[str, Any]]:
        """
        Get list of available contract templates
        """
        return [
            {
                "template_id": template.template_id,
                "name": template.name,
                "description": template.description,
                "required_fields": template.required_fields,
                "conditional_fields": template.conditional_fields,
                "jurisdiction": template.jurisdiction
            }
            for template in self.templates.values()
        ]
    
    async def customize_template(self, template_id: str, 
                               customizations: Dict[str, Any]) -> Dict[str, Any]:
        """
        Customize an existing template
        """
        if template_id not in self.templates:
            return {"error": f"Template {template_id} not found"}
        
        original_template = self.templates[template_id]
        
        # AI-assisted template customization
        prompt = f"""
        Customize this legal contract template based on the requested modifications.
        
        Original Template:
        {original_template.template_content}
        
        Customizations Requested:
        {json.dumps(customizations, indent=2)}
        
        Apply the customizations while maintaining legal integrity and proper formatting.
        Return the customized template content.
        """
        
        try:
            response = self.model.generate_content(prompt)
            customized_content = response.text.strip()
            
            # Create new template instance
            new_template_id = f"{template_id}_custom_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            customized_template = ContractTemplate(
                template_id=new_template_id,
                name=f"{original_template.name} (Customized)",
                description=f"Customized version of {original_template.name}",
                template_content=customized_content,
                required_fields=original_template.required_fields.copy(),
                conditional_fields=original_template.conditional_fields.copy(),
                jurisdiction=original_template.jurisdiction
            )
            
            # Store the customized template
            self.templates[new_template_id] = customized_template
            
            return {
                "success": True,
                "new_template_id": new_template_id,
                "customized_template": {
                    "template_id": customized_template.template_id,
                    "name": customized_template.name,
                    "description": customized_template.description
                }
            }
            
        except Exception as e:
            print(f"Error customizing template: {e}")
            return {"error": str(e)}
    
    async def contract_comparison(self, contract1: str, contract2: str) -> Dict[str, Any]:
        """
        Compare two contracts and highlight differences
        """
        prompt = f"""
        Compare these two pre-settlement funding contracts and identify key differences.
        
        Contract 1:
        {contract1[:1500]}...
        
        Contract 2:
        {contract2[:1500]}...
        
        Identify differences in:
        1. Financial terms
        2. Legal provisions
        3. Risk allocations
        4. Compliance requirements
        5. Operational terms
        
        Return as JSON:
        {{
            "differences": [
                {{
                    "category": "category_name",
                    "description": "difference description",
                    "contract1_provision": "text from contract 1",
                    "contract2_provision": "text from contract 2",
                    "significance": "high/medium/low"
                }}
            ],
            "similarity_score": 0-100,
            "recommendation": "overall recommendation"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            comparison = json.loads(content)
            return comparison
            
        except Exception as e:
            print(f"Error comparing contracts: {e}")
            return {
                "error": str(e),
                "differences": [],
                "similarity_score": 0,
                "recommendation": "Manual comparison required"
            }
