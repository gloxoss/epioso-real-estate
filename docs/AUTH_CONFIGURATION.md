# Authentication Configuration Guide

This application supports two authentication providers that can be switched via environment variables:

1. **Supabase Auth** - Simple, hosted authentication
2. **NextAuth.js** - Flexible authentication with third-party OAuth providers

## Quick Switch

Change the `NEXT_PUBLIC_AUTH_PROVIDER` in your `.env.local` file:

```bash
# Use Supabase Auth (default)
NEXT_PUBLIC_AUTH_PROVIDER=supabase

# Use NextAuth.js with OAuth providers
NEXT_PUBLIC_AUTH_PROVIDER=nextauth
```

---

## Option 1: Supabase Authentication

### Prerequisites
- Supabase project created
- Database tables already set up

### Configuration Steps

1. **Environment Variables**
   Add to `.env.local`:
   ```bash
   AUTH_PROVIDER=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Get Supabase Credentials**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the Project URL and anon/public key

3. **Email Settings (Optional)**
   - Go to Authentication → Settings
   - Configure email templates
   - Set up SMTP (or use Supabase's default)

4. **Test the Setup**
   ```bash
   pnpm dev
   ```
   - Visit `http://localhost:3000/login`
   - You should see "Using: Supabase Auth"
   - Try signing up and logging in

### Features Available
- ✅ Email/Password authentication
- ✅ Email confirmation
- ✅ Password reset
- ✅ User metadata
- ❌ Third-party OAuth (use NextAuth for this)

### Supabase Auth Policies
Your RLS policies should allow authenticated users to access their data:
```sql
-- Example policy for organization_members
CREATE POLICY "Users can access their memberships" ON organization_members
  FOR ALL USING (user_id = auth.uid());
```

---

## Option 2: NextAuth.js with OAuth Providers

### Prerequisites
- Database with NextAuth tables (created via Prisma migration)
- OAuth app credentials from providers

### Configuration Steps

1. **Install Dependencies**
   ```bash
   pnpm add next-auth @auth/prisma-adapter bcryptjs
   pnpm add -D @types/bcryptjs
   ```

2. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name add-nextauth
   ```

3. **Environment Variables**
   Add to `.env.local`:
   ```bash
   AUTH_PROVIDER=nextauth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```

4. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Use the output as your `NEXTAUTH_SECRET`

### Setting Up OAuth Providers

#### Google OAuth Setup

1. **Create Google OAuth App**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID

2. **Configure OAuth App**
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`

3. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

#### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"

2. **Configure OAuth App**
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Get Credentials**
   - Copy Client ID and generate Client Secret
   - Add to `.env.local` as `GITHUB_ID` and `GITHUB_SECRET`

### Test the Setup
```bash
pnpm dev
```
- Visit `http://localhost:3000/login`
- You should see "Using: NextAuth.js"
- OAuth buttons should appear for configured providers

### Features Available
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Easy to add more providers
- ✅ Database-agnostic
- ✅ JWT sessions

---

## Adding More OAuth Providers

### Facebook
```bash
# Environment
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

Add to `lib/nextauth-config.ts`:
```typescript
import FacebookProvider from "next-auth/providers/facebook"

// Add to providers array:
FacebookProvider({
  clientId: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
}),
```

### Twitter/X
```bash
# Environment
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

### Discord
```bash
# Environment
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

---

## Production Deployment

### Environment Variables for Production
```bash
# Required for both providers
AUTH_PROVIDER=supabase  # or nextauth
DATABASE_URL=your-production-database-url

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# NextAuth (if using)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-production-google-id
GOOGLE_CLIENT_SECRET=your-production-google-secret
```

### OAuth Redirect URLs for Production
Update your OAuth apps with production URLs:
- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

---

## Troubleshooting

### Common Issues

1. **"Invalid URL" Error**
   - Check `NEXT_PUBLIC_SUPABASE_URL` format
   - Ensure no trailing slash

2. **OAuth "Redirect URI Mismatch"**
   - Verify callback URLs in OAuth provider settings
   - Check `NEXTAUTH_URL` matches your domain

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Run `npx prisma db push` to sync schema

4. **NextAuth Session Issues**
   - Ensure `NEXTAUTH_SECRET` is set
   - Clear browser cookies and try again

### Switching Between Providers

1. Change `AUTH_PROVIDER` in `.env.local`
2. Restart your development server
3. Clear browser cookies
4. Test login flow

---

## Migration Guide

### From Supabase to NextAuth
1. Export user data from Supabase
2. Set `AUTH_PROVIDER=nextauth`
3. Run NextAuth migration
4. Import users via registration API
5. Update OAuth redirect URLs

### From NextAuth to Supabase
1. Export user data from your database
2. Set `AUTH_PROVIDER=supabase`
3. Import users to Supabase auth
4. Update any custom user fields

---

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to version control
   - Use different secrets for development/production
   - Rotate secrets regularly

2. **OAuth Configuration**
   - Use HTTPS in production
   - Restrict OAuth redirect URLs
   - Monitor OAuth app usage

3. **Database Security**
   - Use connection pooling
   - Enable SSL for database connections
   - Implement proper RLS policies (Supabase)

---

## Support

For issues with specific providers:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **NextAuth.js**: [NextAuth.js Documentation](https://next-auth.js.org)
- **OAuth Providers**: Check respective provider documentation

## Quick Reference Commands

### Setup Commands
```bash
# Install NextAuth dependencies
pnpm add next-auth @auth/prisma-adapter bcryptjs @types/bcryptjs

# Run database migration for NextAuth
npx prisma migrate dev --name add-nextauth

# Generate Prisma client
npx prisma generate

# Start development server
pnpm dev
```

### Environment Template
```bash
# Copy this template to your .env.local file

# ===== AUTH PROVIDER SWITCHER =====
AUTH_PROVIDER=supabase  # Change to 'nextauth' to switch

# ===== SUPABASE AUTH (if AUTH_PROVIDER=supabase) =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ===== NEXTAUTH (if AUTH_PROVIDER=nextauth) =====
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# ===== DATABASE (required for both) =====
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Testing Checklist

#### Supabase Auth Testing
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign out
- [ ] Email confirmation works (if enabled)
- [ ] Password reset works (if enabled)
- [ ] User can access dashboard after login

#### NextAuth Testing
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google (if configured)
- [ ] Can sign in with GitHub (if configured)
- [ ] Can sign out
- [ ] User can access dashboard after login
- [ ] OAuth providers redirect correctly

### File Structure
```
your-app/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts    # NextAuth API routes
│   │   └── register/route.ts         # Registration API
│   └── (auth)/login/
│       ├── page.tsx                  # Login page
│       ├── auth-form.tsx            # Auth form component
│       └── actions.ts               # Auth actions
├── lib/
│   ├── auth.ts                      # Unified auth interface
│   ├── auth-config.ts               # Auth provider config
│   ├── nextauth-config.ts           # NextAuth configuration
│   └── prisma.ts                    # Prisma client
├── prisma/
│   └── schema.prisma                # Database schema
└── docs/
    └── AUTH_CONFIGURATION.md        # This file
```
