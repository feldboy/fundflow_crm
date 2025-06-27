# Deployment Guide

## 🚀 Deployment Stack
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

## 📋 Step-by-Step Deployment

### 1. MongoDB Atlas Setup
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create account and new cluster (M0 free tier)
3. Create database user: Database Access → Add New Database User
4. Whitelist IPs: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Get connection string: Clusters → Connect → Connect your application
6. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 2. Backend Deployment (Railway)
1. Go to [railway.app](https://railway.app) and sign up
2. Create new project → Deploy from GitHub repo
3. Select your repository and choose the `backend` folder
4. Set environment variables in Railway dashboard:
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/fundflow_crm?retryWrites=true&w=majority
   DATABASE_NAME=fundflow_crm
   SECRET_KEY=your-super-secret-key-here-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ENVIRONMENT=production
   DEBUG=false
   ```
5. Deploy and copy the Railway URL (e.g., `https://your-app.railway.app`)

### 3. Frontend Deployment (Vercel)
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Set Root Directory to `fundflow_crm` (if needed)
4. Set environment variables in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-railway-backend.railway.app
   VITE_ENVIRONMENT=production
   ```
5. Deploy and get your Vercel URL

### 4. Update CORS Settings
1. Go back to Railway
2. Update `ALLOWED_ORIGINS` environment variable with your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com
   ```
3. Redeploy backend

### 5. Custom Domain (Optional)
1. Buy domain from Namecheap, Google Domains, etc.
2. In Vercel: Settings → Domains → Add your domain
3. Update DNS records as instructed by Vercel
4. SSL certificate will be automatically provisioned

## 🔧 Important Notes

### Security Checklist
- [ ] Generate strong SECRET_KEY (32+ characters)
- [ ] Use environment variables for all secrets
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB database user with minimal permissions
- [ ] Enable MongoDB IP whitelist

### Environment Variables to Set
**Railway (Backend):**
- MONGODB_URL
- DATABASE_NAME
- SECRET_KEY
- ALLOWED_ORIGINS
- All API keys (Google, Telegram, DocuSign, etc.)

**Vercel (Frontend):**
- VITE_API_BASE_URL
- VITE_ENVIRONMENT

### Testing Deployment
1. Visit your Vercel URL
2. Check that frontend loads
3. Test API calls (check browser console for errors)
4. Verify database connectivity
5. Test authentication flow

## 🚨 Troubleshooting

**Common Issues:**
- CORS errors: Check ALLOWED_ORIGINS in Railway
- API not found: Verify VITE_API_BASE_URL in Vercel
- Database connection: Check MongoDB connection string and IP whitelist
- Build failures: Check build logs in respective platforms

**Health Check Endpoints:**
- Backend health: `https://your-railway-app.railway.app/health`
- Frontend: Your Vercel URL should load the React app

## 💰 Cost Estimation
- MongoDB Atlas M0: Free (512MB)
- Railway: $5/month (after $5 trial credit)
- Vercel: Free for personal projects
- **Total: ~$5/month**

## 🔄 Continuous Deployment
Both platforms automatically deploy when you push to your main branch on GitHub.

## 📞 Support
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
