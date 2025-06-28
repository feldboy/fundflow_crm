#!/usr/bin/env python3
"""
Test script for remote configuration system
"""

import asyncio
import os
import sys
sys.path.append('.')

from app.core.config import settings

async def test_config_system():
    """Test the configuration system"""
    print("🧪 Testing Remote Configuration System")
    print("=" * 50)
    
    # Test 1: Initialize remote config
    print("\n1. Initializing remote configuration...")
    try:
        await settings.initialize_remote_config()
        print("✅ Remote configuration initialized successfully")
    except Exception as e:
        print(f"⚠️  Remote config initialization failed (expected if no remote URLs): {e}")
    
    # Test 2: Test feature flags
    print("\n2. Testing feature flags...")
    try:
        ai_risk_flag = await settings.get_feature_flag("ai_risk_assessment", default=False)
        real_time_flag = await settings.get_feature_flag("real_time_notifications", default=False)
        print(f"✅ AI Risk Assessment: {ai_risk_flag}")
        print(f"✅ Real-time Notifications: {real_time_flag}")
    except Exception as e:
        print(f"❌ Feature flags test failed: {e}")
    
    # Test 3: Test AI model config
    print("\n3. Testing AI model configuration...")
    try:
        gemini_config = await settings.get_ai_model_config("gemini")
        if gemini_config:
            print(f"✅ Gemini model: {gemini_config.get('model', 'N/A')}")
            print(f"✅ Max tokens: {gemini_config.get('max_tokens', 'N/A')}")
            print(f"✅ Temperature: {gemini_config.get('temperature', 'N/A')}")
        else:
            print("⚠️  No Gemini configuration found")
    except Exception as e:
        print(f"❌ AI model config test failed: {e}")
    
    # Test 4: Test database config
    print("\n4. Testing database configuration...")
    try:
        db_config = await settings.get_database_config()
        print(f"✅ Database name: {db_config.get('name', 'N/A')}")
        print(f"✅ Timeout: {db_config.get('timeout', 'N/A')}")
        print(f"✅ Pool size: {db_config.get('pool_size', 'N/A')}")
    except Exception as e:
        print(f"❌ Database config test failed: {e}")
    
    # Test 5: Test CORS origins
    print("\n5. Testing CORS configuration...")
    try:
        cors_origins = await settings.get_cors_origins()
        print(f"✅ CORS origins: {cors_origins}")
    except Exception as e:
        print(f"❌ CORS config test failed: {e}")
    
    # Test 6: Test rate limits
    print("\n6. Testing rate limits configuration...")
    try:
        rate_limits = await settings.get_rate_limits()
        print(f"✅ Rate limits: {rate_limits}")
    except Exception as e:
        print(f"❌ Rate limits test failed: {e}")
    
    # Test 7: Show config sources status
    print("\n7. Configuration sources status...")
    sources = settings.remote_config.sources
    if sources:
        for name, source in sources.items():
            cached = settings.remote_config.get_cached_config(name)
            print(f"✅ Source '{name}': {'Has cached data' if cached else 'No cached data'}")
    else:
        print("⚠️  No remote configuration sources configured")
    
    print("\n" + "=" * 50)
    print("🎉 Configuration system test completed!")

if __name__ == "__main__":
    print("Testing configuration system...")
    print("Make sure you're in the backend directory")
    print()
    
    # Show environment info
    print("Environment variables:")
    config_vars = [
        "REMOTE_CONFIG_URL", "FEATURE_FLAGS_URL", "AI_CONFIG_URL",
        "MONGODB_URL", "DATABASE_NAME", "GOOGLE_API_KEY"
    ]
    
    for var in config_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if "key" in var.lower() or "token" in var.lower() or "url" in var.lower():
                masked_value = value[:8] + "..." if len(value) > 8 else "***"
                print(f"  {var}: {masked_value}")
            else:
                print(f"  {var}: {value}")
        else:
            print(f"  {var}: (not set)")
    
    print()
    
    # Run the test
    asyncio.run(test_config_system())
