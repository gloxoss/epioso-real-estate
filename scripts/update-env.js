#!/usr/bin/env node

/**
 * 🔧 Environment Configuration Helper
 * 
 * This script helps you update your .env.local file with new Supabase credentials
 * Run: node scripts/update-env.js
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function updateEnvFile() {
  console.log('🏠 Real Estate App - Environment Setup')
  console.log('=====================================\n')

  console.log('This script will help you update your .env.local file with new credentials.\n')

  const envPath = path.join(process.cwd(), '.env.local')
  
  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!')
    console.log('Creating a new .env.local file...\n')
  }

  console.log('Please provide your Supabase credentials:')
  console.log('(Press Enter to keep current value or skip)\n')

  // Get current values if file exists
  let currentEnv = {}
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        currentEnv[key.trim()] = value.trim().replace(/"/g, '')
      }
    })
  }

  // Collect new values
  const newEnv = {}

  // Database URL
  const dbUrl = await question(`Database URL [${currentEnv.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'}]: `)
  newEnv.DATABASE_URL = dbUrl || currentEnv.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

  // NextAuth Secret
  const nextAuthSecret = await question(`NextAuth Secret [${currentEnv.NEXTAUTH_SECRET ? '***hidden***' : 'super-secret-jwt-token-with-at-least-32-characters-long'}]: `)
  newEnv.NEXTAUTH_SECRET = nextAuthSecret || currentEnv.NEXTAUTH_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long'

  // NextAuth URL
  const nextAuthUrl = await question(`NextAuth URL [${currentEnv.NEXTAUTH_URL || 'http://localhost:3000'}]: `)
  newEnv.NEXTAUTH_URL = nextAuthUrl || currentEnv.NEXTAUTH_URL || 'http://localhost:3000'

  // Supabase URL
  const supabaseUrl = await question(`Supabase URL [${currentEnv.SUPABASE_URL || 'http://127.0.0.1:54321'}]: `)
  newEnv.SUPABASE_URL = supabaseUrl || currentEnv.SUPABASE_URL || 'http://127.0.0.1:54321'

  // Supabase Service Role Key
  const serviceRoleKey = await question(`Supabase Service Role Key [${currentEnv.SUPABASE_SERVICE_ROLE_KEY ? '***hidden***' : 'your-service-role-key'}]: `)
  newEnv.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey || currentEnv.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

  // Supabase Anon Key
  const anonKey = await question(`Supabase Anon Key [${currentEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***hidden***' : 'your-anon-key'}]: `)
  newEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey || currentEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  // Set other values
  newEnv.NEXT_PUBLIC_SUPABASE_URL = newEnv.SUPABASE_URL
  newEnv.SUPABASE_BUCKET = currentEnv.SUPABASE_BUCKET || 'documents'

  // Generate .env.local content
  const envContent = `# =============================================================================
# SUPABASE LOCAL DEVELOPMENT CONFIGURATION
# =============================================================================
# Generated on ${new Date().toISOString()}

# Database - PostgreSQL connection for Prisma
DATABASE_URL="${newEnv.DATABASE_URL}"

# NextAuth.js - Authentication configuration
NEXTAUTH_SECRET="${newEnv.NEXTAUTH_SECRET}"
NEXTAUTH_URL="${newEnv.NEXTAUTH_URL}"

# Supabase - Local development instance
SUPABASE_URL="${newEnv.SUPABASE_URL}"
SUPABASE_SERVICE_ROLE_KEY="${newEnv.SUPABASE_SERVICE_ROLE_KEY}"
SUPABASE_BUCKET="${newEnv.SUPABASE_BUCKET}"

# Supabase - Public keys (exposed to client)
NEXT_PUBLIC_SUPABASE_URL="${newEnv.NEXT_PUBLIC_SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${newEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}"

# =============================================================================
# OPTIONAL INTEGRATIONS
# =============================================================================

# Stripe - Payment processing (optional)
STRIPE_SECRET_KEY="${currentEnv.STRIPE_SECRET_KEY || ''}"
STRIPE_WEBHOOK_SECRET="${currentEnv.STRIPE_WEBHOOK_SECRET || ''}"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${currentEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}"

# Google OAuth - Social authentication (optional)
GOOGLE_CLIENT_ID="${currentEnv.GOOGLE_CLIENT_ID || ''}"
GOOGLE_CLIENT_SECRET="${currentEnv.GOOGLE_CLIENT_SECRET || ''}"
`

  // Write the file
  fs.writeFileSync(envPath, envContent)

  console.log('\n✅ .env.local file updated successfully!')
  console.log('\n📋 Next steps:')
  console.log('1. Run: npm install')
  console.log('2. Run: npx prisma db push')
  console.log('3. Run: npm run dev')
  console.log('\n📖 For more details, see docs/SUPABASE_SETUP.md')

  rl.close()
}

// Run the script
updateEnvFile().catch(console.error)
