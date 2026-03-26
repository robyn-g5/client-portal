import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Activity } from 'lucide-react'
import { ActivityFeed } from '@/components/property/ActivityFeed'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function ActivityPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#6DBF3A]" />
          Activity Log
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          A complete history of all activity for this property
        </p>
      </div>

      <ActivityFeed logs={logs || []} />
    </div>
  )
}
