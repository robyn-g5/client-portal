'use server'

import { createClient } from '@/lib/supabase/server'
import { prepItemSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'

export async function updatePrepItemStatus(
  propertyId: string,
  itemId: string,
  status: 'not_started' | 'in_progress' | 'completed'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('property_prep_items')
    .update({ status })
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    message: `Prep item status updated to ${status.replace('_', ' ')}`,
  })

  revalidatePath(`/properties/${propertyId}/property-prep`)
  revalidatePath(`/admin/properties/${propertyId}/prep`)
  return { success: true }
}

export async function updatePrepItemNotes(
  propertyId: string,
  itemId: string,
  notes: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('property_prep_items')
    .update({ notes })
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/properties/${propertyId}/property-prep`)
  revalidatePath(`/admin/properties/${propertyId}/prep`)
  return { success: true }
}

export async function createPrepItem(propertyId: string, formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    label: formData.get('label') as string,
    description: formData.get('description') as string | undefined,
    isRequired: formData.get('isRequired') === 'true',
    notes: formData.get('notes') as string | undefined,
    status: (formData.get('status') as string) || 'not_started',
  }

  const parsed = prepItemSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('role')
    .eq('user_id', user?.id)
    .single()

  const { error } = await supabase.from('property_prep_items').insert({
    property_id: propertyId,
    label: parsed.data.label,
    description: parsed.data.description || null,
    is_required: parsed.data.isRequired,
    notes: parsed.data.notes || null,
    status: parsed.data.status,
    created_by: profile?.role || 'agent',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/properties/${propertyId}/property-prep`)
  revalidatePath(`/admin/properties/${propertyId}/prep`)
  return { success: true }
}

export async function deletePrepItem(propertyId: string, itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('property_prep_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/properties/${propertyId}/property-prep`)
  revalidatePath(`/admin/properties/${propertyId}/prep`)
  return { success: true }
}

export async function addPrepFile(
  propertyId: string,
  prepItemId: string,
  fileName: string,
  fileUrl: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('property_prep_files').insert({
    prep_item_id: prepItemId,
    uploader_id: user.id,
    file_name: fileName,
    file_url: fileUrl,
  })

  if (error) {
    return { error: error.message }
  }

  // Auto-update status to in_progress if not already completed
  const { data: item } = await supabase
    .from('property_prep_items')
    .select('status')
    .eq('id', prepItemId)
    .single()

  if (item?.status === 'not_started') {
    await supabase
      .from('property_prep_items')
      .update({ status: 'in_progress' })
      .eq('id', prepItemId)
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    user_id: user.id,
    message: `File "${fileName}" uploaded to prep checklist`,
  })

  revalidatePath(`/properties/${propertyId}/property-prep`)
  revalidatePath(`/admin/properties/${propertyId}/prep`)
  return { success: true }
}

export async function getPrepItems(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('property_prep_items')
    .select('*, property_prep_files(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data || []
}
