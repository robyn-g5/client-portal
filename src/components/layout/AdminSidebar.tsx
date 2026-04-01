'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  ClipboardList,
  LogOut,
  PlusCircle,
} from 'lucide-react'

interface AdminSidebarProps {
  agentName: string
  onLogout: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Properties', href: '/admin/properties', icon: Building2, exact: false },
  { label: 'Market Updates', href: '/admin/market-updates', icon: TrendingUp, exact: false },
  { label: 'Templates', href: '/admin/templates', icon: ClipboardList, exact: false },
]

export function AdminSidebar({ agentName, onLogout }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-[#1E2D3B] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="block bg-white/95 rounded-lg p-2 mb-3 transition-opacity hover:opacity-90">
          <Image
            src="/logo.png"
            alt="iMuskoka Properties"
            width={205}
            height={44}
            className="w-auto h-8"
          />
        </Link>
        <span className="mt-2 block text-xs font-medium text-[#6DBF3A] uppercase tracking-widest">
          Agent Portal
        </span>
      </div>

      {/* Quick Action */}
      <div className="p-3 border-b border-white/10">
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#6DBF3A] text-white text-sm font-medium hover:bg-[#5aad2f] transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Property
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-white/60 text-xs mb-3 truncate">{agentName}</p>
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
