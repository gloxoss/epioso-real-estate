# 🚀 Vercel Deployment Guide for Epiosio

## 📋 **Prerequisites**

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Vercel account (free tier available)
- ✅ Your project code pushed to GitHub
- ✅ Database setup (Supabase recommended)

---

## 🔧 **Step 1: Prepare Your Repository**

### **1.1 Push to GitHub**
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "feat: Add Epiosio landing page and complete application"

# Add your GitHub repository as origin
git remote add origin https://github.com/yourusername/epioso-real-estate.git

# Push to GitHub
git push -u origin main
```

### **1.2 Verify Build Locally**
```bash
# Test production build
pnpm build

# Test production server
pnpm start
```

---

## 🌐 **Step 2: Deploy to Vercel**

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository `epioso-real-estate`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `pnpm install` (auto-detected)

4. **Environment Variables**
   - Click "Environment Variables"
   - Add the following variables:

   ```env
   # Essential Variables
   NEXTAUTH_URL=https://your-project-name.vercel.app
   NEXTAUTH_SECRET=your-generated-secret-here
   DATABASE_URL=your-database-connection-string
   
   # Supabase (if using)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
   NEXT_PUBLIC_APP_NAME=Epiosio
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)

### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: epioso-real-estate
# - Directory: ./
# - Override settings? N

# Deploy to production
vercel --prod
```

---

## 🔐 **Step 3: Environment Variables Setup**

### **3.1 Generate NextAuth Secret**
```bash
# Generate a secure secret
openssl rand -base64 32
```

### **3.2 Database Setup (Supabase)**

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down your URL and anon key

2. **Run Database Migrations**
   ```bash
   # Set your DATABASE_URL in Vercel dashboard first
   # Then run migrations via Vercel CLI or GitHub Actions
   ```

### **3.3 Required Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your Vercel app URL | ✅ Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | ✅ Yes |
| `DATABASE_URL` | Database connection string | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Your app URL | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚠️ Optional |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | ⚠️ Optional |

---

## 🌍 **Step 4: Custom Domain (Optional)**

### **4.1 Add Custom Domain**
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `epiosio.com`)
4. Follow DNS configuration instructions

### **4.2 Update Environment Variables**
```env
NEXTAUTH_URL=https://epiosio.com
NEXT_PUBLIC_APP_URL=https://epiosio.com
```

---

## 🔄 **Step 5: Automatic Deployments**

### **5.1 Branch Configuration**
- **Production**: `main` branch → `your-app.vercel.app`
- **Preview**: Other branches → `branch-name.your-app.vercel.app`

### **5.2 Deploy Hooks**
```bash
# Every push to main triggers automatic deployment
git push origin main
```

---

## 📊 **Step 6: Monitoring & Analytics**

### **6.1 Vercel Analytics**
1. Go to project dashboard
2. Enable "Analytics" tab
3. Monitor page views, performance, etc.

### **6.2 Error Monitoring**
- Check "Functions" tab for API errors
- Monitor build logs in "Deployments"

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **Build Failures**
```bash
# Check build logs in Vercel dashboard
# Common fixes:
# 1. Ensure all dependencies are in package.json
# 2. Check TypeScript errors
# 3. Verify environment variables
```

#### **Database Connection Issues**
```bash
# Verify DATABASE_URL format
# For Supabase: postgresql://[user]:[password]@[host]:[port]/[database]
```

#### **NextAuth Issues**
```bash
# Ensure NEXTAUTH_URL matches your domain
# Verify NEXTAUTH_SECRET is set
# Check callback URLs in OAuth providers
```

#### **Static File Issues**
```bash
# Ensure images are in public/ directory
# Use next/image for optimized images
# Check file paths are correct
```

---

## ✅ **Step 7: Post-Deployment Checklist**

### **7.1 Test All Features**
- [ ] Landing page loads correctly
- [ ] Language switching works (EN/FR/AR)
- [ ] Authentication flow works
- [ ] Dashboard loads after login
- [ ] All API endpoints respond
- [ ] Database connections work
- [ ] Mobile responsiveness

### **7.2 SEO & Performance**
- [ ] Meta tags are correct
- [ ] Open Graph images work
- [ ] Page load speed is good
- [ ] Lighthouse score > 90

### **7.3 Security**
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] No sensitive data in client-side code
- [ ] CORS is properly configured

---

## 🎯 **Expected Results**

After successful deployment, you'll have:

✅ **Live Application**: `https://your-project.vercel.app`
✅ **Landing Pages**:
   - English: `/en`
   - French: `/fr`
   - Arabic: `/ar`
✅ **Dashboard**: `/en/dashboard` (after login)
✅ **API Endpoints**: All working
✅ **Automatic Deployments**: On every push
✅ **SSL Certificate**: Automatic HTTPS
✅ **Global CDN**: Fast worldwide access

---

## 🚀 **Quick Deploy Commands**

```bash
# One-time setup
git add .
git commit -m "feat: Ready for Vercel deployment"
git push origin main

# Then go to vercel.com and import your GitHub repo
```

---

## 📞 **Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally first
4. Check Vercel documentation
5. Contact Vercel support if needed

**Your Epiosio application is now ready for production deployment! 🎉**
