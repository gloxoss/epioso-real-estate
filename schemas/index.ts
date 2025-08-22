import { z } from 'zod'
import { UnitStatus, ContactType, InvoiceStatus, PaymentMethod, TicketPriority, TicketStatus, DocumentCategory } from '@prisma/client'

// Common schemas
export const PageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(10).max(100).default(20),
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).default('desc'),
})

export const SearchQuerySchema = z.object({
  search: z.string().optional(),
  ...PageQuerySchema.shape,
})

// Property schemas
export const PropertyCreateSchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters').max(100),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  propertyType: z.string().optional().nullable(),
  expectedUnits: z.coerce.number().int().positive().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
})

export const PropertyUpdateSchema = PropertyCreateSchema.partial()

export const PropertyFiltersSchema = z.object({
  search: z.string().optional(),
  hasUnits: z.coerce.boolean().optional(),
  propertyType: z.string().optional(),
  ...PageQuerySchema.shape,
})

// Unit schemas
export const UnitCreateSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  unitNumber: z.string().min(1, 'Unit number is required').max(50),
  floor: z.number().int().nonnegative().optional().nullable(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().nonnegative().optional().nullable(),
  size: z.number().positive().optional().nullable(),
  rentAmount: z.number().nonnegative().optional().nullable(),
  depositAmount: z.number().nonnegative().optional().nullable(),
  status: z.nativeEnum(UnitStatus),
  description: z.string().optional().nullable(),
  attributes: z.any().optional(),
})

export const UnitUpdateSchema = UnitCreateSchema.omit({ propertyId: true }).partial()

export const UnitStatusMoveSchema = z.object({
  unitId: z.string().uuid(),
  toStatus: z.nativeEnum(UnitStatus),
  notes: z.string().optional(),
})

export const UnitFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.nativeEnum(UnitStatus).optional()
  ),
  propertyId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
  ),
  ...PageQuerySchema.shape,
})

// Contact schemas
export const ContactCreateSchema = z.object({
  type: z.nativeEnum(ContactType),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().optional().nullable(),
})

export const ContactUpdateSchema = ContactCreateSchema.partial()

export const ContactFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.nativeEnum(ContactType).optional()
  ),
  ...PageQuerySchema.shape,
})

// Invoice schemas
export const InvoiceCreateSchema = z.object({
  contactId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  currency: z.string().default('MAD'),
  subtotal: z.coerce.number().positive('Subtotal must be positive'),
  tax: z.coerce.number().nonnegative('Tax must be non-negative').default(0),
  notes: z.string().optional().nullable(),
})

export const InvoiceUpdateSchema = InvoiceCreateSchema.partial()

export const InvoiceFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.nativeEnum(InvoiceStatus).optional()
  ),
  contactId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
  ),
  unitId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
  ),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  ...PageQuerySchema.shape,
})

// Payment schemas
export const PaymentCreateSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  method: z.nativeEnum(PaymentMethod),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('MAD'),
  paidAt: z.coerce.date().default(() => new Date()),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const PaymentFiltersSchema = z.object({
  search: z.string().optional(),
  method: z.preprocess(
    (val) => val === '' || val === 'all' ? undefined : val,
    z.nativeEnum(PaymentMethod).optional()
  ),
  invoiceId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
  ),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  ...PageQuerySchema.shape,
})

// Ticket schemas
export const TicketCreateSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  unitId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  priority: z.nativeEnum(TicketPriority).default('medium'),
  cost: z.coerce.number().nonnegative('Cost must be non-negative').optional().nullable(),
})

export const TicketUpdateSchema = TicketCreateSchema.partial()

export const TicketFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  propertyId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  ...PageQuerySchema.shape,
})

// Document schemas
export const DocumentUploadSchema = z.object({
  entityType: z.enum(['property', 'unit', 'contact', 'invoice', 'ticket', 'payment']),
  entityId: z.string().uuid(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive().max(50 * 1024 * 1024), // 50MB max
  category: z.nativeEnum(DocumentCategory).default('other'),
  tags: z.array(z.string()).default([]),
})

export const DocumentFiltersSchema = z.object({
  search: z.string().optional(),
  entityType: z.preprocess(
    (val) => val === '' || val === 'all' ? undefined : val,
    z.enum(['property', 'unit', 'contact', 'invoice', 'ticket', 'payment']).optional()
  ),
  entityId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid().optional()
  ),
  category: z.preprocess(
    (val) => val === '' || val === 'all' ? undefined : val,
    z.nativeEnum(DocumentCategory).optional()
  ),
  tags: z.array(z.string()).optional(),
  mimeType: z.string().optional(),
  ...PageQuerySchema.shape,
})

// Activity log schemas
export const ActivityLogFiltersSchema = z.object({
  entityType: z.enum(['property', 'unit', 'contact', 'invoice', 'ticket', 'payment']).optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  ...PageQuerySchema.shape,
})

// Report schemas
export const ReportDateRangeSchema = z.object({
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
})

export const CollectionsReportSchema = z.object({
  ...ReportDateRangeSchema.shape,
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
  includeProjections: z.coerce.boolean().default(false),
})

export const OccupancyReportSchema = z.object({
  ...ReportDateRangeSchema.shape,
  propertyIds: z.array(z.string().uuid()).optional(),
  includeHistory: z.coerce.boolean().default(false),
})

// Type exports
export type PageQuery = z.infer<typeof PageQuerySchema>
export type SearchQuery = z.infer<typeof SearchQuerySchema>
export type PropertyCreate = z.infer<typeof PropertyCreateSchema>
export type PropertyUpdate = z.infer<typeof PropertyUpdateSchema>
export type PropertyFilters = z.infer<typeof PropertyFiltersSchema>
export type UnitCreate = z.infer<typeof UnitCreateSchema>
export type UnitUpdate = z.infer<typeof UnitUpdateSchema>
export type UnitStatusMove = z.infer<typeof UnitStatusMoveSchema>
export type UnitFilters = z.infer<typeof UnitFiltersSchema>
export type ContactCreate = z.infer<typeof ContactCreateSchema>
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>
export type ContactFilters = z.infer<typeof ContactFiltersSchema>
export type InvoiceCreate = z.infer<typeof InvoiceCreateSchema>
export type InvoiceUpdate = z.infer<typeof InvoiceUpdateSchema>
export type InvoiceFilters = z.infer<typeof InvoiceFiltersSchema>
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>
export type PaymentFilters = z.infer<typeof PaymentFiltersSchema>
export type TicketCreate = z.infer<typeof TicketCreateSchema>
export type TicketUpdate = z.infer<typeof TicketUpdateSchema>
export type TicketFilters = z.infer<typeof TicketFiltersSchema>
export type DocumentUpload = z.infer<typeof DocumentUploadSchema>
export type DocumentFilters = z.infer<typeof DocumentFiltersSchema>
export type ActivityLogFilters = z.infer<typeof ActivityLogFiltersSchema>
export type ReportDateRange = z.infer<typeof ReportDateRangeSchema>
export type CollectionsReport = z.infer<typeof CollectionsReportSchema>
export type OccupancyReport = z.infer<typeof OccupancyReportSchema>
