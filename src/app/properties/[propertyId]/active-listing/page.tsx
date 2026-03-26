import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Eye, Lock } from 'lucide-react'
import { ShowingsTable } from '@/components/property/ShowingsTable'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function ActiveListingPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const isAccessible = ['active', 'conditional', 'sold'].includes(property.status)

  if (!isAccessible) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
            <Eye className="h-6 w-6 text-[#E2E8F0]" />
            Active Listing
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <Lock className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
          <h3 className="text-base font-medium text-[#1E2D3B] mb-2">Not yet active</h3>
          <p className="text-[#64748B] text-sm">
            This section will be available once your property is listed on the market.
          </p>
        </div>
      </div>
    )
  }

  const { data: showings } = await supabase
    .from('showings')
    .select('*')
    .eq('property_id', propertyId)
    .order('showing_date', { ascending: false })

  const stats = {
    total: showings?.length || 0,
    received: showings?.filter((s) => s.feedback_status === 'Received').length || 0,
    requested: showings?.filter((s) => s.feedback_status === 'Requested').length || 0,
    noResponse: showings?.filter((s) => s.feedback_status === 'No Response').length || 0,
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <Eye className="h-6 w-6 text-[#6DBF3A]" />
          Active Listing — Showings
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Track all showings and buyer feedback for your property
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Showings', value: stats.total, color: 'text-[#1E2D3B]' },
          { label: 'Feedback Received', value: stats.received, color: 'text-green-700' },
          { label: 'Feedback Requested', value: stats.requested, color: 'text-blue-700' },
          { label: 'No Response', value: stats.noResponse, color: 'text-gray-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#64748B] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <ShowingsTable showings={showings || []} />
    </div>
  )
}
