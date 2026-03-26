import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Eye,
  Handshake,
} from 'lucide-react'
import { updatePropertyStatus } from '@/lib/actions/properties'
import { SetPasswordForm } from '@/components/forms/SetPasswordForm'

interface Props {
  params: Promise<{ propertyId: string }>
}

const statusOptions = ['draft', 'active', 'conditional', 'sold'] as const

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    conditional: 'bg-amber-100 text-amber-800 border-amber-200',
    sold: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${config[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default async function AdminPropertyDetailPage({ params }: Props) {
  const { propertyId } = await params
  await requireAgent()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*, client_profiles(*)')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const [
    { count: appointmentCount },
    { count: prepCount },
    { count: prepCompleted },
    { count: cmaCount },
    { count: showingCount },
    { count: dealTaskCount },
  ] = await Promise.all([
    supabase.from('listing_appointments').select('*', { count: 'exact', head: true }).eq('property_id', propertyId),
    supabase.from('property_prep_items').select('*', { count: 'exact', head: true }).eq('property_id', propertyId),
    supabase.from('property_prep_items').select('*', { count: 'exact', head: true }).eq('property_id', propertyId).eq('status', 'completed'),
    supabase.from('cmas').select('*', { count: 'exact', head: true }).eq('property_id', propertyId),
    supabase.from('showings').select('*', { count: 'exact', head: true }).eq('property_id', propertyId),
    supabase.from('deal_tasks').select('*', { count: 'exact', head: true }).eq('property_id', propertyId),
  ])

  async function handleStatusChange(formData: FormData) {
    'use server'
    const status = formData.get('status') as string
    await updatePropertyStatus(propertyId, status)
  }

  const manageSections = [
    { label: 'Appointments', href: `/admin/properties/${propertyId}/appointments`, icon: CalendarDays, count: appointmentCount ?? 0 },
    { label: 'Prep Checklist', href: `/admin/properties/${propertyId}/prep`, icon: ClipboardList, count: `${prepCompleted ?? 0}/${prepCount ?? 0}` },
    { label: 'CMA', href: `/admin/properties/${propertyId}/cma`, icon: BarChart3, count: cmaCount ?? 0 },
    { label: 'Showings', href: `/admin/properties/${propertyId}/showings`, icon: Eye, count: showingCount ?? 0 },
    { label: 'Deal Tasks', href: `/admin/properties/${propertyId}/deal`, icon: Handshake, count: dealTaskCount ?? 0 },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/properties"
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E2D3B] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E2D3B]">{property.title}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#64748B]" />
              <p className="text-sm text-[#64748B]">{property.address}</p>
            </div>
          </div>
          <StatusBadge status={property.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Client Info */}
        <div className="col-span-1 bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-4">Client</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#64748B]" />
              <span className="text-sm text-[#1E2D3B] font-medium">{property.client_profiles?.full_name}</span>
            </div>
            {property.client_profiles?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#64748B]" />
                <span className="text-sm text-[#64748B]">{property.client_profiles.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#64748B]" />
              <span className="text-sm text-[#64748B]">
                Added {format(new Date(property.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Client portal link + password reset */}
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
            <Link
              href={`/properties/${propertyId}/listing-appointment`}
              className="text-xs text-[#3D4F5C] hover:text-[#6DBF3A] font-medium transition-colors block"
              target="_blank"
            >
              View client portal →
            </Link>
            {property.client_profiles?.user_id && (
              <SetPasswordForm clientUserId={property.client_profiles.user_id} />
            )}
          </div>
        </div>

        {/* Change Status */}
        <div className="col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-4">
            Update Status
          </h2>
          <form action={handleStatusChange} className="flex items-center gap-3">
            <select
              name="status"
              defaultValue={property.status}
              className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 text-[#1E2D3B]"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
            >
              Update
            </button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#64748B]">
            <p><strong>Draft:</strong> Property setup in progress</p>
            <p><strong>Active:</strong> Listed on the market</p>
            <p><strong>Conditional:</strong> Offer accepted with conditions</p>
            <p><strong>Sold:</strong> Deal completed</p>
          </div>
        </div>
      </div>

      {/* Manage Sections */}
      <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Manage Property</h2>
      <div className="grid grid-cols-2 gap-4">
        {manageSections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#3D4F5C] hover:shadow-sm transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3D4F5C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#3D4F5C] transition-colors">
                  <Icon className="h-5 w-5 text-[#3D4F5C] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E2D3B]">{section.label}</p>
                  <p className="text-xs text-[#64748B]">
                    {typeof section.count === 'number'
                      ? `${section.count} item${section.count !== 1 ? 's' : ''}`
                      : section.count}
                  </p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-[#E2E8F0] group-hover:text-[#3D4F5C] rotate-180 transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
