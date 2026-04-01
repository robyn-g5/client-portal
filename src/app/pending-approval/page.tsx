import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { logout } from '@/lib/actions/auth'

async function handleLogout() {
  'use server'
  await logout()
}

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="iMuskoka Properties"
            width={280}
            height={60}
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-7 w-7 text-amber-600" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-[#1E2D3B] mb-2">Account pending approval</h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Your account has been created and is waiting for admin approval. You will be able to
            sign in once your account is activated.
          </p>

          <p className="text-xs text-[#64748B] mt-4">
            Questions?{' '}
            <a
              href="mailto:robyn@imuskoka.com"
              className="text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
            >
              Contact robyn@imuskoka.com
            </a>
          </p>

          <form action={handleLogout} className="mt-6">
            <button
              type="submit"
              className="text-xs text-[#64748B] hover:text-[#1E2D3B] transition-colors underline underline-offset-2"
            >
              Sign out
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          <Link
            href="/login"
            className="text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
