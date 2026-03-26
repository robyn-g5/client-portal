import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const createPropertySchema = z.object({
  clientEmail: z.string().email('Please enter a valid email address'),
  clientName: z.string().min(2, 'Name must be at least 2 characters'),
  clientPhone: z.string().optional(),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  propertyTitle: z.string().min(2, 'Property title is required'),
  propertyAddress: z.string().min(5, 'Property address is required'),
  propertyStatus: z.enum(['draft', 'active', 'conditional', 'sold']).default('draft'),
})

export const appointmentSchema = z.object({
  scheduledAt: z.string().min(1, 'Appointment date is required'),
  notes: z.string().optional(),
})

export const marketUpdateSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  body: z.string().min(10, 'Body content is required'),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
})

export const cmaSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  body: z.string().min(10, 'Body content is required'),
  pdfUrl: z.string().url('PDF URL must be a valid URL'),
})

export const prepItemSchema = z.object({
  label: z.string().min(2, 'Label is required'),
  description: z.string().optional(),
  isRequired: z.boolean().default(true),
  notes: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
})

export const showingSchema = z.object({
  showingDate: z.string().min(1, 'Showing date is required'),
  agentName: z.string().min(2, 'Agent name is required'),
  feedbackStatus: z.enum(['Requested', 'Received', 'No Response']).default('Requested'),
  feedbackText: z.string().optional(),
})

export const dealTaskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  party: z.enum(['buyer', 'seller', 'agent']),
  isConditional: z.boolean().default(false),
  dueDate: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
})

export const timelineEventSchema = z.object({
  label: z.string().min(2, 'Label is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['milestone', 'task', 'document', 'showing']),
})

export const checklistTemplateItemSchema = z.object({
  label: z.string().min(2, 'Label is required'),
  description: z.string().optional(),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type MarketUpdateInput = z.infer<typeof marketUpdateSchema>
export type CMAInput = z.infer<typeof cmaSchema>
export type PrepItemInput = z.infer<typeof prepItemSchema>
export type ShowingInput = z.infer<typeof showingSchema>
export type DealTaskInput = z.infer<typeof dealTaskSchema>
export type TimelineEventInput = z.infer<typeof timelineEventSchema>
export type ChecklistTemplateItemInput = z.infer<typeof checklistTemplateItemSchema>
