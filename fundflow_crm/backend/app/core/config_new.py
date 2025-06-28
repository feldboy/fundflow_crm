"""
Configuration management for the application with remote config support
"""
import os
import json
import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from dataclasses import dataclass
import httpx
import aiofiles
from pathlib import Path

logger = logging.getLogger(__name__)

class ConfigSource(BaseModel):
    """Configuration source definition"""
    name: str
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    auth_token: Optional[str] = None
    refresh_interval: int = 300  # 5 minutes default
    fallback_file: Optional[str] = None

@dataclass
class CachedConfig:
    """Cached configuration data"""
    data: Dict[str, Any]
    last_updated: datetime
    source: str
    expires_at: datetime

class RemoteConfigManager:
    """
    Manages remote configuration fetching, caching, and fallback mechanisms
    """
    
    def __init__(self):
        self.configs: Dict[str, CachedConfig] = {}
        self.sources: Dict[str, ConfigSource] = {}
        self.cache_dir = Path("config_cache")
        self.cache_dir.mkdir(exist_ok=True)
        self._client: Optional[httpx.AsyncClient] = None
        
    async def __aenter__(self):
        self._client = httpx.AsyncClient(timeout=30.0)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
    
    def add_source(self, source: ConfigSource):
        """Add a remote configuration source"""
        self.sources[source.name] = source
        logger.info("Added config source: %s", source.name)
    
    async def fetch_config(self, source_name: str, force_refresh: bool = False) -> Optional[Dict[str, Any]]:
        """
        Fetch configuration from a remote source
        """
        if source_name not in self.sources:
            logger.error("Unknown config source: %s", source_name)
            return None
            
        source = self.sources[source_name]
        
        # Check cache first (unless force refresh)
        if not force_refresh and source_name in self.configs:
            cached = self.configs[source_name]
            if datetime.now() < cached.expires_at:
                logger.debug("Using cached config for %s", source_name)
                return cached.data
        
        try:
            # Prepare headers
            headers = source.headers.copy()
            if source.auth_token:
                headers["Authorization"] = f"Bearer {source.auth_token}"
            
            if not self._client:
                self._client = httpx.AsyncClient(timeout=30.0)
            
            # Fetch from remote
            logger.info("Fetching config from %s: %s", source_name, source.url)
            response = await self._client.get(source.url, headers=headers)
            response.raise_for_status()
            
            config_data = response.json()
            
            # Cache the configuration
            cached_config = CachedConfig(
                data=config_data,
                last_updated=datetime.now(),
                source=source_name,
                expires_at=datetime.now() + timedelta(seconds=source.refresh_interval)
            )
            
            self.configs[source_name] = cached_config
            
            # Save to disk for fallback
            await self._save_to_cache(source_name, config_data)
            
            logger.info("Successfully fetched config from %s", source_name)
            return config_data
            
        except (httpx.RequestError, httpx.HTTPStatusError, json.JSONDecodeError) as e:
            logger.error("Failed to fetch config from %s: %s", source_name, e)
            
            # Try fallback mechanisms
            return await self._get_fallback_config(source_name)
    
    async def _save_to_cache(self, source_name: str, data: Dict[str, Any]):
        """Save configuration to local cache file"""
        try:
            cache_file = self.cache_dir / f"{source_name}.json"
            async with aiofiles.open(cache_file, 'w') as f:
                await f.write(json.dumps(data, indent=2))
            logger.debug("Saved config cache for %s", source_name)
        except (OSError, json.JSONEncodeError) as e:
            logger.error("Failed to save config cache: %s", e)
    
    async def _get_fallback_config(self, source_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration from fallback sources"""
        source = self.sources[source_name]
        
        # Try cached file first
        try:
            cache_file = self.cache_dir / f"{source_name}.json"
            if cache_file.exists():
                async with aiofiles.open(cache_file, 'r') as f:
                    content = await f.read()
                    data = json.loads(content)
                    logger.info("Using cached fallback for %s", source_name)
                    return data
        except (OSError, json.JSONDecodeError) as e:
            logger.error("Failed to read cache file: %s", e)
        
        # Try explicit fallback file
        if source.fallback_file and Path(source.fallback_file).exists():
            try:
                async with aiofiles.open(source.fallback_file, 'r') as f:
                    content = await f.read()
                    data = json.loads(content)
                    logger.info("Using fallback file for %s", source_name)
                    return data
            except (OSError, json.JSONDecodeError) as e:
                logger.error("Failed to read fallback file: %s", e)
        
        logger.error("No fallback available for %s", source_name)
        return None
    
    async def get_config_value(self, source_name: str, key: str, default: Any = None, force_refresh: bool = False) -> Any:
        """Get a specific configuration value"""
        config = await self.fetch_config(source_name, force_refresh)
        if not config:
            return default
        
        # Support nested keys like "database.host"
        keys = key.split('.')
        value = config
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default
    
    async def refresh_all_configs(self):
        """Refresh all configured sources"""
        tasks = [self.fetch_config(source_name, force_refresh=True) 
                for source_name in self.sources.keys()]
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count = sum(1 for r in results if not isinstance(r, Exception))
            logger.info("Refreshed %d/%d config sources", success_count, len(tasks))
    
    def get_cached_config(self, source_name: str) -> Optional[Dict[str, Any]]:
        """Get cached configuration without fetching"""
        if source_name in self.configs:
            return self.configs[source_name].data
        return None

class Settings:
    """Application settings with remote config support"""
    
    def __init__(self):
        # Initialize remote config manager
        self.remote_config = RemoteConfigManager()
        self._setup_remote_sources()
        
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
    
    def _setup_remote_sources(self):
        """Setup remote configuration sources from environment"""
        
        # Main app config source
        main_config_url = os.getenv("REMOTE_CONFIG_URL")
        if main_config_url:
            self.remote_config.add_source(ConfigSource(
                name="main",
                url=main_config_url,
                auth_token=os.getenv("REMOTE_CONFIG_TOKEN"),
                refresh_interval=int(os.getenv("CONFIG_REFRESH_INTERVAL", "300")),
                fallback_file="config/main.json"
            ))
        
        # Feature flags source
        feature_flags_url = os.getenv("FEATURE_FLAGS_URL")
        if feature_flags_url:
            self.remote_config.add_source(ConfigSource(
                name="feature_flags",
                url=feature_flags_url,
                auth_token=os.getenv("FEATURE_FLAGS_TOKEN"),
                refresh_interval=int(os.getenv("FEATURE_FLAGS_REFRESH_INTERVAL", "60")),
                fallback_file="config/feature_flags.json"
            ))
        
        # AI model configs
        ai_config_url = os.getenv("AI_CONFIG_URL")
        if ai_config_url:
            self.remote_config.add_source(ConfigSource(
                name="ai_models",
                url=ai_config_url,
                auth_token=os.getenv("AI_CONFIG_TOKEN"),
                refresh_interval=int(os.getenv("AI_CONFIG_REFRESH_INTERVAL", "900")),  # 15 min
                fallback_file="config/ai_models.json"
            ))
    
    async def initialize_remote_config(self):
        """Initialize remote configuration system"""
        async with self.remote_config:
            await self.remote_config.refresh_all_configs()
        logger.info("Remote configuration system initialized")
    
    async def get_database_config(self) -> Dict[str, Any]:
        """Get database configuration from remote or local"""
        async with self.remote_config:
            config = await self.remote_config.fetch_config("main")
            if config and "database" in config:
                return config["database"]
        
        # Fallback to environment variables
        return {
            "url": self.mongodb_url,
            "name": self.database_name,
            "timeout": int(os.getenv("DB_TIMEOUT", "30")),
            "pool_size": int(os.getenv("DB_POOL_SIZE", "10"))
        }
    
    async def get_feature_flag(self, flag_name: str, default: bool = False) -> bool:
        """Get feature flag value"""
        async with self.remote_config:
            value = await self.remote_config.get_config_value("feature_flags", flag_name, default)
            return bool(value)
    
    async def get_ai_model_config(self, model_name: str) -> Dict[str, Any]:
        """Get AI model configuration"""
        async with self.remote_config:
            config = await self.remote_config.get_config_value("ai_models", model_name, {})
            return config or {}
    
    async def get_cors_origins(self) -> list:
        """Get CORS allowed origins"""
        async with self.remote_config:
            origins = await self.remote_config.get_config_value("main", "cors.allowed_origins")
            if origins:
                return origins
        
        # Fallback to environment variable
        return os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:4028").split(",")
    
    async def get_rate_limits(self) -> Dict[str, int]:
        """Get API rate limiting configuration"""
        async with self.remote_config:
            limits = await self.remote_config.get_config_value("main", "rate_limits", {})
            if limits:
                return limits
        
        # Default rate limits
        return {
            "requests_per_minute": 60,
            "burst_limit": 10,
            "daily_limit": 10000
        }
    
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

# Dependency injection for FastAPI
async def get_config() -> Settings:
    """Dependency injection for FastAPI"""
    return settings

async def refresh_config_task():
    """Background task to refresh configurations"""
    while True:
        try:
            await asyncio.sleep(300)  # 5 minutes
            async with settings.remote_config:
                await settings.remote_config.refresh_all_configs()
        except asyncio.CancelledError:
            logger.info("Config refresh task cancelled")
            break
        except Exception as e:
            logger.error("Error in config refresh task: %s", e)

# Global settings instance
settings = Settings()
