# 🚀 Complete Cloud Deployment Guide

This guide will help you deploy the Institute Management System for **FREE** using:
- **MongoDB Atlas** - Free cloud database (512MB)
- **Render** - Free backend hosting
- **Vercel** - Free frontend hosting

---

## 📋 Prerequisites

1. GitHub account (to push your code)
2. MongoDB Atlas account (free)
3. Render account (free)
4. Vercel account (free)

---

## Step 1: MongoDB Atlas Setup (Free Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** and sign up
3. Choose the **FREE** tier (M0 Sandbox)

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Select **FREE** (Shared) option
3. Choose a cloud provider (AWS recommended)
4. Select a region close to your users
5. Cluster name: `institute-management-cluster`
6. Click **"Create Cluster"** (takes 1-3 minutes)

### 1.3 Configure Database Access
1. Go to **"Database Access"** in sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `admin` (or your choice)
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for cloud hosting services
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string, it looks like:
   ```
   mongodb+srv://admin:<password>@institute-management-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name after `.net/`:
   ```
   mongodb+srv://admin:yourpassword@cluster.xxxxx.mongodb.net/institute-management?retryWrites=true&w=majority
   ```

---

## Step 2: Prepare Your Code for Deployment

### 2.1 Push Code to GitHub
If not already on GitHub:
```bash
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/institute-management.git
git push -u origin main
```

---

## Step 3: Deploy Backend on Render (Free)

### 3.1 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with your GitHub account

### 3.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the `institute-management` repo

### 3.3 Configure the Service
Fill in the following:
- **Name**: `institute-management-api`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free**

### 3.4 Set Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (use a password generator) |
| `NODE_ENV` | `production` |

Example JWT_SECRET: `k8s9d7f6g5h4j3k2l1m0n9b8v7c6x5z4a3s2d1f0g9h8j7`

### 3.5 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes first time)
3. Copy your backend URL: `https://institute-management-api.onrender.com`

> ⚠️ **Note**: Free tier spins down after 15 mins of inactivity. First request after idle may take 30-60 seconds.

---

## Step 4: Deploy Frontend on Vercel (Free)

### 4.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with your GitHub account

### 4.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select `institute-management`

### 4.3 Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4.4 Set Environment Variable
Add environment variable:
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://institute-management-api.onrender.com/api` |

(Replace with your actual Render backend URL)

### 4.5 Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Your frontend URL: `https://institute-management.vercel.app`

---

## Step 5: Update Backend CORS (Important!)

After deploying frontend, you need to update the backend to allow requests from your Vercel domain.

The `server.js` has already been updated to handle this via the `FRONTEND_URL` environment variable.

Go back to Render → Your backend service → Environment Variables → Add:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://institute-management.vercel.app` |

(Replace with your actual Vercel frontend URL)

Then click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎉 Done! Your App is Live!

Your application is now accessible from anywhere at:
- **Frontend**: `https://institute-management.vercel.app` (your Vercel URL)
- **Backend API**: `https://institute-management-api.onrender.com` (your Render URL)

---

## 📝 Important Notes

### Free Tier Limitations

**MongoDB Atlas Free Tier (M0)**:
- 512 MB storage
- Shared RAM
- Perfect for small to medium usage

**Render Free Tier**:
- 750 hours/month
- Spins down after 15 min inactivity
- First request after idle takes 30-60 seconds
- Good for development/small projects

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Great performance

### Upgrading Later
When you need more resources:
- MongoDB Atlas: $57/month for M10 cluster
- Render: $7/month for always-on instance
- Vercel: $20/month for Pro tier

---

## 🔧 Troubleshooting

### Backend not connecting to MongoDB
- Check if MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify MONGO_URI has correct password and database name
- Check Render logs for error messages

### Frontend not connecting to Backend
- Verify VITE_API_URL is set correctly in Vercel
- Check CORS settings in backend
- Make sure FRONTEND_URL env variable is set in Render

### Slow first load on Render
- This is normal for free tier (cold start)
- Consider upgrading to paid tier ($7/month) for always-on

### File uploads not working
- Render's free tier has ephemeral storage
- For production, use cloud storage like:
  - Cloudinary (free tier: 25GB)
  - AWS S3
  - Firebase Storage

---

## 🔐 Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Never commit .env files to GitHub
- [ ] Use HTTPS (automatic on Vercel/Render)
- [ ] Keep MongoDB password secure
- [ ] Consider adding rate limiting for production

---

## 📂 Environment Variables Summary

### Backend (Render)
```
MONGO_URI=mongodb+srv://admin:password@cluster.mongodb.net/institute-management?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🔄 Continuous Deployment

Both Render and Vercel automatically deploy when you push to GitHub:
1. Make changes locally
2. `git add .`
3. `git commit -m "Your changes"`
4. `git push`
5. Both frontend and backend redeploy automatically!

---

## Alternative Free Hosting Options

### Backend Alternatives:
- **Railway** - 500 hours/month free
- **Cyclic** - Always-on free tier
- **Fly.io** - 3 shared VMs free

### Frontend Alternatives:
- **Netlify** - Similar to Vercel
- **GitHub Pages** - Static hosting
- **Cloudflare Pages** - Great performance

---

Need help? Check the logs in Render/Vercel dashboards for error messages.
