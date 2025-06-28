# HTTPS Configuration Fix

## Problem
The frontend deployed on Vercel (HTTPS) was trying to access the Railway backend using HTTP URLs, causing mixed content errors.

## Solution Applied

### 1. Updated Environment Variables
- **Local (.env)**: Set `VITE_API_BASE_URL=https://fundflowcrm-production.up.railway.app`
- **Vercel**: Added environment variables to `vercel.json`

### 2. Improved API Configuration
- Updated `src/services/api.js` with intelligent URL detection
- Added production fallback to HTTPS Railway URL
- Updated all hardcoded URL references

### 3. Fixed Environment Debug Component
- Updated `src/components/EnvDebug.jsx` to use the same URL logic

## Deployment Steps

### For Vercel (Frontend)
1. The `vercel.json` now includes environment variables
2. Alternatively, set in Vercel dashboard:
   - `VITE_API_BASE_URL` = `https://fundflowcrm-production.up.railway.app`
   - `VITE_API_VERSION` = `v1`

### For Railway (Backend)
- Railway automatically provides HTTPS endpoints
- Ensure your service is accessible at: `https://fundflowcrm-production.up.railway.app`

## Testing
After deployment, verify:
1. No mixed content errors in browser console
2. API calls are made to HTTPS endpoints
3. CORS is properly configured on the backend for the Vercel domain

## Key Files Modified
- `.env` - Updated API URL to use HTTPS
- `vercel.json` - Added environment variables
- `src/services/api.js` - Improved URL detection logic
- `src/components/EnvDebug.jsx` - Updated URL display logic
