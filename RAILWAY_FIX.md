# Railway Deployment Instructions

## Current Issue
Railway is confused by the project structure and looking in wrong directories.

## Solution: Deploy Backend Only

### Step 1: Create New Railway Project
1. Delete current Railway project
2. Go to railway.app
3. Create "New Project"
4. Choose "Empty Project"

### Step 2: Add GitHub Service
1. Click "Add Service"
2. Choose "GitHub Repo"
3. Select your repository: rocketcopy
4. Set Root Directory to: fundflow_crm/backend

### Step 3: Environment Variables
Add these in Railway Variables:

MONGODB_URL=mongodb+srv://fundflow_admin:C2chfxCDOFxX4zSD@cluster0.tjevll4.mongodb.net/fundflow_crm?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=fundflow_crm
SECRET_KEY=AVENny0q_cBXUfZ1RyfyOT3TsUgiJDdqzKPqzz9QFhs
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4028
ENVIRONMENT=production
DEBUG=false

### Alternative: Simple Fix
Try setting Root Directory to just: fundflow_crm/backend
(Remove any extra path components)
