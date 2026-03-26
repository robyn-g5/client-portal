import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createShowing, deleteShowing, updateShowingFeedback } from '@/lib/actions/showings'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ propertyId: string }>
}

function feedbackPillClass(status: string) {
  switch (status) {
    case 'Received': return 'bg-green-100 text-green-700 border-green-200'
    case 'Requested': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export default async function AdminShowingsPage({ params }: Props) {
  const { propertyId } = await params
  await requireAgent()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('title')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: showings } = await supabase
    .from('showings')
    .select('*')
    .eq('property_id', propertyId)
    .order('showing_date', { ascending: false })

  async function handleCreate(formData: FormData) {
    'use server'
    await createShowing(propertyId, formData)
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const showingId = formData.get('showingId') as string
    await deleteShowing(propertyId, showingId)
  }

  async function handleFeedbackUpdate(formData: FormData) {
    'use server'
    const showingId = formData.get('showingId') as string
    const feedbackStatus = formData.get('feedbackStatus') as string
    const feedbackText = formData.get('feedbackText') as string | undefined
    await updateShowingFeedback(propertyId, showingId, feedbackStatus, feedbackText)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/admin/properties/${propertyId}`}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E2D3B] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Showings</h1>
        <p className="text-[#64748B] mt-1 text-sm">{property.title}</p>
      </div>

      {/* Add Showing */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Log New Showing</h2>
        <form action={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Date & Time *</label>
              <input
                type="datetime-local"
                name="showingDate"
                required
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Showing Agent *</label>
              <input
                type="text"
                name="agentName"
                required
                placeholder="Agent name / brokerage"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Feedback Status</label>
              <select
                name="feedbackStatus"
                defaultValue="Requested"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              >
                <option value="Requested">Requested</option>
                <option value="Received">Received</option>
                <option value="No Response">No Response</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1E2D3B]">Feedback Notes</label>
            <textarea
              name="feedbackText"
              rows={2}
              placeholder="Buyer feedback (optional)"
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 resize-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
          >
            Log Showing
          </button>
        </form>
      </div>

      {/* Showings List */}
      {!showings || showings.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
          <p className="text-[#64748B] text-sm">No showings logged yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Agent</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Feedback</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {showings.map((showing) => (
                <tr key={showing.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[#1E2D3B]">
                      {format(new Date(showing.showing_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {format(new Date(showing.showing_date), 'h:mm a')}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#1E2D3B]">{showing.agent_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', feedbackPillClass(showing.feedback_status))}>
                      {showing.feedback_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm text-[#64748B] truncate">{showing.feedback_text || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <form action={handleDelete} className="inline">
                      <input type="hidden" name="showingId" value={showing.id} />
                      <button type="submit" className="text-[#64748B] hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
