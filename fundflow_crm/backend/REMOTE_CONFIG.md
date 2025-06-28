# Remote Configuration Management

This document explains how to set up and use the remote configuration management system for the FundFlow CRM backend.

## Overview

The remote configuration system allows you to:
- Store configuration in remote repositories/services
- Update configuration without redeploying the application
- Manage feature flags dynamically
- Configure AI models and their parameters
- Handle environment-specific settings
- Implement fallback mechanisms for reliability

## Architecture

The system consists of:
1. **RemoteConfigManager**: Core service for fetching and caching configuration
2. **ConfigSource**: Defines remote configuration sources
3. **CachedConfig**: Handles local caching with expiration
4. **Settings**: Enhanced settings class with remote config support
5. **Configuration API**: REST endpoints for managing configuration

## Configuration Sources

### 1. Main Application Configuration
- **Purpose**: Core application settings (database, CORS, rate limits, etc.)
- **Environment Variable**: `REMOTE_CONFIG_URL`
- **Fallback File**: `config/main.json`
- **Refresh Interval**: 5 minutes (configurable)

### 2. Feature Flags
- **Purpose**: Toggle features on/off dynamically
- **Environment Variable**: `FEATURE_FLAGS_URL`
- **Fallback File**: `config/feature_flags.json`
- **Refresh Interval**: 1 minute (configurable)

### 3. AI Models Configuration
- **Purpose**: AI model parameters, safety settings, etc.
- **Environment Variable**: `AI_CONFIG_URL`
- **Fallback File**: `config/ai_models.json`
- **Refresh Interval**: 15 minutes (configurable)

## Setup Instructions

### 1. Environment Variables

Add these variables to your `.env` file:

```bash
# Remote Configuration URLs (Optional)
REMOTE_CONFIG_URL=https://your-config-server.com/api/config/main
REMOTE_CONFIG_TOKEN=your-config-server-token

FEATURE_FLAGS_URL=https://your-config-server.com/api/config/feature-flags
FEATURE_FLAGS_TOKEN=your-feature-flags-token
FEATURE_FLAGS_REFRESH_INTERVAL=60

AI_CONFIG_URL=https://your-config-server.com/api/config/ai-models
AI_CONFIG_TOKEN=your-ai-config-token
AI_CONFIG_REFRESH_INTERVAL=900

CONFIG_REFRESH_INTERVAL=300
```

### 2. Configuration Server Requirements

Your configuration server should provide endpoints that return JSON responses:

```json
{
  "database": {
    "timeout": 30,
    "pool_size": 10
  },
  "cors": {
    "allowed_origins": ["http://localhost:3000"]
  },
  "rate_limits": {
    "requests_per_minute": 100
  }
}
```

### 3. Authentication

If your configuration server requires authentication, set the appropriate token:
```bash
REMOTE_CONFIG_TOKEN=Bearer your-jwt-token
# or
REMOTE_CONFIG_TOKEN=your-api-key
```

## Usage Examples

### 1. Getting Feature Flags

```python
from app.core.config import settings

# Get a specific feature flag
async def check_feature():
    enabled = await settings.get_feature_flag("ai_risk_assessment", default=False)
    return enabled

# In your route handler
@app.get("/features/risk-assessment")
async def risk_assessment_status():
    enabled = await settings.get_feature_flag("ai_risk_assessment")
    return {"enabled": enabled}
```

### 2. Getting AI Model Configuration

```python
# Get configuration for a specific AI model
async def get_ai_config():
    gemini_config = await settings.get_ai_model_config("gemini")
    return gemini_config

# Example response:
{
  "model": "gemini-1.5-flash",
  "max_tokens": 8192,
  "temperature": 0.7,
  "safety_settings": {...}
}
```

### 3. Getting Database Configuration

```python
async def setup_database():
    db_config = await settings.get_database_config()
    # Use the configuration...
```

## API Endpoints

The configuration API provides the following endpoints:

### GET `/api/v1/config/status`
Returns the status of all configuration sources.

### POST `/api/v1/config/refresh`
Refreshes configuration from remote sources (admin only).

### GET `/api/v1/config/feature-flags`
Returns all feature flags.

### GET `/api/v1/config/feature-flags/{flag_name}`
Returns a specific feature flag value.

### GET `/api/v1/config/ai-models`
Returns AI models configuration.

### GET `/api/v1/config/ai-models/{model_name}`
Returns configuration for a specific AI model.

## Fallback Strategy

The system implements a robust fallback strategy:

1. **Remote Source**: Try to fetch from the configured remote URL
2. **Local Cache**: Use cached data if available and not expired
3. **Fallback File**: Use local JSON files in the `config/` directory
4. **Environment Variables**: Fall back to environment variables
5. **Defaults**: Use hardcoded defaults as last resort

## Local Development

For local development without a remote configuration server:

1. Use the provided fallback files in `config/`:
   - `config/main.json`
   - `config/feature_flags.json`
   - `config/ai_models.json`

2. Don't set the remote URL environment variables

3. The system will automatically use local files

## Monitoring and Debugging

### Check Configuration Status
```bash
curl http://localhost:8000/api/v1/config/status
```

### Refresh Configuration
```bash
curl -X POST http://localhost:8000/api/v1/config/refresh \
  -H "Authorization: Bearer your-token"
```

### View Logs
The system logs all configuration activities:
```
INFO:app.core.config:Added config source: main
INFO:app.core.config:Fetching config from main: https://config-server.com/api/config/main
INFO:app.core.config:Successfully fetched config from main
```

## Production Deployment

### 1. Configuration Server Setup
Set up a reliable configuration server with:
- High availability
- Authentication
- Version control
- Audit logging

### 2. Security Considerations
- Use HTTPS for configuration URLs
- Implement proper authentication
- Rotate tokens regularly
- Validate configuration before applying

### 3. Monitoring
- Monitor configuration fetch failures
- Set up alerts for fallback usage
- Track configuration change impacts

## Example Configuration Server

Here's a simple example of a configuration server using FastAPI:

```python
from fastapi import FastAPI
from fastapi.security import HTTPBearer

app = FastAPI()
security = HTTPBearer()

configs = {
    "main": {
        "database": {"timeout": 30, "pool_size": 10},
        "cors": {"allowed_origins": ["https://app.example.com"]},
        "rate_limits": {"requests_per_minute": 100}
    },
    "feature_flags": {
        "ai_risk_assessment": True,
        "real_time_notifications": True,
        "beta_ui_components": False
    },
    "ai_models": {
        "gemini": {
            "model": "gemini-1.5-flash",
            "max_tokens": 8192,
            "temperature": 0.7
        }
    }
}

@app.get("/api/config/{config_name}")
async def get_config(config_name: str, token: str = Depends(security)):
    # Validate token here
    return configs.get(config_name, {})
```

## Troubleshooting

### Common Issues

1. **Configuration not updating**: Check network connectivity and authentication
2. **Fallback files not found**: Ensure files exist in the `config/` directory
3. **Authentication failures**: Verify tokens and permissions
4. **Performance issues**: Adjust refresh intervals

### Debug Commands

```bash
# Check configuration status
curl http://localhost:8000/api/v1/config/status

# Force refresh all configs
curl -X POST http://localhost:8000/api/v1/config/refresh

# Check specific feature flag
curl http://localhost:8000/api/v1/config/feature-flags/ai_risk_assessment
```

## Best Practices

1. **Gradual Rollouts**: Use feature flags for gradual feature rollouts
2. **Configuration Validation**: Validate configuration before applying
3. **Monitoring**: Monitor configuration changes and their impacts
4. **Documentation**: Document all configuration options
5. **Testing**: Test configuration changes in staging first
6. **Backup**: Keep backup configurations for quick rollback
