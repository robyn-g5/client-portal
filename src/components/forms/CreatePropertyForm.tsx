'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProperty } from '@/lib/actions/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, User, Home, KeyRound } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#3D4F5C] hover:bg-[#2d3d49] text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating property...
        </>
      ) : (
        'Create Client & Property'
      )}
    </Button>
  )
}

export function CreatePropertyForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleAction(formData: FormData) {
    setError(null)
    const result = await createProperty(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleAction} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Client Details */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="h-5 w-5 text-[#6DBF3A]" />
          <h2 className="text-base font-semibold text-[#1E2D3B]">Client Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Full Name *</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="Jane Smith"
              required
              className="border-[#E2E8F0]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">Email Address *</Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              placeholder="jane@example.com"
              required
              className="border-[#E2E8F0]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientPhone">Phone Number</Label>
            <Input
              id="clientPhone"
              name="clientPhone"
              type="tel"
              placeholder="(705) 555-0100"
              className="border-[#E2E8F0]"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="initialPassword" className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#6DBF3A]" />
              Initial Password *
            </Label>
            <Input
              id="initialPassword"
              name="initialPassword"
              type="password"
              placeholder="Min. 8 characters — client uses this to log in"
              required
              minLength={8}
              className="border-[#E2E8F0]"
            />
            <p className="text-xs text-[#64748B]">
              Set a temporary password. Share it with the client so they can sign in. They can change it after logging in.
            </p>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Home className="h-5 w-5 text-[#6DBF3A]" />
          <h2 className="text-base font-semibold text-[#1E2D3B]">Property Information</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="propertyTitle">Property Title *</Label>
            <Input
              id="propertyTitle"
              name="propertyTitle"
              placeholder="e.g., Lakefront Cottage on Lake Muskoka"
              required
              className="border-[#E2E8F0]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="propertyAddress">Full Address *</Label>
            <Input
              id="propertyAddress"
              name="propertyAddress"
              placeholder="123 Muskoka Lakes Rd, Bracebridge, ON P1L 1A1"
              required
              className="border-[#E2E8F0]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="propertyStatus">Initial Status</Label>
            <select
              id="propertyStatus"
              name="propertyStatus"
              defaultValue="draft"
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 focus:border-[#3D4F5C] text-[#1E2D3B]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="conditional">Conditional</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-700">
          A client account will be created with the email and password you supply. Share their login credentials securely. The default prep checklist will be attached automatically.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
