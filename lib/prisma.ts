// Conditional Prisma import to avoid build issues
let PrismaClient: any
let prisma: any

try {
  // Try to import Prisma client
  const PrismaModule = require('@prisma/client')
  PrismaClient = PrismaModule.PrismaClient

  const globalForPrisma = global as unknown as { prisma: any | undefined }

  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} catch (error) {
  // If Prisma is not available, create a mock
  console.warn('Prisma client not available, using mock')
  prisma = {
    user: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    property: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    unit: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    tenant: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    lease: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    payment: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    maintenanceRequest: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
    $disconnect: () => Promise.resolve(),
  }
}

export { prisma }
export default prisma

