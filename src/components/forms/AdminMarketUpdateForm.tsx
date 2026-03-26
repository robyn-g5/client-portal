'use client'

import { useState, useRef, useTransition } from 'react'
import { RichTextEditor } from '@/components/forms/RichTextEditor'
import { Loader2 } from 'lucide-react'

interface Props {
  onCreate: (formData: FormData) => Promise<void>
}

export function AdminMarketUpdateForm({ onCreate }: Props) {
  const [bodyHtml, setBodyHtml] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!bodyHtml || bodyHtml === '<p></p>') {
      setFormError('Body content is required.')
      return
    }
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('body', bodyHtml)
    startTransition(async () => {
      await onCreate(formData)
      formRef.current?.reset()
      setBodyHtml('')
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {formError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1E2D3B]">Title *</label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g., Muskoka Market Report — Q1 2026"
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1E2D3B]">Body *</label>
        <RichTextEditor
          content={bodyHtml}
          onChange={setBodyHtml}
          placeholder="Write your market update here..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1E2D3B]">Attachment URL (optional)</label>
        <input
          type="url"
          name="attachmentUrl"
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-[#6DBF3A] text-white rounded-lg text-sm font-medium hover:bg-[#5aad2f] transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? 'Publishing…' : 'Publish Update'}
      </button>
    </form>
  )
}
