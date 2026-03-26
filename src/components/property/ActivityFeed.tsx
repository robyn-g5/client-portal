import { formatDistanceToNow } from 'date-fns'
import type { ActivityLog } from '@/lib/types/database'
import { Activity } from 'lucide-react'

interface ActivityFeedProps {
  logs: ActivityLog[]
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
        <Activity className="h-12 w-12 text-[#E2E8F0] mx-auto mb-4" />
        <p className="text-[#64748B] text-sm">No activity yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="divide-y divide-[#E2E8F0]">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className="flex items-start gap-4 px-5 py-4 hover:bg-[#F8F9FA] transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#6DBF3A]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1E2D3B]">{log.message}</p>
              <p className="text-xs text-[#64748B] mt-0.5">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
