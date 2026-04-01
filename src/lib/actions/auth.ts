'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { loginSchema, signupSchema } from '@/lib/validations/schemas'

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Invalid email or password. Please try again.' }
  }

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('role, is_approved')
    .eq('user_id', data.user.id)
    .single()

  if (profile?.role === 'agent') {
    if (!profile.is_approved) {
      redirect('/pending-approval')
    }
    redirect('/admin')
  } else {
    redirect('/properties')
  }
}

export async function signup(formData: FormData) {
  const rawData = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const parsed = signupSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const admin = createAdminClient()

  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: 'Could not create account. Please try again.' }
  }

  if (!authData.user) {
    return { error: 'Could not create account. Please try again.' }
  }

  // Insert profile using the admin client (bypasses RLS — new user has no profile yet)
  const { error: profileError } = await admin
    .from('client_profiles')
    .insert({
      user_id: authData.user.id,
      full_name: parsed.data.fullName,
      role: 'agent',
      is_approved: false,
    })

  if (profileError) {
    // Roll back the auth user so they can retry cleanly
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: 'Could not create account. Please try again.' }
  }

  redirect('/pending-approval')
}

export async function approveAgent(agentUserId: string) {
  const supabase = await createClient()

  // Verify the current user is super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: currentProfile } = await supabase
    .from('client_profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .single()

  if (!currentProfile?.is_super_admin) {
    return { error: 'Not authorized' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('client_profiles')
    .update({ is_approved: true })
    .eq('user_id', agentUserId)

  if (error) return { error: 'Failed to approve agent.' }
  return { success: true }
}

export async function rejectAgent(agentUserId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: currentProfile } = await supabase
    .from('client_profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .single()

  if (!currentProfile?.is_super_admin) {
    return { error: 'Not authorized' }
  }

  const admin = createAdminClient()

  // Delete profile then auth user
  await admin.from('client_profiles').delete().eq('user_id', agentUserId)
  await admin.auth.admin.deleteUser(agentUserId)

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
