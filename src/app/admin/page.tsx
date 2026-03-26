import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, Users, TrendingUp, Activity, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export default async function AdminDashboardPage() {
  const profile = await requireAgent()
  const supabase = await createClient()

  const [
    { count: totalProperties },
    { count: activeProperties },
    { count: totalClients },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('client_profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase
      .from('activity_logs')
      .select('*, properties(title)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    {
      label: 'Total Properties',
      value: totalProperties ?? 0,
      icon: Building2,
      href: '/admin/properties',
      color: 'bg-[#3D4F5C]/10 text-[#3D4F5C]',
    },
    {
      label: 'Active Listings',
      value: activeProperties ?? 0,
      icon: TrendingUp,
      href: '/admin/properties',
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Total Clients',
      value: totalClients ?? 0,
      icon: Users,
      href: '/admin/properties',
      color: 'bg-blue-100 text-blue-700',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">
          Good morning, {profile.full_name.split(' ')[0]}
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Here is what is happening with your listings today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-sm hover:border-[#3D4F5C] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#1E2D3B]">{stat.value}</p>
                  <p className="text-sm text-[#64748B] mt-1">{stat.label}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1E2D3B] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#6DBF3A]" />
              Recent Activity
            </h2>
          </div>

          {!recentActivity || recentActivity.length === 0 ? (
            <p className="text-sm text-[#64748B] text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#6DBF3A] flex-shrink-0 mt-1.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-[#1E2D3B] leading-snug">{log.message}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add new property', href: '/admin/properties/new' },
              { label: 'View all properties', href: '/admin/properties' },
              { label: 'Create market update', href: '/admin/market-updates' },
              { label: 'Manage templates', href: '/admin/templates' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
              >
                <span className="text-sm text-[#1E2D3B] group-hover:text-[#3D4F5C]">
                  {link.label}
                </span>
                <ArrowRight className="h-4 w-4 text-[#E2E8F0] group-hover:text-[#3D4F5C] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
