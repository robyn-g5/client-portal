import { requireAgent } from '@/lib/auth'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminLayoutClient } from '@/components/layout/AdminLayoutClient'
import { logout } from '@/lib/actions/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

async function handleLogout() {
  'use server'
  await logout()
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const profile = await requireAgent()

  const sidebar = (
    <AdminSidebar agentName={profile.full_name} onLogout={handleLogout} />
  )

  return (
    <AdminLayoutClient sidebar={sidebar}>
      {children}
    </AdminLayoutClient>
  )
}
