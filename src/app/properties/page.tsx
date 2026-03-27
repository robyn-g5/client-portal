import { requireAuth } from '@/lib/auth'
import { getClientProperties } from '@/lib/actions/properties'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/lib/actions/auth'
import { MapPin, ChevronRight, Home } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PropertyStatus } from '@/lib/types/database'

function statusConfig(status: PropertyStatus) {
  switch (status) {
    case 'active':
      return { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' }
    case 'conditional':
      return { label: 'Conditional', className: 'bg-amber-100 text-amber-800 border-amber-200' }
    case 'sold':
      return { label: 'Sold', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    default:
      return { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' }
  }
}

export default async function PropertiesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  const properties = await getClientProperties()

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top Nav */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
        <Image src="/logo.png" alt="iMuskoka Properties" width={180} height={48} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#64748B]">
            Welcome, <span className="font-medium text-[#1E2D3B]">{profile?.full_name}</span>
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="text-[#64748B]">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1E2D3B]">Your Properties</h1>
          <p className="text-[#64748B] mt-1">Manage and track your listings with iMuskoka Properties</p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
            <Home className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1E2D3B] mb-2">No properties yet</h3>
            <p className="text-[#64748B] text-sm">
              Your agent will set up your property portal. Contact us at{' '}
              <a href="mailto:info@imuskoka.com" className="text-[#3D4F5C] underline">
                info@imuskoka.com
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const { label, className } = statusConfig(property.status as PropertyStatus)
              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}/listing-appointment`}
                  className="block bg-white rounded-xl border border-[#E2E8F0] p-6 hover:border-[#3D4F5C] hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-[#1E2D3B] truncate group-hover:text-[#3D4F5C]">
                          {property.title}
                        </h2>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
                        >
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{property.address}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#E2E8F0] group-hover:text-[#3D4F5C] flex-shrink-0 ml-4 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
