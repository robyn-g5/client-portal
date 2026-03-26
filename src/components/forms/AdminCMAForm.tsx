'use client'

import { useState, useRef, useTransition } from 'react'
import { RichTextEditor } from '@/components/forms/RichTextEditor'
import { createCMA } from '@/lib/actions/cma'
import { Loader2, Upload, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminCMAFormProps {
  propertyId: string
}

const ALLOWED_TYPES = ['application/pdf']
const MAX_SIZE_MB = 50

export function AdminCMAForm({ propertyId }: AdminCMAFormProps) {
  const [bodyHtml, setBodyHtml] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfFileName, setPdfFileName] = useState('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function uploadFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only PDF files are allowed.')
      setUploadStatus('error')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File must be under ${MAX_SIZE_MB}MB.`)
      setUploadStatus('error')
      return
    }
    setUploadStatus('uploading')
    setUploadError(null)
    try {
      const supabase = createClient()

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated. Please refresh the page and log in again.')

      const ext = file.name.split('.').pop()
      const path = `cma/${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('property-files')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('property-files').getPublicUrl(data.path)
      setPdfUrl(publicUrl)
      setPdfFileName(file.name)
      setUploadStatus('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      console.error('[AdminCMAForm] upload error:', msg, err)
      setUploadError(msg)
      setUploadStatus('error')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    // Only clear dragging if leaving the drop zone itself, not a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!pdfUrl) {
      setFormError('Please upload a PDF before saving.')
      return
    }
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('body', bodyHtml)
    formData.set('pdfUrl', pdfUrl)
    startTransition(async () => {
      const result = await createCMA(propertyId, formData)
      if (result?.error) {
        setFormError(result.error)
      } else {
        formRef.current?.reset()
        setBodyHtml('')
        setPdfUrl('')
        setPdfFileName('')
        setUploadStatus('idle')
      }
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
          placeholder="e.g., Q1 2026 Comparable Market Analysis"
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1E2D3B]">Commentary *</label>
        <RichTextEditor
          content={bodyHtml}
          onChange={setBodyHtml}
          placeholder="Write your CMA commentary and key findings here..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#1E2D3B]">PDF Report *</label>
        <input
          ref={fileInputRef}
          id="cma-pdf-input"
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="sr-only"
        />
        {uploadStatus === 'done' ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <FileText className="h-4 w-4" />
            <span className="flex-1 truncate">{pdfFileName}</span>
            <button
              type="button"
              onClick={() => { setPdfUrl(''); setPdfFileName(''); setUploadStatus('idle') }}
              className="text-xs text-green-600 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="cma-pdf-input"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg text-sm cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#3D4F5C] bg-[#3D4F5C]/5 text-[#1E2D3B]'
                : 'border-[#E2E8F0] text-[#64748B] hover:border-[#3D4F5C] hover:text-[#1E2D3B]'
            } ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}`}
          >
            {uploadStatus === 'uploading' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span>
              {uploadStatus === 'uploading'
                ? 'Uploading PDF…'
                : isDragging
                  ? 'Drop PDF here'
                  : 'Click to upload or drag and drop a PDF'}
            </span>
            <span className="text-xs text-[#94A3B8]">PDF up to {MAX_SIZE_MB}MB</span>
          </label>
        )}
        {uploadStatus === 'error' && (
          <p className="text-xs text-red-600">{uploadError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || uploadStatus === 'uploading'}
        className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? 'Saving…' : 'Add CMA'}
      </button>
    </form>
  )
}
