#!/usr/bin/env python3
"""
CORS Testing Script for FundFlow CRM
Tests CORS configuration for both local and production environments
"""

import requests
from typing import Dict, Any

# Test configurations
TEST_ORIGINS = [
    "https://fundflow-crm.vercel.app",
    "https://fundflow-f48671lhy-yarons-projects-601a79ac.vercel.app", 
    "http://localhost:3000",
    "http://localhost:4028",
    "https://example.com",  # Should be blocked
]

BACKEND_URLS = [
    "https://fundflowcrm-production.up.railway.app",
    "http://localhost:8000"  # For local testing
]

API_ENDPOINTS = [
    "/health",
    "/cors-info", 
    "/api/v1/communications/",
    "/api/v1/database/status"
]

class CORSChecker:
    def __init__(self):
        self.results = []
    
    def test_cors_origin(self, backend_url: str, origin: str, endpoint: str) -> Dict[str, Any]:
        """Test CORS for a specific origin and endpoint"""
        url = f"{backend_url}{endpoint}"
        headers = {
            'Origin': origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        try:
            # Test OPTIONS request (preflight)
            preflight_response = requests.options(url, headers=headers, timeout=10)
            preflight_headers = dict(preflight_response.headers)
            preflight_status = preflight_response.status_code
            
            # Test actual GET request
            actual_response = requests.get(url, headers={'Origin': origin}, timeout=10)
            actual_status = actual_response.status_code
            
            try:
                content = actual_response.json()
            except ValueError:
                content = actual_response.text
            
            return {
                "backend_url": backend_url,
                "origin": origin,
                "endpoint": endpoint,
                "preflight_status": preflight_status,
                "actual_status": actual_status,
                "cors_allowed_origin": preflight_headers.get('access-control-allow-origin'),
                "cors_allowed_methods": preflight_headers.get('access-control-allow-methods'),
                "cors_allowed_headers": preflight_headers.get('access-control-allow-headers'),
                "cors_credentials": preflight_headers.get('access-control-allow-credentials'),
                "success": actual_status < 400,
                "content_preview": str(content)[:100] if content else None
            }
            
        except requests.RequestException as e:
            return {
                "backend_url": backend_url,
                "origin": origin,
                "endpoint": endpoint,
                "error": str(e),
                "success": False
            }
    
    def run_tests(self):
        """Run all CORS tests"""
        print("🧪 Starting CORS Tests for FundFlow CRM\n")
        
        for backend_url in BACKEND_URLS:
            print(f"🔗 Testing backend: {backend_url}")
            
            # First, check if backend is reachable
            try:
                response = requests.get(f"{backend_url}/health", timeout=10)
                if response.status_code == 200:
                    print("✅ Backend is reachable")
                else:
                    print(f"⚠️ Backend returned status {response.status_code}")
            except requests.RequestException as e:
                print(f"❌ Backend unreachable: {e}")
                continue
            
            # Test CORS info endpoint
            try:
                response = requests.get(f"{backend_url}/cors-info", timeout=10)
                if response.status_code == 200:
                    cors_config = response.json()
                    print("📋 CORS Configuration:")
                    print(f"   Allowed Origins: {cors_config.get('allowed_origins', [])}")
                    print(f"   Environment: {cors_config.get('environment', 'unknown')}")
                else:
                    print(f"⚠️ Could not get CORS info (status {response.status_code})")
            except requests.RequestException as e:
                print(f"⚠️ CORS info error: {e}")
            
            print("\n🎯 Testing CORS for different origins:")
            
            for origin in TEST_ORIGINS:
                print(f"\n   Origin: {origin}")
                
                for endpoint in API_ENDPOINTS:
                    result = self.test_cors_origin(backend_url, origin, endpoint)
                    self.results.append(result)
                    
                    if result.get('success'):
                        cors_origin = result.get('cors_allowed_origin', 'Not set')
                        if cors_origin == origin or cors_origin == '*':
                            print(f"      ✅ {endpoint} - CORS allowed")
                        else:
                            print(f"      ⚠️ {endpoint} - Accessible but CORS header mismatch")
                    else:
                        if result.get('error'):
                            print(f"      ❌ {endpoint} - Error: {result['error']}")
                        else:
                            print(f"      ❌ {endpoint} - Failed (status {result.get('actual_status', 'unknown')})")
            
            print(f"\n{'='*60}")
    
    def generate_report(self):
        """Generate a detailed test report"""
        print("\n📊 CORS Test Report Summary")
        print("="*60)
        
        # Group results by origin
        by_origin = {}
        for result in self.results:
            origin = result['origin']
            if origin not in by_origin:
                by_origin[origin] = []
            by_origin[origin].append(result)
        
        for origin, tests in by_origin.items():
            successful_tests = [t for t in tests if t.get('success')]
            print(f"\n🌐 Origin: {origin}")
            print(f"   Success Rate: {len(successful_tests)}/{len(tests)} ({len(successful_tests)/len(tests)*100:.1f}%)")
            
            if successful_tests:
                sample = successful_tests[0]
                print("   CORS Headers:")
                print(f"     - Allowed Origin: {sample.get('cors_allowed_origin', 'Not set')}")
                print(f"     - Allowed Methods: {sample.get('cors_allowed_methods', 'Not set')}")
                print(f"     - Allow Credentials: {sample.get('cors_credentials', 'Not set')}")

def main():
    checker = CORSChecker()
    checker.run_tests()
    checker.generate_report()
    
    print("\n🎯 Recommendations:")
    print("   1. Ensure https://fundflow-crm.vercel.app is in ALLOWED_ORIGINS")
    print("   2. Check Railway logs for CORS-related errors")
    print("   3. Verify your frontend makes requests to HTTPS endpoints only")
    print("   4. Test in browser developer console for mixed content warnings")

if __name__ == "__main__":
    main()
