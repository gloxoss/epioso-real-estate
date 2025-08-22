# 🗄️ Database Setup Guide

This guide covers setting up the database for your real estate management application using Prisma and Supabase.

## 📋 Quick Start

### 1. Environment Setup

Make sure your `.env.local` file has the correct database URL:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Or run migrations (if you have migration files)
npx prisma migrate deploy
```

### 4. Seed Database (Optional)

```bash
# Run the seed script to add sample data
npx prisma db seed
```

### 5. View Database

```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

---

## 🏗️ Database Schema Overview

Your real estate application uses the following main entities:

### **Core Entities**
- **Organizations** - Multi-tenant support
- **Users** - User accounts and authentication
- **OrganizationMembers** - User-organization relationships with roles

### **Property Management**
- **Properties** - Real estate properties
- **Units** - Individual units within properties
- **Contacts** - Customers, tenants, owners, agents

### **Sales Management**
- **SalesAgents** - Sales team members
- **Leads** - Potential customers
- **SalesDeals** - Sales opportunities and transactions
- **Commissions** - Agent commission tracking

### **Financial Management**
- **Invoices** - Billing and invoicing
- **Payments** - Payment tracking
- **PaymentPlans** - Installment payment plans
- **PaymentMilestones** - Payment schedule milestones

### **Operations**
- **MaintenanceTickets** - Property maintenance requests
- **Documents** - File storage and management
- **Activities** - Audit log and activity tracking

---

## 🔧 Common Database Operations

### Reset Database

```bash
# Reset database and apply all migrations
npx prisma migrate reset

# Push current schema (development only)
npx prisma db push
```

### Generate Types

```bash
# Generate Prisma client
npx prisma generate

# Generate TypeScript types from Supabase
supabase gen types typescript --local > types/supabase.ts
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your-migration-name

# Apply migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Data Management

```bash
# Open Prisma Studio
npx prisma studio

# Import data from SQL file
psql $DATABASE_URL < backup.sql

# Export data
pg_dump $DATABASE_URL > backup.sql
```

---

## 🌱 Seeding Data

### Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Real Estate',
      slug: 'demo-real-estate',
    },
  })

  // Create sample properties
  const property = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: 'Sunset Apartments',
      address: '123 Main St, City, Country',
      propertyType: 'apartment',
      expectedUnits: 10,
    },
  })

  // Create sample units
  for (let i = 1; i <= 5; i++) {
    await prisma.unit.create({
      data: {
        propertyId: property.id,
        unitNumber: `A${i}`,
        bedrooms: 2,
        bathrooms: 1,
        size: 75,
        rentPrice: 1200,
        salePrice: 150000,
        status: i <= 2 ? 'available' : 'occupied',
        isForSale: true,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Run Seed

```bash
npx prisma db seed
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Database does not exist"
```bash
# Make sure Supabase is running
supabase status

# If not running, start it
supabase start

# Push schema
npx prisma db push
```

#### 2. "Schema drift detected"
```bash
# Reset and apply schema
npx prisma db push --force-reset
```

#### 3. "Connection refused"
```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start
```

#### 4. "Migration failed"
```bash
# Check migration status
npx prisma migrate status

# Reset migrations (development only)
npx prisma migrate reset
```

### Useful Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Stop all services
supabase stop

# Restart services
supabase restart
```

---

## 📊 Database Monitoring

### Performance Monitoring

1. **Supabase Studio**: http://127.0.0.1:54323
   - View tables and data
   - Run SQL queries
   - Monitor performance

2. **Prisma Studio**: `npx prisma studio`
   - Visual database browser
   - Edit data directly
   - Relationship visualization

### Query Optimization

```bash
# Enable query logging in development
export DEBUG="prisma:query"
npm run dev
```

---

## 🔒 Security Considerations

### Local Development
- ✅ Default credentials are fine for local development
- ✅ Database is only accessible locally
- ✅ No sensitive data exposure

### Production
- 🔐 Use strong, unique passwords
- 🔐 Enable Row Level Security (RLS)
- 🔐 Set up proper backup strategies
- 🔐 Monitor database access logs

---

**Your database is now ready for development! 🎉**

For more advanced configuration, see the [Supabase Setup Guide](./SUPABASE_SETUP.md).
