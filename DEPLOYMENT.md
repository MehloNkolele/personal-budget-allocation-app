# Deployment Guide for Personal Budget Allocation App

## 🚀 Quick Deployment (Recommended Method)

### Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. A GitHub account (for easiest deployment)

## 📋 Step-by-Step Deployment

### Method 1: GitHub + Vercel Integration (Easiest)

#### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `personal-budget-allocation-app`
3. Make it public (or private if you prefer)
4. Don't initialize with README, .gitignore, or license (we already have these)

#### Step 2: Push Your Code to GitHub
Your code is already committed locally. Now add the GitHub remote and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/personal-budget-allocation-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

#### Step 3: Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `personal-budget-allocation-app` repository
5. Vercel will automatically detect it's a Vite project
6. Click "Deploy"
7. Wait for deployment to complete (usually 1-2 minutes)

#### Step 4: Configure Firebase Domain
After deployment, add your Vercel domain to Firebase:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `personal-budget-planner-581d6`
3. Go to Authentication > Settings > Authorized domains
4. Add your new Vercel domain (e.g., `personal-budget-allocation-app.vercel.app`)

---

### Method 2: Direct Upload to Vercel (If CLI Issues)

#### Step 1: Create Deployment Package
1. Make sure your project is built: `npm run build`
2. Create a zip file of your entire project folder

#### Step 2: Upload to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Choose "Upload" tab
4. Drag and drop your zip file or select it
5. Configure project settings if needed
6. Click "Deploy"

---

### Method 3: Vercel CLI (If Certificate Issues Are Resolved)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy the Application
From your project root directory, run:
```bash
npm run deploy
```
or
```bash
vercel --prod
```

### 4. Configure Environment Variables (if needed)
If you're using the Gemini API or want to move Firebase config to environment variables:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:
   - `GEMINI_API_KEY`: Your Gemini API key (if using AI features)

### 5. Configure Firebase Authentication Domain
After deployment, you need to add your Vercel domain to Firebase:

1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project: `personal-budget-planner-581d6`
3. Go to Authentication > Settings > Authorized domains
4. Add your Vercel domain (e.g., `your-app-name.vercel.app`)

## Alternative Deployment Methods

### Method 1: Vercel Dashboard (Web Interface)
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a Vite project
5. Click "Deploy"

### Method 2: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub account to Vercel
3. Import the repository
4. Automatic deployments will be set up

## Build Configuration
The project is configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Node.js version: 18.x (default)

## Troubleshooting

### Common Issues:
1. **Build fails**: Make sure all dependencies are in package.json
2. **Routes not working**: The vercel.json file handles SPA routing
3. **Firebase auth issues**: Ensure your Vercel domain is added to Firebase authorized domains
4. **Environment variables**: Make sure they're set in Vercel dashboard

### Useful Commands:
- `vercel --prod`: Deploy to production
- `vercel`: Deploy to preview
- `vercel logs`: View deployment logs
- `vercel domains`: Manage custom domains

## Post-Deployment Checklist
- [ ] Test all authentication flows (login, register, Google sign-in)
- [ ] Verify all routes work correctly
- [ ] Test budget creation and management features
- [ ] Check responsive design on mobile devices
- [ ] Verify Firebase data isolation between users
- [ ] Test profile settings and data management

## Custom Domain (Optional)
To add a custom domain:
1. Go to your Vercel project dashboard
2. Go to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update Firebase authorized domains with your custom domain
