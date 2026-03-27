import Image from 'next/image'
import { LoginForm } from '@/components/forms/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="iMuskoka Properties"
            width={220}
            height={60}
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#1E2D3B]">Welcome back</h1>
            <p className="text-[#64748B] mt-1 text-sm">
              Sign in to access your property portal
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Need access?{' '}
          <a
            href="mailto:info@imuskoka.com"
            className="text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
          >
            Contact your agent
          </a>
        </p>
      </div>
    </div>
  )
}
