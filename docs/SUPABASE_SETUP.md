# 🚀 Supabase Setup Guide for Real Estate Management App

This guide will help you set up your own Supabase instance for the real estate management application, both for local development and production deployment.

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Production Supabase Setup](#production-supabase-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Database Schema Setup](#database-schema-setup)
5. [Storage Bucket Configuration](#storage-bucket-configuration)
6. [Authentication Setup](#authentication-setup)
7. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Supabase CLI installed

### 1. Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using yarn
yarn global add supabase

# Using homebrew (macOS)
brew install supabase/tap/supabase

# Using scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Initialize Supabase in Your Project

```bash
# Navigate to your project directory
cd your-real-estate-app

# Initialize Supabase
supabase init

# Start local Supabase services
supabase start
```

### 3. Local Supabase Services

When you run `supabase start`, you'll get output similar to this:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

### 4. Update Your .env.local File

Copy the credentials from the Supabase start output to your `.env.local` file:

```env
# Database - Use your Supabase local database
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# NextAuth - Generate a secret
NEXTAUTH_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Supabase - From your local setup
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
SUPABASE_BUCKET="documents"
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Optional: Stripe (leave empty for now, can add later)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Optional: Google OAuth (leave empty for now, can add later)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 🌐 Production Supabase Setup

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"

### 2. Create a New Project

1. **Organization**: Select or create an organization
2. **Project Name**: `real-estate-management` (or your preferred name)
3. **Database Password**: Generate a strong password (save it securely!)
4. **Region**: Choose the region closest to your users
5. **Pricing Plan**: Start with the free tier

### 3. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (for `SUPABASE_URL`)
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (for `SUPABASE_SERVICE_ROLE_KEY`)

### 4. Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (for `DATABASE_URL`)
5. Replace `[YOUR-PASSWORD]` with your actual database password

---

## ⚙️ Environment Variables Configuration

### Local Development (.env.local)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Local
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_SERVICE_ROLE_KEY="your-local-service-role-key"
SUPABASE_BUCKET="documents"
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-local-anon-key"
```

### Production (.env.production)

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Supabase Production
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"
SUPABASE_BUCKET="documents"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-production-anon-key"
```

---

## 🗄️ Database Schema Setup

### 1. Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations (if you have migration files)
npx prisma migrate deploy
```

### 2. Seed the Database (Optional)

```bash
# Run the seed script
npx prisma db seed
```

### 3. View Database in Prisma Studio

```bash
# Open Prisma Studio
npx prisma studio
```

---

## 📁 Storage Bucket Configuration

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage**
2. Click **Create a new bucket**
3. **Name**: `documents`
4. **Public bucket**: ✅ (checked)
5. Click **Create bucket**

### 2. Set Up Storage Policies

Go to **Storage** → **Policies** and create these policies:

#### Allow authenticated users to upload documents:
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');
```

#### Allow authenticated users to view documents:
```sql
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents');
```

#### Allow authenticated users to delete their documents:
```sql
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents');
```

---

## 🔐 Authentication Setup

### 1. Configure Auth Settings

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. **Site URL**: Set to your domain (e.g., `https://your-domain.com`)
3. **Redirect URLs**: Add your callback URLs:
   - `http://localhost:3000/api/auth/callback/supabase` (local)
   - `https://your-domain.com/api/auth/callback/supabase` (production)

### 2. Enable Auth Providers (Optional)

If you want to enable Google OAuth:

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials
4. Update your `.env.local` with Google credentials

---

## 🔧 Useful Commands

### Supabase CLI Commands

```bash
# Start local development
supabase start

# Stop local development
supabase stop

# Reset local database
supabase db reset

# Generate types from your database
supabase gen types typescript --local > types/supabase.ts

# Link to remote project
supabase link --project-ref your-project-ref

# Push local changes to remote
supabase db push

# Pull remote changes to local
supabase db pull
```

### Database Commands

```bash
# Reset and seed database
npx prisma migrate reset

# View database
npx prisma studio

# Generate Prisma client
npx prisma generate
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "Connection refused" errors
- Make sure Docker is running
- Run `supabase stop` then `supabase start`
- Check if ports 54321-54324 are available

#### 2. "Database does not exist" errors
- Run `npx prisma db push` to create the schema
- Check your DATABASE_URL is correct

#### 3. "Invalid JWT" errors
- Make sure your JWT secret matches between Supabase and NextAuth
- Regenerate your NEXTAUTH_SECRET if needed

#### 4. Storage upload errors
- Check your storage policies are set correctly
- Verify the bucket name matches your SUPABASE_BUCKET env var

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **NextAuth Docs**: [next-auth.js.org](https://next-auth.js.org)

---

## 🎯 Next Steps

1. ✅ Set up local Supabase instance
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Create storage bucket and policies
5. ⏳ Set up production Supabase project
6. ⏳ Deploy to Vercel/Netlify
7. ⏳ Configure custom domain
8. ⏳ Set up monitoring and backups

---

**Your local development environment is now ready! 🎉**
