# Vercel Environment Variables Setup

## If the automatic deployment doesn't work, manually set these in Vercel:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_API_BASE_URL` | `https://fundflowcrm-production.up.railway.app` | Production, Preview, Development |
| `VITE_API_VERSION` | `v1` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### Steps:
1. Click "Add New" for each variable
2. Enter the variable name and value exactly as shown
3. Select all environments (Production, Preview, Development)
4. Click "Save"
5. Redeploy your project

### After setting variables:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete
5. Check your site again

This should resolve the mixed content error by ensuring the frontend uses HTTPS URLs for API calls.
