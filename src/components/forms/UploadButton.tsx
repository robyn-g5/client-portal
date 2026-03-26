'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { addPrepFile } from '@/lib/actions/prep'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadButtonProps {
  propertyId: string
  prepItemId: string
  label?: string
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_SIZE_MB = 20

export function UploadButton({ propertyId, prepItemId, label = 'Upload file' }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLLabelElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Prevent the browser from opening dropped files as a new page
  useEffect(() => {
    function preventDefaults(e: DragEvent) {
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('dragover', preventDefaults)
    window.addEventListener('drop', preventDefaults)
    return () => {
      window.removeEventListener('dragover', preventDefaults)
      window.removeEventListener('drop', preventDefaults)
    }
  }, [])

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('File type not supported. Please upload a PDF, image, or Word document.')
      setStatus('error')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File size exceeds ${MAX_SIZE_MB}MB limit.`)
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `prep/${propertyId}/${prepItemId}/${fileName}`

      const { data, error } = await supabase.storage
        .from('property-files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (error) throw new Error(`Storage error: ${error.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('property-files')
        .getPublicUrl(data.path)

      startTransition(async () => {
        const result = await addPrepFile(propertyId, prepItemId, file.name, publicUrl)
        if (result?.error) {
          setStatus('error')
          setErrorMsg(`Save error: ${result.error}`)
        } else {
          setStatus('success')
          setTimeout(() => setStatus('idle'), 3000)
        }
      })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    // Only clear dragging if leaving the drop zone itself (not a child)
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const isLoading = status === 'uploading' || isPending

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        File uploaded successfully
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
        <button
          onClick={() => { setStatus('idle'); setErrorMsg(null) }}
          className="text-xs text-[#3D4F5C] underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <label
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'block border-2 border-dashed rounded-lg px-4 py-3 text-center transition-colors cursor-pointer',
        isDragging
          ? 'border-[#6DBF3A] bg-green-50'
          : 'border-[#E2E8F0] hover:border-[#3D4F5C]/30',
        isLoading && 'pointer-events-none'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-[#64748B]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      ) : (
        <>
          <p className="text-xs text-[#64748B] mb-2">
            {isDragging ? 'Drop file here' : 'Drag & drop or'}
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3D4F5C] hover:text-[#6DBF3A] transition-colors">
            <Upload className="h-3.5 w-3.5" />
            {label}
          </span>
        </>
      )}
    </label>
  )
}
