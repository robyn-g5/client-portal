'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import { updateShowingFeedback } from '@/lib/actions/showings'
import { cn } from '@/lib/utils'

interface ShowingRowEditProps {
  propertyId: string
  showingId: string
  currentStatus: string
  currentFeedback: string | null
}

function feedbackPillClass(status: string) {
  switch (status) {
    case 'Received': return 'bg-green-100 text-green-700 border-green-200'
    case 'Requested': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function ShowingRowEdit({ propertyId, showingId, currentStatus, currentFeedback }: ShowingRowEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [feedback, setFeedback] = useState(currentFeedback || '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateShowingFeedback(propertyId, showingId, status, feedback || undefined)
      setIsEditing(false)
    })
  }

  function handleCancel() {
    setStatus(currentStatus)
    setFeedback(currentFeedback || '')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <>
        <td className="px-5 py-4">
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', feedbackPillClass(currentStatus))}>
            {currentStatus}
          </span>
        </td>
        <td className="px-5 py-4 max-w-xs">
          <p className="text-sm text-[#64748B] truncate">{currentFeedback || '—'}</p>
        </td>
        <td className="px-5 py-4 text-right">
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#64748B] hover:text-[#3D4F5C] transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </td>
      </>
    )
  }

  return (
    <>
      <td className="px-5 py-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isPending}
          className="px-2 py-1 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 disabled:opacity-50"
        >
          <option value="Requested">Requested</option>
          <option value="Received">Received</option>
          <option value="No Response">No Response</option>
        </select>
      </td>
      <td className="px-5 py-4 max-w-xs">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isPending}
          rows={2}
          placeholder="Buyer feedback (optional)"
          className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 resize-none disabled:opacity-50"
        />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
            title="Save"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-[#64748B] hover:text-red-500 transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  )
}
