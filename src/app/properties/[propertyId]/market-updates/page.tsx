import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { format } from 'date-fns'
import { TrendingUp, Paperclip, ExternalLink } from 'lucide-react'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function MarketUpdatesPage({ params }: Props) {
  await params
  await requireAuth()
  const supabase = await createClient()

  const { data: updates } = await supabase
    .from('market_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(10)

  const latestUpdate = updates?.[0] || null
  const olderUpdates = updates?.slice(1) || []

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Market Updates</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Stay informed with the latest Muskoka real estate market insights from your agent
        </p>
      </div>

      {!latestUpdate ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <TrendingUp className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
          <p className="text-[#64748B] text-sm">No market updates available yet.</p>
          <p className="text-[#64748B] text-xs mt-1">Check back soon for Muskoka market insights.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Latest update - featured */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#3D4F5C] px-6 py-3 flex items-center justify-between">
              <span className="text-white text-xs font-medium uppercase tracking-wide">Latest Update</span>
              <span className="text-white/60 text-xs">
                {format(new Date(latestUpdate.published_at), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1E2D3B] mb-4">{latestUpdate.title}</h2>
              <div
                className="prose prose-sm text-[#64748B] max-w-none"
                dangerouslySetInnerHTML={{ __html: latestUpdate.body }}
              />
              {latestUpdate.attachment_url && (
                <a
                  href={latestUpdate.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  View Attachment
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Older updates */}
          {olderUpdates.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-4">
                Previous Updates
              </h3>
              <div className="space-y-3">
                {olderUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-[#1E2D3B]">{update.title}</h3>
                      <span className="text-xs text-[#64748B] flex-shrink-0 ml-4">
                        {format(new Date(update.published_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div
                      className="prose prose-sm text-[#64748B] max-w-none line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: update.body }}
                    />
                    {update.attachment_url && (
                      <a
                        href={update.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Attachment
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
