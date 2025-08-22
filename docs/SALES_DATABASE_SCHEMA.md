# Sales Transformation Database Schema

## New Enums

```prisma
enum LeadStatus {
  inquiry           // Initial contact/interest
  qualified         // Meets basic criteria
  viewing_scheduled // Appointment set
  viewed           // Property shown
  negotiating      // Price/terms discussion
  contract_pending // Contract being prepared
  contract_signed  // Contract executed
  payment_pending  // Awaiting payment
  completed        // Sale finalized
  lost             // Lost to competitor
  cancelled        // Customer cancelled
}

enum SaleType {
  full_payment      // 100% upfront payment
  installment_plan  // Custom payment schedule
  mortgage_assisted // Bank financing involved
}

enum PaymentPlanStatus {
  active      // Currently active
  completed   // All payments made
  defaulted   // Missed payments
  cancelled   // Plan cancelled
  suspended   // Temporarily paused
}

enum CommissionStatus {
  pending   // Commission calculated but not approved
  approved  // Approved for payment
  paid      // Commission paid out
  disputed  // Under dispute
}

enum LeadSource {
  website
  referral
  social_media
  advertisement
  walk_in
  phone_call
  email
  other
}

enum AppointmentStatus {
  scheduled
  confirmed
  completed
  cancelled
  no_show
  rescheduled
}
```

## New Models

### Lead Management

```prisma
model Lead {
  id             String      @id @default(uuid()) @db.Uuid
  organizationId String      @map("organization_id") @db.Uuid
  contactId      String?     @map("contact_id") @db.Uuid
  unitId         String?     @map("unit_id") @db.Uuid
  propertyId     String?     @map("property_id") @db.Uuid
  assignedAgentId String?    @map("assigned_agent_id") @db.Uuid
  
  status         LeadStatus  @default(inquiry)
  source         LeadSource  @default(other)
  score          Int?        @default(0) // Lead scoring 0-100
  budget         Decimal?    @db.Decimal(12, 2)
  timeline       String?     // Expected purchase timeline
  notes          String?
  
  // Tracking fields
  firstContactAt DateTime?   @map("first_contact_at") @db.Timestamptz
  lastContactAt  DateTime?   @map("last_contact_at") @db.Timestamptz
  convertedAt    DateTime?   @map("converted_at") @db.Timestamptz
  
  createdAt      DateTime    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime    @updatedAt @map("updated_at") @db.Timestamptz

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  contact        Contact?     @relation(fields: [contactId], references: [id], onDelete: SetNull)
  unit           Unit?        @relation(fields: [unitId], references: [id], onDelete: SetNull)
  property       Property?    @relation(fields: [propertyId], references: [id], onDelete: SetNull)
  assignedAgent  SalesAgent?  @relation(fields: [assignedAgentId], references: [id], onDelete: SetNull)
  
  deals          SalesDeal[]
  appointments   ViewingAppointment[]
  activities     LeadActivity[]

  @@index([organizationId])
  @@index([status])
  @@index([assignedAgentId])
  @@index([createdAt])
  @@map("leads")
}

model LeadActivity {
  id        String   @id @default(uuid()) @db.Uuid
  leadId    String   @map("lead_id") @db.Uuid
  userId    String   @map("user_id")
  type      String   // call, email, meeting, note, etc.
  subject   String?
  content   String?
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@index([createdAt])
  @@map("lead_activities")
}
```

### Sales Management

```prisma
model SalesAgent {
  id             String  @id @default(uuid()) @db.Uuid
  organizationId String  @map("organization_id") @db.Uuid
  userId         String  @map("user_id")
  
  licenseNumber  String? @map("license_number")
  specializations String[] @default([]) // residential, commercial, luxury, etc.
  territory      Json    @default("{}") @db.JsonB // Geographic areas
  
  // Commission structure
  commissionRate Decimal @default(0.03) @db.Decimal(5, 4) // 3% default
  isActive       Boolean @default(true) @map("is_active")
  
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  leads        Lead[]
  deals        SalesDeal[]
  commissions  Commission[]

  @@unique([organizationId, userId])
  @@index([organizationId])
  @@map("sales_agents")
}

model SalesDeal {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @map("organization_id") @db.Uuid
  leadId         String?   @map("lead_id") @db.Uuid
  unitId         String    @map("unit_id") @db.Uuid
  buyerId        String    @map("buyer_id") @db.Uuid
  agentId        String    @map("agent_id") @db.Uuid
  
  dealNumber     String    @unique @map("deal_number")
  saleType       SaleType  @default(full_payment) @map("sale_type")
  salePrice      Decimal   @map("sale_price") @db.Decimal(12, 2)
  
  // Contract details
  contractDate   DateTime? @map("contract_date") @db.Date
  closingDate    DateTime? @map("closing_date") @db.Date
  
  // Status tracking
  status         LeadStatus @default(contract_pending)
  probability    Int       @default(50) // 0-100%
  
  notes          String?
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  lead           Lead?        @relation(fields: [leadId], references: [id], onDelete: SetNull)
  unit           Unit         @relation(fields: [unitId], references: [id], onDelete: Cascade)
  buyer          Contact      @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  agent          SalesAgent   @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  paymentPlan    PaymentPlan?
  commissions    Commission[]

  @@index([organizationId])
  @@index([status])
  @@index([agentId])
  @@index([createdAt])
  @@map("sales_deals")
}
```

### Payment Plans

```prisma
model PaymentPlan {
  id             String            @id @default(uuid()) @db.Uuid
  organizationId String            @map("organization_id") @db.Uuid
  dealId         String            @unique @map("deal_id") @db.Uuid
  
  totalAmount    Decimal           @map("total_amount") @db.Decimal(12, 2)
  downPayment    Decimal           @map("down_payment") @db.Decimal(12, 2)
  remainingAmount Decimal          @map("remaining_amount") @db.Decimal(12, 2)
  
  status         PaymentPlanStatus @default(active)
  startDate      DateTime          @map("start_date") @db.Date
  endDate        DateTime?         @map("end_date") @db.Date
  
  // Plan configuration
  installmentCount Int             @map("installment_count")
  installmentAmount Decimal        @map("installment_amount") @db.Decimal(12, 2)
  frequency      String           @default("monthly") // monthly, quarterly, etc.
  
  // Late fee configuration
  lateFeeAmount  Decimal?         @map("late_fee_amount") @db.Decimal(12, 2)
  gracePeriodDays Int             @default(5) @map("grace_period_days")
  
  notes          String?
  createdAt      DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime         @updatedAt @map("updated_at") @db.Timestamptz

  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  deal           SalesDeal        @relation(fields: [dealId], references: [id], onDelete: Cascade)
  
  milestones     PaymentMilestone[]

  @@index([organizationId])
  @@index([status])
  @@index([startDate])
  @@map("payment_plans")
}

model PaymentMilestone {
  id            String    @id @default(uuid()) @db.Uuid
  paymentPlanId String    @map("payment_plan_id") @db.Uuid
  invoiceId     String?   @map("invoice_id") @db.Uuid
  
  milestoneNumber Int     @map("milestone_number")
  description   String?
  amount        Decimal   @db.Decimal(12, 2)
  dueDate       DateTime  @map("due_date") @db.Date
  
  isPaid        Boolean   @default(false) @map("is_paid")
  paidAt        DateTime? @map("paid_at") @db.Timestamptz
  paidAmount    Decimal?  @map("paid_amount") @db.Decimal(12, 2)
  
  isOverdue     Boolean   @default(false) @map("is_overdue")
  lateFeeApplied Decimal? @map("late_fee_applied") @db.Decimal(12, 2)
  
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  paymentPlan   PaymentPlan @relation(fields: [paymentPlanId], references: [id], onDelete: Cascade)
  invoice       Invoice?    @relation(fields: [invoiceId], references: [id], onDelete: SetNull)

  @@unique([paymentPlanId, milestoneNumber])
  @@index([paymentPlanId])
  @@index([dueDate])
  @@index([isPaid])
  @@map("payment_milestones")
}
```

### Commission Management

```prisma
model Commission {
  id             String          @id @default(uuid()) @db.Uuid
  organizationId String          @map("organization_id") @db.Uuid
  dealId         String          @map("deal_id") @db.Uuid
  agentId        String          @map("agent_id") @db.Uuid
  
  commissionRate Decimal         @map("commission_rate") @db.Decimal(5, 4)
  saleAmount     Decimal         @map("sale_amount") @db.Decimal(12, 2)
  commissionAmount Decimal       @map("commission_amount") @db.Decimal(12, 2)
  
  status         CommissionStatus @default(pending)
  earnedAt       DateTime?       @map("earned_at") @db.Timestamptz
  approvedAt     DateTime?       @map("approved_at") @db.Timestamptz
  paidAt         DateTime?       @map("paid_at") @db.Timestamptz
  
  notes          String?
  createdAt      DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  deal           SalesDeal       @relation(fields: [dealId], references: [id], onDelete: Cascade)
  agent          SalesAgent      @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([agentId])
  @@index([status])
  @@index([createdAt])
  @@map("commissions")
}
```

### Viewing Appointments

```prisma
model ViewingAppointment {
  id             String            @id @default(uuid()) @db.Uuid
  organizationId String            @map("organization_id") @db.Uuid
  leadId         String            @map("lead_id") @db.Uuid
  unitId         String            @map("unit_id") @db.Uuid
  agentId        String?           @map("agent_id") @db.Uuid
  
  scheduledAt    DateTime          @map("scheduled_at") @db.Timestamptz
  duration       Int               @default(60) // minutes
  status         AppointmentStatus @default(scheduled)
  
  attendeeCount  Int?              @map("attendee_count")
  feedback       String?
  followUpNotes  String?           @map("follow_up_notes")
  
  createdAt      DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime          @updatedAt @map("updated_at") @db.Timestamptz

  organization   Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  lead           Lead              @relation(fields: [leadId], references: [id], onDelete: Cascade)
  unit           Unit              @relation(fields: [unitId], references: [id], onDelete: Cascade)
  agent          SalesAgent?       @relation(fields: [agentId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([leadId])
  @@index([scheduledAt])
  @@index([status])
  @@map("viewing_appointments")
}
```

## Enhanced Existing Models

### Contact Model Enhancements
```prisma
// Add to existing Contact model
leadSource     LeadSource? @map("lead_source")
budget         Decimal?    @db.Decimal(12, 2)
timeline       String?     // Expected purchase timeline
preferences    Json        @default("{}") @db.JsonB // Property preferences
isQualified    Boolean     @default(false) @map("is_qualified")

// New relations
leads          Lead[]      @relation("ContactLeads")
purchases      SalesDeal[] @relation("BuyerDeals")
```

### Unit Model Enhancements
```prisma
// Add to existing Unit model
salePrice      Decimal?    @map("sale_price") @db.Decimal(12, 2)
isForSale      Boolean     @default(false) @map("is_for_sale")
isForRent      Boolean     @default(true) @map("is_for_rent")
assignedAgentId String?    @map("assigned_agent_id") @db.Uuid

// New relations
leads          Lead[]
deals          SalesDeal[]
appointments   ViewingAppointment[]
assignedAgent  SalesAgent? @relation(fields: [assignedAgentId], references: [id])
```

### Invoice Model Enhancements
```prisma
// Add to existing Invoice model
paymentMilestoneId String? @map("payment_milestone_id") @db.Uuid
dealId            String? @map("deal_id") @db.Uuid

// New relations
milestone         PaymentMilestone? @relation(fields: [paymentMilestoneId], references: [id])
deal              SalesDeal?        @relation(fields: [dealId], references: [id])
```

## Migration Strategy

1. **Phase 1**: Add new enums and basic models
2. **Phase 2**: Enhance existing models with new fields
3. **Phase 3**: Create relationships and indexes
4. **Phase 4**: Migrate existing data where applicable
5. **Phase 5**: Add constraints and validation rules

This schema design maintains backward compatibility while adding comprehensive sales management capabilities.
