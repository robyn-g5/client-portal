import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { PrepChecklist } from '@/components/property/PrepChecklist'
import { FintracWarning } from '@/components/property/FintracWarning'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function PropertyPrepPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: prepItems } = await supabase
    .from('property_prep_items')
    .select('*, property_prep_files(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  const { data: fintracReqs } = await supabase
    .from('fintrac_requirements')
    .select('*')
    .eq('property_id', propertyId)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[#6DBF3A]" />
          Property Prep Checklist
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Documents and tasks needed to prepare your property for listing
        </p>
      </div>

      <FintracWarning requirements={fintracReqs || []} />

      <PrepChecklist
        items={prepItems || []}
        propertyId={propertyId}
        canEdit={false}
      />
    </div>
  )
}
