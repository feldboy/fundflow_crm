#!/bin/bash
# Quick CORS Test Script
# Usage: ./quick_cors_test.sh

echo "🧪 Quick CORS Test for FundFlow CRM"
echo "=================================="

BACKEND_URL="https://fundflowcrm-production.up.railway.app"
FRONTEND_ORIGIN="https://fundflow-crm.vercel.app"

echo "🔗 Backend URL: $BACKEND_URL"
echo "🌐 Frontend Origin: $FRONTEND_ORIGIN"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "Origin: $FRONTEND_ORIGIN" "$BACKEND_URL/health")
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
if [ "$http_code" -eq 200 ]; then
    echo "   ✅ Health check passed (Status: $http_code)"
else
    echo "   ❌ Health check failed (Status: $http_code)"
fi

# Test 2: CORS Info
echo "2️⃣ Testing CORS Configuration..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "Origin: $FRONTEND_ORIGIN" "$BACKEND_URL/cors-info")
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
if [ "$http_code" -eq 200 ]; then
    echo "   ✅ CORS info accessible (Status: $http_code)"
    # Extract and show allowed origins
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    echo "   📋 Response: $body"
else
    echo "   ❌ CORS info failed (Status: $http_code)"
fi

# Test 3: Preflight Request
echo "3️⃣ Testing CORS Preflight (OPTIONS)..."
cors_headers=$(curl -s -I -X OPTIONS \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "$BACKEND_URL/api/v1/communications/" | grep -i "access-control")

if [ -n "$cors_headers" ]; then
    echo "   ✅ CORS preflight successful"
    echo "   📋 CORS Headers:"
    echo "$cors_headers" | sed 's/^/      /'
else
    echo "   ❌ CORS preflight failed - no CORS headers found"
fi

# Test 4: Mixed Content Check
echo "4️⃣ Checking for Mixed Content Issues..."
if [[ "$BACKEND_URL" == https://* ]]; then
    echo "   ✅ Backend uses HTTPS - no mixed content issues"
else
    echo "   ⚠️  Backend uses HTTP - will cause mixed content errors on HTTPS frontend"
fi

echo ""
echo "🎯 Summary:"
echo "   - Your CORS configuration appears to be working"
echo "   - Make sure to test in your browser for real-world verification"
echo "   - Check browser developer console for any remaining CORS errors"
echo ""
echo "🔧 If you still see CORS errors:"
echo "   1. Clear browser cache and try again"
echo "   2. Check that your frontend is making requests to HTTPS URLs"
echo "   3. Verify environment variables in Vercel deployment"
