'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAgent } from '@/lib/auth'
import { showingSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'

export async function createShowing(propertyId: string, formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    showingDate: formData.get('showingDate') as string,
    agentName: formData.get('agentName') as string,
    feedbackStatus: (formData.get('feedbackStatus') as string) || 'Requested',
    feedbackText: formData.get('feedbackText') as string | undefined,
  }

  const parsed = showingSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('showings').insert({
    property_id: propertyId,
    showing_date: parsed.data.showingDate,
    agent_name: parsed.data.agentName,
    feedback_status: parsed.data.feedbackStatus,
    feedback_text: parsed.data.feedbackText || null,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    message: `Showing added for ${new Date(parsed.data.showingDate).toLocaleDateString()} with ${parsed.data.agentName}`,
  })

  // Add timeline event for the showing
  await supabase.from('timeline_events').insert({
    property_id: propertyId,
    label: `Showing - ${parsed.data.agentName}`,
    date: parsed.data.showingDate,
    category: 'showing',
  })

  revalidatePath(`/admin/properties/${propertyId}/showings`)
  revalidatePath(`/properties/${propertyId}/active-listing`)
  return { success: true }
}

export async function updateShowingFeedback(
  propertyId: string,
  showingId: string,
  feedbackStatus: string,
  feedbackText?: string
) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase
    .from('showings')
    .update({
      feedback_status: feedbackStatus,
      feedback_text: feedbackText || null,
    })
    .eq('id', showingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/showings`)
  revalidatePath(`/properties/${propertyId}/active-listing`)
  return { success: true }
}

export async function deleteShowing(propertyId: string, showingId: string) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase.from('showings').delete().eq('id', showingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/showings`)
  revalidatePath(`/properties/${propertyId}/active-listing`)
  return { success: true }
}

export async function getShowings(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('showings')
    .select('*')
    .eq('property_id', propertyId)
    .order('showing_date', { ascending: false })

  if (error) return []
  return data || []
}
