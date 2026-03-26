import { format } from 'date-fns'
import type { TimelineEvent } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { Flag, CheckSquare, FileText, Eye } from 'lucide-react'

interface TimelineProps {
  events: TimelineEvent[]
}

function CategoryIcon({ category }: { category: string }) {
  const iconClass = 'h-4 w-4'
  switch (category) {
    case 'milestone':
      return <Flag className={iconClass} />
    case 'task':
      return <CheckSquare className={iconClass} />
    case 'document':
      return <FileText className={iconClass} />
    case 'showing':
      return <Eye className={iconClass} />
    default:
      return <Flag className={iconClass} />
  }
}

function categoryColor(category: string): string {
  switch (category) {
    case 'milestone':
      return 'bg-[#3D4F5C] text-white'
    case 'task':
      return 'bg-amber-500 text-white'
    case 'document':
      return 'bg-blue-500 text-white'
    case 'showing':
      return 'bg-[#6DBF3A] text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <p className="text-[#64748B] text-sm">No timeline events yet.</p>
      </div>
    )
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const now = new Date()

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-[#E2E8F0]" />

      <div className="space-y-4 pl-14">
        {sortedEvents.map((event, index) => {
          const isPast = new Date(event.date) < now
          return (
            <div key={event.id} className="relative">
              {/* Icon bubble */}
              <div
                className={cn(
                  'absolute -left-[2.25rem] top-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 border-white',
                  categoryColor(event.category),
                  !isPast && 'opacity-60'
                )}
              >
                <CategoryIcon category={event.category} />
              </div>

              {/* Content */}
              <div
                className={cn(
                  'bg-white rounded-xl border border-[#E2E8F0] p-4',
                  !isPast && 'opacity-70'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1E2D3B]">{event.label}</p>
                    <p className="text-xs text-[#64748B] mt-0.5 capitalize">{event.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-medium text-[#1E2D3B]">
                      {format(new Date(event.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {isPast ? 'Completed' : 'Upcoming'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
