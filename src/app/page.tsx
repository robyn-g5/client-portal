import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/auth'

export default async function RootPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile()

  if (profile?.role === 'agent') {
    redirect('/admin')
  }

  redirect('/properties')
}
