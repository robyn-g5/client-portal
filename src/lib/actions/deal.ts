'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAgent } from '@/lib/auth'
import { dealTaskSchema, timelineEventSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'

export async function createDealTask(propertyId: string, formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
    party: formData.get('party') as string,
    isConditional: formData.get('isConditional') === 'true',
    dueDate: formData.get('dueDate') as string | undefined,
    status: (formData.get('status') as string) || 'not_started',
  }

  const parsed = dealTaskSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('deal_tasks').insert({
    property_id: propertyId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    party: parsed.data.party,
    is_conditional: parsed.data.isConditional,
    due_date: parsed.data.dueDate || null,
    status: parsed.data.status,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    message: `Deal task "${parsed.data.title}" created for ${parsed.data.party}`,
  })

  revalidatePath(`/admin/properties/${propertyId}/deal`)
  revalidatePath(`/properties/${propertyId}/deal`)
  return { success: true }
}

export async function updateDealTaskStatus(
  propertyId: string,
  taskId: string,
  status: 'not_started' | 'in_progress' | 'completed'
) {
  await requireAgent()
  const supabase = await createClient()

  const updates: Record<string, unknown> = { status }
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('deal_tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/deal`)
  revalidatePath(`/properties/${propertyId}/deal`)
  return { success: true }
}

export async function deleteDealTask(propertyId: string, taskId: string) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase.from('deal_tasks').delete().eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/deal`)
  revalidatePath(`/properties/${propertyId}/deal`)
  return { success: true }
}

export async function createTimelineEvent(propertyId: string, formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    label: formData.get('label') as string,
    date: formData.get('date') as string,
    category: formData.get('category') as string,
  }

  const parsed = timelineEventSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('timeline_events').insert({
    property_id: propertyId,
    label: parsed.data.label,
    date: parsed.data.date,
    category: parsed.data.category,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/deal`)
  revalidatePath(`/properties/${propertyId}/deal`)
  return { success: true }
}

export async function deleteTimelineEvent(propertyId: string, eventId: string) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/deal`)
  revalidatePath(`/properties/${propertyId}/deal`)
  return { success: true }
}

export async function getDealTasks(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deal_tasks')
    .select('*, deal_task_files(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data || []
}

export async function getTimelineEvents(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('property_id', propertyId)
    .order('date', { ascending: true })

  if (error) return []
  return data || []
}
