import { format } from 'date-fns'
import type { Showing } from '@/lib/types/database'
import { cn } from '@/lib/utils'

interface ShowingsTableProps {
  showings: Showing[]
}

function FeedbackPill({ status }: { status: string }) {
  const config = {
    Requested: { label: 'Requested', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    Received: { label: 'Received', className: 'bg-green-100 text-green-700 border-green-200' },
    'No Response': { label: 'No Response', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  }[status] || { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

export function ShowingsTable({ showings }: ShowingsTableProps) {
  if (showings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
        <p className="text-[#64748B] text-sm">No showings recorded yet.</p>
        <p className="text-[#64748B] text-xs mt-1">Showings will appear here as they are scheduled.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Date
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Showing Agent
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Feedback
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {showings.map((showing) => (
              <tr key={showing.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-[#1E2D3B]">
                    {format(new Date(showing.showing_date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {format(new Date(showing.showing_date), 'h:mm a')}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-[#1E2D3B]">{showing.agent_name}</span>
                </td>
                <td className="px-5 py-4">
                  <FeedbackPill status={showing.feedback_status} />
                </td>
                <td className="px-5 py-4">
                  {showing.feedback_text ? (
                    <p className="text-sm text-[#64748B] max-w-xs">{showing.feedback_text}</p>
                  ) : (
                    <span className="text-sm text-[#E2E8F0]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8F9FA]">
        <p className="text-xs text-[#64748B]">
          {showings.length} showing{showings.length !== 1 ? 's' : ''} total
        </p>
      </div>
    </div>
  )
}
