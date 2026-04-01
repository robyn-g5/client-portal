export type UserRole = 'agent' | 'client'
export type PropertyStatus = 'draft' | 'active' | 'conditional' | 'sold'
export type PrepStatus = 'empty' | 'complete'
export type FeedbackStatus = 'Requested' | 'Received' | 'No Response'
export type DealTaskStatus = 'not_started' | 'in_progress' | 'completed'
export type PropertyTaskStatus = 'pending' | 'completed'
export type FintracType = 'FINTRAC' | 'RECO_GUIDE'
export type FintracStatus = 'required' | 'uploaded'
export type TimelineCategory = 'milestone' | 'task' | 'document' | 'showing'
export type Party = 'buyer' | 'seller' | 'agent'

export interface ClientProfile {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  role: UserRole
  agent_id: string | null
  is_approved: boolean
  is_super_admin: boolean
  created_at: string
}

export interface Property {
  id: string
  client_id: string
  title: string
  address: string
  status: PropertyStatus
  created_at: string
  client_profiles?: ClientProfile
}

export interface ListingAppointment {
  id: string
  property_id: string
  scheduled_at: string
  notes: string | null
  created_at: string
}

export interface MarketUpdate {
  id: string
  title: string
  body: string
  attachment_url: string | null
  published_at: string
}

export interface CMA {
  id: string
  property_id: string
  title: string
  body: string
  pdf_url: string
  created_at: string
}

export interface ChecklistTemplate {
  id: string
  name: string
  created_at: string
  checklist_template_items?: ChecklistTemplateItem[]
}

export interface ChecklistTemplateItem {
  id: string
  template_id: string
  label: string
  description: string | null
  is_required: boolean
  sort_order: number
}

export interface PropertyPrepItem {
  id: string
  property_id: string
  template_item_id: string | null
  label: string
  description: string | null
  is_required: boolean
  status: PrepStatus
  notes: string | null
  created_by: 'agent' | 'client'
  created_at: string
  property_prep_files?: PropertyPrepFile[]
}

export interface PropertyPrepFile {
  id: string
  prep_item_id: string
  uploader_id: string
  file_name: string
  file_url: string
  uploaded_at: string
}

export interface FintracRequirement {
  id: string
  property_id: string
  type: FintracType
  status: FintracStatus
  file_url: string | null
  updated_at: string
}

export interface Showing {
  id: string
  property_id: string
  showing_date: string
  agent_name: string
  feedback_status: FeedbackStatus
  feedback_text: string | null
  created_at: string
}

export interface DealTask {
  id: string
  property_id: string
  title: string
  description: string | null
  party: Party
  is_conditional: boolean
  due_date: string | null
  status: DealTaskStatus
  completed_at: string | null
  created_at: string
  deal_task_files?: DealTaskFile[]
}

export interface DealTaskFile {
  id: string
  deal_task_id: string
  file_url: string
  file_name: string
  uploaded_at: string
}

export interface TimelineEvent {
  id: string
  property_id: string
  label: string
  date: string
  category: TimelineCategory
  created_at: string
}

export interface ActivityLog {
  id: string
  property_id: string
  user_id: string | null
  message: string
  created_at: string
}

export interface PropertyTask {
  id: string
  property_id: string
  title: string
  description: string | null
  status: PropertyTaskStatus
  due_date: string | null
  file_url: string | null
  created_at: string
}

export interface PropertyAppointment {
  id: string
  property_id: string
  title: string
  appointment_type: string
  scheduled_at: string
  description: string | null
  created_at: string
}
