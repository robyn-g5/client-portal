import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { BarChart3 } from 'lucide-react'
import { CMACard } from '@/components/property/CMACard'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function CMAPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: cmas } = await supabase
    .from('cmas')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Comparative Market Analysis</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          CMA reports prepared by your agent to help determine the optimal listing price
        </p>
      </div>

      {!cmas || cmas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <BarChart3 className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
          <p className="text-[#64748B] text-sm">No CMA reports available yet.</p>
          <p className="text-[#64748B] text-xs mt-1">
            Your agent will add CMA reports after reviewing comparable sales in your area.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cmas.map((cma) => (
            <CMACard key={cma.id} cma={cma} />
          ))}
        </div>
      )}
    </div>
  )
}
