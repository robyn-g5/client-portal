import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { TrendingUp, Trash2 } from 'lucide-react'
import { AdminMarketUpdateForm } from '@/components/forms/AdminMarketUpdateForm'
import { createMarketUpdate, deleteMarketUpdate } from '@/lib/actions/marketUpdates'

export default async function AdminMarketUpdatesPage() {
  await requireAgent()
  const supabase = await createClient()

  const { data: updates } = await supabase
    .from('market_updates')
    .select('*')
    .order('published_at', { ascending: false })

  async function handleCreate(formData: FormData) {
    'use server'
    await createMarketUpdate(formData)
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const updateId = formData.get('updateId') as string
    await deleteMarketUpdate(updateId)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#6DBF3A]" />
          Market Updates
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Publish market insights visible to all clients. The most recent update is shown prominently.
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Publish Market Update</h2>
        <AdminMarketUpdateForm onCreate={handleCreate} />
      </div>

      {/* Updates List */}
      {!updates || updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
          <TrendingUp className="h-10 w-10 text-[#E2E8F0] mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">No market updates published yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update, index) => (
            <div
              key={update.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#1E2D3B]">{update.title}</p>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-[#6DBF3A] text-white rounded-full text-xs font-medium">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {format(new Date(update.published_at), 'MMMM d, yyyy')}
                  </p>
                </div>
                <form action={handleDelete}>
                  <input type="hidden" name="updateId" value={update.id} />
                  <button
                    type="submit"
                    className="text-[#64748B] hover:text-red-500 transition-colors p-1 ml-2"
                    title="Delete update"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
