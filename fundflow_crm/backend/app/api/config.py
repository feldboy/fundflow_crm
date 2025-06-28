"""
Configuration Management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import logging

from app.core.config import Settings, get_config
from app.core.auth import verify_token

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/status")
async def get_config_status(config: Settings = Depends(get_config)):
    """Get the status of all configuration sources"""
    try:
        status_info = {}
        
        for source_name, source in config.remote_config.sources.items():
            cached_config = config.remote_config.get_cached_config(source_name)
            
            status_info[source_name] = {
                "url": source.url,
                "refresh_interval": source.refresh_interval,
                "has_cached_data": cached_config is not None,
                "last_updated": None,
                "expires_at": None,
                "fallback_file": source.fallback_file
            }
            
            if source_name in config.remote_config.configs:
                cached = config.remote_config.configs[source_name]
                status_info[source_name].update({
                    "last_updated": cached.last_updated.isoformat(),
                    "expires_at": cached.expires_at.isoformat()
                })
        
        return {
            "status": "healthy",
            "sources": status_info,
            "total_sources": len(config.remote_config.sources)
        }
        
    except Exception as e:
        logger.error(f"Error getting config status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get configuration status: {str(e)}"
        )

@router.post("/refresh")
async def refresh_configs(
    source_name: Optional[str] = None,
    config: Settings = Depends(get_config),
    current_user = Depends(verify_token)
):
    """Refresh configuration from remote sources (admin only)"""
    try:
        if source_name:
            # Refresh specific source
            if source_name not in config.remote_config.sources:
                raise HTTPException(
                    status_code=404,
                    detail=f"Configuration source '{source_name}' not found"
                )
            
            async with config.remote_config:
                result = await config.remote_config.fetch_config(source_name, force_refresh=True)
            
            if result:
                return {
                    "message": f"Successfully refreshed configuration from {source_name}",
                    "source": source_name,
                    "data_keys": list(result.keys()) if isinstance(result, dict) else []
                }
            else:
                return JSONResponse(
                    status_code=500,
                    content={"message": f"Failed to refresh configuration from {source_name}"}
                )
        else:
            # Refresh all sources
            async with config.remote_config:
                await config.remote_config.refresh_all_configs()
            
            return {
                "message": "Successfully refreshed all configuration sources",
                "sources": list(config.remote_config.sources.keys())
            }
            
    except Exception as e:
        logger.error(f"Error refreshing configs: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh configuration: {str(e)}"
        )

@router.get("/sources")
async def list_config_sources(config: Settings = Depends(get_config)):
    """List all configured remote sources"""
    try:
        sources = []
        for source_name, source in config.remote_config.sources.items():
            sources.append({
                "name": source_name,
                "url": source.url,
                "refresh_interval": source.refresh_interval,
                "has_auth": bool(source.auth_token),
                "fallback_file": source.fallback_file
            })
        
        return {
            "sources": sources,
            "total": len(sources)
        }
        
    except Exception as e:
        logger.error(f"Error listing config sources: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list configuration sources: {str(e)}"
        )

@router.get("/feature-flags")
async def get_feature_flags(config: Settings = Depends(get_config)):
    """Get all feature flags"""
    try:
        async with config.remote_config:
            flags = await config.remote_config.fetch_config("feature_flags")
        
        if not flags:
            # Return empty flags if no remote config
            flags = {}
        
        return {
            "feature_flags": flags,
            "total_flags": len(flags)
        }
        
    except Exception as e:
        logger.error(f"Error getting feature flags: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get feature flags: {str(e)}"
        )

@router.get("/feature-flags/{flag_name}")
async def get_feature_flag(flag_name: str, config: Settings = Depends(get_config)):
    """Get a specific feature flag value"""
    try:
        value = await config.get_feature_flag(flag_name)
        
        return {
            "flag_name": flag_name,
            "enabled": value,
            "type": "boolean"
        }
        
    except Exception as e:
        logger.error(f"Error getting feature flag {flag_name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get feature flag: {str(e)}"
        )

@router.get("/ai-models")
async def get_ai_models_config(config: Settings = Depends(get_config)):
    """Get AI models configuration"""
    try:
        async with config.remote_config:
            ai_config = await config.remote_config.fetch_config("ai_models")
        
        if not ai_config:
            ai_config = {}
        
        return {
            "ai_models": ai_config,
            "available_models": list(ai_config.keys()) if isinstance(ai_config, dict) else []
        }
        
    except Exception as e:
        logger.error(f"Error getting AI models config: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI models configuration: {str(e)}"
        )

@router.get("/ai-models/{model_name}")
async def get_ai_model_config(model_name: str, config: Settings = Depends(get_config)):
    """Get configuration for a specific AI model"""
    try:
        model_config = await config.get_ai_model_config(model_name)
        
        if not model_config:
            raise HTTPException(
                status_code=404,
                detail=f"Configuration for AI model '{model_name}' not found"
            )
        
        return {
            "model_name": model_name,
            "configuration": model_config
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI model config for {model_name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI model configuration: {str(e)}"
        )

@router.get("/cors")
async def get_cors_config(config: Settings = Depends(get_config)):
    """Get CORS configuration"""
    try:
        origins = await config.get_cors_origins()
        
        return {
            "allowed_origins": origins,
            "total_origins": len(origins)
        }
        
    except Exception as e:
        logger.error(f"Error getting CORS config: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get CORS configuration: {str(e)}"
        )

@router.get("/rate-limits")
async def get_rate_limits_config(config: Settings = Depends(get_config)):
    """Get rate limiting configuration"""
    try:
        limits = await config.get_rate_limits()
        
        return {
            "rate_limits": limits
        }
        
    except Exception as e:
        logger.error(f"Error getting rate limits config: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get rate limits configuration: {str(e)}"
        )

@router.get("/database")
async def get_database_config(config: Settings = Depends(get_config)):
    """Get database configuration (sensitive data masked)"""
    try:
        db_config = await config.get_database_config()
        
        # Mask sensitive information
        safe_config = db_config.copy()
        if 'url' in safe_config and safe_config['url']:
            # Mask the connection string
            url = safe_config['url']
            if '@' in url:
                # Format: mongodb://user:pass@host:port/db
                parts = url.split('@')
                if len(parts) >= 2:
                    safe_config['url'] = f"{parts[0].split('//')[0]}//***:***@{parts[1]}"
            else:
                safe_config['url'] = "***masked***"
        
        return {
            "database_config": safe_config
        }
        
    except Exception as e:
        logger.error(f"Error getting database config: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get database configuration: {str(e)}"
        )
