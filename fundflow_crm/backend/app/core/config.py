"""
Configuration management for the application
"""
import os
from typing import Optional

class Settings:
    """Application settings"""
    
    def __init__(self):
        # Database
        self.mongodb_url: Optional[str] = os.getenv("MONGODB_URL")
        self.database_name: str = os.getenv("DATABASE_NAME", "fundflow_crm")
        
        # Security
        self.secret_key: str = os.getenv("SECRET_KEY", "fallback-secret-key-change-in-production")
        self.algorithm: str = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # AI Services
        self.google_api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")
        
        # Validate Google API key immediately
        if self.google_api_key in ["your-google-api-key-here", "", None]:
            self.google_api_key = None
        
        # External Services
        self.telegram_bot_token: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN")
        self.docusign_integration_key: Optional[str] = os.getenv("DOCUSIGN_INTEGRATION_KEY")
        self.docusign_user_id: Optional[str] = os.getenv("DOCUSIGN_USER_ID")
        self.docusign_account_id: Optional[str] = os.getenv("DOCUSIGN_ACCOUNT_ID")
        
        # CORS
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    def validate_ai_config(self) -> dict:
        """Validate AI service configuration"""
        issues = []
        
        if not self.google_api_key or self.google_api_key in ["AIzaSyCkhw1ulFd2W60mZdl1V6nEG2uyQQ_j-es", "AIzaSyCkhw1ulFd2W60mZdl1V6nEG2uyQQ_j-es", None]:
            issues.append("Google API key is missing or placeholder")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
    
    def validate_database_config(self) -> dict:
        """Validate database configuration"""
        issues = []
        
        if not self.mongodb_url:
            issues.append("MongoDB URL is missing - using mock database")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }

# Global settings instance
settings = Settings()
