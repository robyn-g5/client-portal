import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PrepChecklist } from '@/components/property/PrepChecklist'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function AdminPrepPage({ params }: Props) {
  const { propertyId } = await params
  await requireAgent()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('title')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: prepItems } = await supabase
    .from('property_prep_items')
    .select('*, property_prep_files(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/admin/properties/${propertyId}`}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E2D3B] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Prep Checklist</h1>
        <p className="text-[#64748B] mt-1 text-sm">{property.title}</p>
      </div>

      <PrepChecklist
        items={prepItems || []}
        propertyId={propertyId}
        canEdit={true}
      />
    </div>
  )
}
