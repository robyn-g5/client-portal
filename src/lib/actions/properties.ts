'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAgent } from '@/lib/auth'
import { createPropertySchema, appointmentSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProperty(formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    clientEmail: formData.get('clientEmail') as string,
    clientName: formData.get('clientName') as string,
    clientPhone: formData.get('clientPhone') as string | undefined,
    initialPassword: formData.get('initialPassword') as string,
    propertyTitle: formData.get('propertyTitle') as string,
    propertyAddress: formData.get('propertyAddress') as string,
    propertyStatus: (formData.get('propertyStatus') as string) || 'draft',
  }

  const parsed = createPropertySchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { data } = parsed

  // Use service-role admin client to create auth user with password
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if a client with this email already exists
  const { data: existingUsersList } = await adminSupabase.auth.admin.listUsers()
  const existingAuthUser = existingUsersList?.users?.find(
    (u) => u.email?.toLowerCase() === data.clientEmail.toLowerCase()
  )

  let clientProfileId: string

  if (existingAuthUser) {
    // Reuse existing auth user — look up their profile
    const { data: existingProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', existingAuthUser.id)
      .single()

    if (!existingProfile) {
      return { error: 'Client user exists but has no profile. Please contact support.' }
    }
    clientProfileId = existingProfile.id
  } else {
    // Create new auth user with the agent-supplied password
    const { data: newUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
      email: data.clientEmail,
      password: data.initialPassword,
      email_confirm: true,
      user_metadata: { full_name: data.clientName },
    })

    if (createUserError || !newUser.user) {
      return { error: `Failed to create client user: ${createUserError?.message}` }
    }

    // Create client profile
    const { data: newProfile, error: profileError } = await adminSupabase
      .from('client_profiles')
      .insert({
        user_id: newUser.user.id,
        full_name: data.clientName,
        phone: data.clientPhone || null,
        role: 'client',
      })
      .select('id')
      .single()

    if (profileError || !newProfile) {
      return { error: `Failed to create client profile: ${profileError?.message}` }
    }

    clientProfileId = newProfile.id
  }

  // Create property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({
      client_id: clientProfileId,
      title: data.propertyTitle,
      address: data.propertyAddress,
      status: data.propertyStatus,
    })
    .select('id')
    .single()

  if (propertyError || !property) {
    return { error: `Failed to create property: ${propertyError?.message}` }
  }

  // Seed FINTRAC requirements
  await supabase.from('fintrac_requirements').insert([
    { property_id: property.id, type: 'FINTRAC', status: 'required' },
    { property_id: property.id, type: 'RECO_GUIDE', status: 'required' },
  ])

  // Seed prep items from default template
  const { data: templateItems } = await supabase
    .from('checklist_template_items')
    .select('*')
    .eq('template_id', '00000000-0000-0000-0000-000000000001')
    .order('sort_order')

  if (templateItems && templateItems.length > 0) {
    await supabase.from('property_prep_items').insert(
      templateItems.map((item) => ({
        property_id: property.id,
        template_item_id: item.id,
        label: item.label,
        description: item.description,
        is_required: item.is_required,
        status: 'not_started',
        created_by: 'agent',
      }))
    )
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    property_id: property.id,
    message: `Property "${data.propertyTitle}" created for client ${data.clientName}`,
  })

  revalidatePath('/admin/properties')
  redirect(`/admin/properties/${property.id}`)
}

export async function updatePropertyStatus(propertyId: string, status: string) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', propertyId)

  if (error) {
    return { error: error.message }
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    message: `Property status updated to ${status}`,
  })

  revalidatePath(`/admin/properties/${propertyId}`)
  revalidatePath(`/properties/${propertyId}`)
  return { success: true }
}

export async function createAppointment(propertyId: string, formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    scheduledAt: formData.get('scheduledAt') as string,
    notes: formData.get('notes') as string | undefined,
  }

  const parsed = appointmentSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('listing_appointments').insert({
    property_id: propertyId,
    scheduled_at: parsed.data.scheduledAt,
    notes: parsed.data.notes || null,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    message: `Listing appointment scheduled for ${new Date(parsed.data.scheduledAt).toLocaleDateString()}`,
  })

  revalidatePath(`/admin/properties/${propertyId}/appointments`)
  revalidatePath(`/properties/${propertyId}/listing-appointment`)
  return { success: true }
}

export async function deleteAppointment(propertyId: string, appointmentId: string) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase
    .from('listing_appointments')
    .delete()
    .eq('id', appointmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/appointments`)
  revalidatePath(`/properties/${propertyId}/listing-appointment`)
  return { success: true }
}

export async function getProperties() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*, client_profiles(*)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function getClientProperties() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return []

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function setClientPassword(clientUserId: string, newPassword: string) {
  await requireAgent()

  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminSupabase.auth.admin.updateUserById(clientUserId, {
    password: newPassword,
  })

  if (error) return { error: error.message }
  return { success: true }
}
