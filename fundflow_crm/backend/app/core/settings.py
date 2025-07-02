from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    MONGO_URL: str = "mongodb://localhost:27017/"
    DB_NAME: str = "fundflow_crm"

    # AI Providers
    GEMINI_API_KEY: str = "YOUR_GEMINI_API_KEY_HERE"
    ANTHROPIC_API_KEY: str = "YOUR_ANTHROPIC_API_KEY_HERE"

    # JWT
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
