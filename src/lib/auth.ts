import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAgent() {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'agent') redirect('/properties')
  if (!profile.is_approved) redirect('/pending-approval')
  return profile
}

export async function requireSuperAdmin() {
  const profile = await getUserProfile()
  if (!profile || !profile.is_super_admin) redirect('/admin')
  return profile
}
