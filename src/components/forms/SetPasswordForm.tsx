'use client'

import { useState, useTransition } from 'react'
import { setClientPassword } from '@/lib/actions/properties'
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface SetPasswordFormProps {
  clientUserId: string
}

export function SetPasswordForm({ clientUserId }: SetPasswordFormProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await setClientPassword(clientUserId, password)
      if (result?.error) {
        setStatus('error')
        setMessage(result.error)
      } else {
        setStatus('success')
        setMessage('Password updated. Share it securely with the client.')
        setPassword('')
        setTimeout(() => { setOpen(false); setStatus('idle'); setMessage(null) }, 3000)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#3D4F5C] transition-colors"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Reset client password
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4" />
          {message}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min. 8 chars)"
          minLength={8}
          required
          className="flex-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 bg-[#3D4F5C] text-white text-sm rounded-lg hover:bg-[#2d3d49] transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Set
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setPassword(''); setStatus('idle') }}
          className="text-xs text-[#64748B] hover:text-[#1E2D3B]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
