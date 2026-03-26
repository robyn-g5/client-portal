import { format } from 'date-fns'
import type { DealTask } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { FileText, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

interface DealTaskListProps {
  tasks: DealTask[]
}

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
    case 'in_progress':
      return <Circle className="h-4 w-4 text-amber-500 flex-shrink-0" />
    default:
      return <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
  }
}

function TaskCard({ task }: { task: DealTask }) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'completed'

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border transition-colors',
        task.status === 'completed'
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-[#E2E8F0]'
      )}
    >
      <TaskStatusIcon status={task.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              task.status === 'completed' ? 'text-[#64748B] line-through' : 'text-[#1E2D3B]'
            )}
          >
            {task.title}
            {task.is_conditional && (
              <span className="ml-2 text-xs font-normal text-amber-600 no-underline">(Conditional)</span>
            )}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {task.due_date && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  isOverdue ? 'text-red-600' : 'text-[#64748B]'
                )}
              >
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                <Clock className="h-3 w-3" />
                <span>{format(new Date(task.due_date), 'MMM d')}</span>
              </div>
            )}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                task.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : task.status === 'in_progress'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-[#64748B] mt-1">{task.description}</p>
        )}

        {task.deal_task_files && task.deal_task_files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {task.deal_task_files.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#3D4F5C] hover:text-[#6DBF3A] transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                {file.file_name}
              </a>
            ))}
          </div>
        )}

        {task.completed_at && (
          <p className="text-xs text-green-600 mt-1">
            Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}
          </p>
        )}
      </div>
    </div>
  )
}

export function DealTaskList({ tasks }: DealTaskListProps) {
  const partyGroups: Array<{ key: string; label: string; color: string }> = [
    { key: 'seller', label: 'Seller', color: 'text-[#3D4F5C]' },
    { key: 'buyer', label: 'Buyer', color: 'text-blue-700' },
    { key: 'agent', label: 'Agent', color: 'text-[#6DBF3A]' },
  ]

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
        <p className="text-[#64748B] text-sm">No deal tasks yet.</p>
        <p className="text-[#64748B] text-xs mt-1">Tasks will appear here once a deal is in progress.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {partyGroups.map(({ key, label, color }) => {
        const partyTasks = tasks.filter((t) => t.party === key)
        if (partyTasks.length === 0) return null

        const completed = partyTasks.filter((t) => t.status === 'completed').length

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold uppercase tracking-wide ${color}`}>
                {label} Tasks
              </h3>
              <span className="text-xs text-[#64748B]">
                {completed}/{partyTasks.length} completed
              </span>
            </div>
            <div className="space-y-2">
              {partyTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
