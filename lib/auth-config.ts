// Auth provider configuration
export const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'nextauth' // 'supabase' | 'nextauth'

export const authConfig = {
  provider: AUTH_PROVIDER,
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  nextauth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
} as const
