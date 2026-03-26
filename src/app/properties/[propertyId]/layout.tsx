import { requireAuth, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { PropertyLayoutClient } from '@/components/layout/PropertyLayoutClient'
import { logout } from '@/lib/actions/auth'

interface PropertyLayoutProps {
  children: React.ReactNode
  params: Promise<{ propertyId: string }>
}

async function handleLogout() {
  'use server'
  await logout()
}

export default async function PropertyLayout({ children, params }: PropertyLayoutProps) {
  const { propertyId } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch the property
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  // Ensure the client owns this property (agents can see all)
  if (profile.role === 'client' && property.client_id !== profile.id) {
    notFound()
  }

  const sidebar = (
    <Sidebar
      property={property}
      userFullName={profile.full_name}
      onLogout={handleLogout}
    />
  )

  return (
    <PropertyLayoutClient sidebar={sidebar}>
      {children}
    </PropertyLayoutClient>
  )
}
