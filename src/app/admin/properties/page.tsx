import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Search, MapPin, Building2, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

function statusConfig(status: string) {
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

interface SearchParams {
  q?: string
  status?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function AdminPropertiesPage({ searchParams }: Props) {
  await requireAgent()
  const supabase = await createClient()
  const { q, status } = await searchParams

  let query = supabase
    .from('properties')
    .select('*, client_profiles(full_name, phone)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: properties } = await query

  const filtered = properties?.filter((p) => {
    if (!q) return true
    const search = q.toLowerCase()
    return (
      p.title?.toLowerCase().includes(search) ||
      p.address?.toLowerCase().includes(search) ||
      p.client_profiles?.full_name?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E2D3B]">Properties</h1>
          <p className="text-[#64748B] mt-1 text-sm">
            Manage all client properties and listings
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Property
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6 flex items-center gap-4">
        <form className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by property, address, or client..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 focus:border-[#3D4F5C]"
            />
          </div>
          <select
            name="status"
            defaultValue={status || 'all'}
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 text-[#1E2D3B]"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="conditional">Conditional</option>
            <option value="sold">Sold</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Properties List */}
      {!filtered || filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <Building2 className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
          <p className="text-[#64748B] text-sm">No properties found.</p>
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[#3D4F5C] font-medium hover:text-[#6DBF3A]"
          >
            <PlusCircle className="h-4 w-4" />
            Create your first property
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Property
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Created
                </th>
                <th className="text-right px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((property) => {
                const { label, className } = statusConfig(property.status)
                return (
                  <tr key={property.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#1E2D3B]">{property.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-[#64748B]" />
                        <p className="text-xs text-[#64748B] truncate max-w-xs">{property.address}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[#1E2D3B]">{property.client_profiles?.full_name}</p>
                      {property.client_profiles?.phone && (
                        <p className="text-xs text-[#64748B]">{property.client_profiles.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[#64748B]">
                        {format(new Date(property.created_at), 'MMM d, yyyy')}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="inline-flex items-center gap-1 text-sm text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
