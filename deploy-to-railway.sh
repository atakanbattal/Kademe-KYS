#!/bin/bash

# 🚄 Railway Deployment Script for KYS Backend
# Kalite Yönetim Sistemi - MongoDB + Express Backend

echo "🚄 Starting Railway Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Initialize project if not exists
if [ ! -f ".railway" ]; then
    echo "🆕 Initializing Railway project..."
    railway init
fi

echo "📋 Setting up environment variables..."

# Prompt for MongoDB Atlas connection string
read -p "Enter your MongoDB Atlas connection string: " MONGODB_URI
railway variables set MONGODB_URI="$MONGODB_URI"

# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_SECRET="$JWT_SECRET"

# Set Node environment
railway variables set NODE_ENV="production"

# Set default frontend URL (will be updated later)
railway variables set FRONTEND_URL="http://localhost:3000"

echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "📊 Check your deployment:"
echo "   railway status"
echo "   railway logs"
echo "   railway domain"

echo ""
echo "🔗 Next steps:"
echo "1. Get your Railway URL: railway domain"
echo "2. Update frontend API URL in src/frontend/kys-frontend/src/services/api.ts"
echo "3. Test your API: curl https://your-app.up.railway.app/health"

echo ""
echo "📖 Full documentation: RAILWAY_DEPLOYMENT_GUIDE.md"