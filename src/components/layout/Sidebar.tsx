'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Eye,
  Handshake,
  Activity,
  LogOut,
  MapPin,
  LayoutDashboard,
} from 'lucide-react'
import type { Property } from '@/lib/types/database'

interface SidebarProps {
  property: Property
  userFullName: string
  onLogout: () => void
}

function getTabItems(property: Property) {
  const status = property.status

  const isActiveOrBeyond = ['active', 'conditional', 'sold'].includes(status)
  const isConditionalOrSold = ['conditional', 'sold'].includes(status)

  return [
    {
      label: 'Dashboard',
      href: `/properties/${property.id}/dashboard`,
      icon: LayoutDashboard,
      enabled: true,
    },
    {
      label: 'Listing Appointment',
      href: `/properties/${property.id}/listing-appointment`,
      icon: CalendarDays,
      enabled: true,
    },
    {
      label: 'Market Updates',
      href: `/properties/${property.id}/market-updates`,
      icon: TrendingUp,
      enabled: true,
    },
    {
      label: 'CMA',
      href: `/properties/${property.id}/cma`,
      icon: BarChart3,
      enabled: true,
    },
    {
      label: 'Property Prep',
      href: `/properties/${property.id}/property-prep`,
      icon: ClipboardList,
      enabled: true,
    },
    {
      label: 'Active Listing',
      href: `/properties/${property.id}/active-listing`,
      icon: Eye,
      enabled: isActiveOrBeyond,
    },
    {
      label: 'Deal in Progress',
      href: `/properties/${property.id}/deal`,
      icon: Handshake,
      enabled: isConditionalOrSold,
    },
  ]
}

export function Sidebar({ property, userFullName, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const tabs = getTabItems(property)

  const statusLabel = {
    draft: 'Draft',
    active: 'Active',
    conditional: 'Conditional',
    sold: 'Sold',
  }[property.status]

  const statusColor = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-800',
    conditional: 'bg-amber-100 text-amber-800',
    sold: 'bg-blue-100 text-blue-800',
  }[property.status]

  return (
    <aside className="w-64 flex-shrink-0 bg-[#3D4F5C] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/properties" className="block bg-white/95 rounded-lg p-2 transition-opacity hover:opacity-90">
          <Image src="/logo.png" alt="iMuskoka Properties" width={205} height={44} className="w-auto h-8" />
        </Link>
      </div>

      {/* Property Info */}
      <div className="p-5 border-b border-white/10">
        <p className="text-white font-semibold text-sm leading-snug">{property.title}</p>
        <div className="flex items-center gap-1 mt-1 mb-2">
          <MapPin className="h-3 w-3 text-white/50 flex-shrink-0" />
          <p className="text-white/60 text-xs truncate">{property.address}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.icon

          if (!tab.enabled) {
            return (
              <div
                key={tab.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 cursor-not-allowed"
                title="Not available at current status"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-white/60 text-xs mb-3 truncate">{userFullName}</p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
