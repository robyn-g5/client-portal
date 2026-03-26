import { requireAgent } from '@/lib/auth'
import { CreatePropertyForm } from '@/components/forms/CreatePropertyForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewPropertyPage() {
  await requireAgent()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/properties"
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E2D3B] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Create New Property</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Set up a new client and property in the portal. The default prep checklist will be seeded automatically.
        </p>
      </div>

      <CreatePropertyForm />
    </div>
  )
}
