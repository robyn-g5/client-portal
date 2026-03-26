import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, FileText, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { deleteCMA } from '@/lib/actions/cma'
import { AdminCMAForm } from '@/components/forms/AdminCMAForm'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function AdminCMAPage({ params }: Props) {
  const { propertyId } = await params
  await requireAgent()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('title')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: cmas } = await supabase
    .from('cmas')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  async function handleDelete(formData: FormData) {
    'use server'
    const cmaId = formData.get('cmaId') as string
    await deleteCMA(cmaId, propertyId)
  }

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
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">CMA Reports</h1>
        <p className="text-[#64748B] mt-1 text-sm">{property.title}</p>
      </div>

      {/* Add CMA */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Add CMA Report</h2>
        <AdminCMAForm propertyId={propertyId} />
      </div>

      {/* CMA List */}
      {!cmas || cmas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
          <p className="text-[#64748B] text-sm">No CMAs added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cmas.map((cma) => (
            <div
              key={cma.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-start justify-between"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-[#3D4F5C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-[#3D4F5C]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1E2D3B]">{cma.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {format(new Date(cma.created_at), 'MMM d, yyyy')}
                  </p>
                  <a
                    href={cma.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#3D4F5C] hover:text-[#6DBF3A] transition-colors mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View PDF
                  </a>
                </div>
              </div>
              <form action={handleDelete}>
                <input type="hidden" name="cmaId" value={cma.id} />
                <button type="submit" className="text-[#64748B] hover:text-red-500 transition-colors p-1 flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
