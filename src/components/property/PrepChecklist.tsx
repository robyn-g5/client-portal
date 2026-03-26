'use client'

import { useState, useTransition } from 'react'
import { updatePrepItemStatus, createPrepItem } from '@/lib/actions/prep'
import { UploadButton } from '@/components/forms/UploadButton'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, FileText, Loader2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import type { PropertyPrepItem } from '@/lib/types/database'

interface PrepChecklistProps {
  items: PropertyPrepItem[]
  propertyId: string
  canEdit?: boolean
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-600' },
    in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  }[status] || { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

function PrepItemRow({
  item,
  propertyId,
  canEdit,
}: {
  item: PropertyPrepItem
  propertyId: string
  canEdit: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const hasFiles = item.property_prep_files && item.property_prep_files.length > 0

  function handleStatusChange(newStatus: 'not_started' | 'in_progress' | 'completed') {
    startTransition(async () => {
      await updatePrepItemStatus(propertyId, item.id, newStatus)
    })
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[#E2E8F0] transition-colors',
        item.status === 'completed' && 'opacity-80'
      )}
    >
      {/* Header row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'text-sm font-medium',
                  item.status === 'completed' ? 'text-[#64748B] line-through' : 'text-[#1E2D3B]'
                )}
              >
                {item.label}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-[#64748B] mt-0.5">{item.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusBadge status={item.status} />

            {canEdit && (
              <div className="relative">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#64748B]" />
                ) : (
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        e.target.value as 'not_started' | 'in_progress' | 'completed'
                      )
                    }
                    className="text-xs border border-[#E2E8F0] rounded-md px-2 py-1 text-[#64748B] bg-white cursor-pointer hover:border-[#3D4F5C] transition-colors"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload zone — always visible */}
      <div className="px-4 pb-4">
        <UploadButton
          propertyId={propertyId}
          prepItemId={item.id}
          label="Upload document"
        />
      </div>

      {/* Uploaded files — toggle */}
      {hasFiles && (
        <div className="border-t border-[#E2E8F0]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#64748B] hover:text-[#1E2D3B] transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <FileText className="h-3.5 w-3.5" />
            {item.property_prep_files!.length} uploaded file{item.property_prep_files!.length !== 1 ? 's' : ''}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-2">
              {item.property_prep_files!.map((file) => (
                <a
                  key={file.id}
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#3D4F5C] hover:text-[#6DBF3A] transition-colors"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{file.file_name}</span>
                  <span className="text-xs text-[#64748B] flex-shrink-0">
                    {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {item.notes && (
        <div className="border-t border-[#E2E8F0] px-4 py-3">
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-[#1E2D3B]">{item.notes}</p>
        </div>
      )}
    </div>
  )
}

function AddDocumentForm({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!label.trim()) return
    const formData = new FormData()
    formData.set('label', label.trim())
    formData.set('isRequired', 'false')
    startTransition(async () => {
      await createPrepItem(propertyId, formData)
      setLabel('')
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E2D3B] transition-colors mt-2"
      >
        <Plus className="h-4 w-4" />
        Add document
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Document name..."
        autoFocus
        className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
      />
      <button
        type="submit"
        disabled={!label.trim() || isPending}
        className="px-3 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setLabel('') }}
        className="p-2 text-[#64748B] hover:text-[#1E2D3B] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  )
}

export function PrepChecklist({ items, propertyId, canEdit = false }: PrepChecklistProps) {
  const completedCount = items.filter((i) => i.status === 'completed').length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div>
      {/* Section Heading */}
      <h2 className="text-lg font-semibold text-[#1E2D3B] mb-4">Listing Documents</h2>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#1E2D3B]">Overall Progress</span>
          <span className="text-sm font-semibold text-[#3D4F5C]">
            {completedCount}/{totalCount} items
          </span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6DBF3A] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#64748B] mt-1">{progress}% complete</p>
      </div>

      {/* All Items */}
      {items.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-3">
            Property Documents
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <PrepItemRow
                key={item.id}
                item={item}
                propertyId={propertyId}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center mb-4">
          <p className="text-[#64748B] text-sm">No documents yet. Add documents below or ask your agent.</p>
        </div>
      )}

      <AddDocumentForm propertyId={propertyId} />
    </div>
  )
}
