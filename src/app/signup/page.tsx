import Image from 'next/image'
import Link from 'next/link'
import { SignupForm } from '@/components/forms/SignupForm'

export default function SignupPage() {
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
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#1E2D3B]">Create an account</h1>
            <p className="text-[#64748B] mt-1 text-sm">
              Request access to the agent portal. Your account will be reviewed before activation.
            </p>
          </div>

          <SignupForm />
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
