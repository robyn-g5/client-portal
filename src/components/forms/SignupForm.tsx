'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { signup } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#3D4F5C] hover:bg-[#2d3d49] text-white font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        'Create account'
      )}
    </Button>
  )
}

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleAction(formData: FormData) {
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleAction} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-sm font-medium text-[#1E2D3B]">
          Full name
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          className="border-[#E2E8F0] focus-visible:ring-[#3D4F5C]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-[#1E2D3B]">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="border-[#E2E8F0] focus-visible:ring-[#3D4F5C]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-[#1E2D3B]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="border-[#E2E8F0] focus-visible:ring-[#3D4F5C]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#1E2D3B]">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="border-[#E2E8F0] focus-visible:ring-[#3D4F5C]"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
