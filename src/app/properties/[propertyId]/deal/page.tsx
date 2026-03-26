import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Handshake, Lock } from 'lucide-react'
import { DealTaskList } from '@/components/property/DealTaskList'
import { Timeline } from '@/components/property/Timeline'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function DealPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const isAccessible = ['conditional', 'sold'].includes(property.status)

  if (!isAccessible) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
            <Handshake className="h-6 w-6 text-[#E2E8F0]" />
            Deal in Progress
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <Lock className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
          <h3 className="text-base font-medium text-[#1E2D3B] mb-2">No deal in progress</h3>
          <p className="text-[#64748B] text-sm">
            This section will be available once your property is under contract.
          </p>
        </div>
      </div>
    )
  }

  const { data: dealTasks } = await supabase
    .from('deal_tasks')
    .select('*, deal_task_files(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  const { data: timelineEvents } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('property_id', propertyId)
    .order('date', { ascending: true })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <Handshake className="h-6 w-6 text-[#6DBF3A]" />
          Deal in Progress
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Track all tasks and milestones for your transaction
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Deal Tasks</h2>
          <DealTaskList tasks={dealTasks || []} />
        </section>

        {(timelineEvents?.length ?? 0) > 0 && (
          <section>
            <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Timeline</h2>
            <Timeline events={timelineEvents || []} />
          </section>
        )}
      </div>
    </div>
  )
}
