import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/prisma'
import { env } from '../../../../lib/env'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo account
        if (credentials.email === 'demo@epioso.com' && credentials.password === 'demo123') {
          return {
            id: 'demo-user',
            email: 'demo@epioso.com',
            name: 'Demo User',
            image: null,
            organizationId: '550e8400-e29b-41d4-a716-446655440000',
            role: 'admin',
          }
        }

        try {
          // Find user with organization membership
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              members: {
                include: {
                  organization: true,
                },
              },
            },
          })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Get primary organization membership
          const primaryMembership = user.members[0]
          if (!primaryMembership) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            organizationId: primaryMembership.organizationId,
            role: primaryMembership.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.organizationId = (user as any).organizationId
        token.role = (user as any).role
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).organizationId = token.organizationId as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).provider = token.provider
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { members: true },
          })

          if (!existingUser) {
            // Create new user and organization
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            })

            // Create default organization
            const organization = await prisma.organization.create({
              data: {
                name: `${user.name}'s Organization`,
                slug: `${user.name?.toLowerCase().replace(/\s+/g, '-')}-org-${Date.now()}`,
              },
            })

            // Add user as admin member
            await prisma.member.create({
              data: {
                userId: newUser.id,
                organizationId: organization.id,
                role: 'admin',
              },
            })

            // Add organization info to user object for JWT
            ;(user as any).organizationId = organization.id
            ;(user as any).role = 'admin'
          } else {
            // Add organization info for existing user
            const membership = existingUser.members[0]
            if (membership) {
              ;(user as any).organizationId = membership.organizationId
              ;(user as any).role = membership.role
            }
          }

          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
    },
    async signOut({ session }) {
      console.log(`User ${session?.user?.email} signed out`)
    },
  },
}
