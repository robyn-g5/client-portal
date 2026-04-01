import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/signup', '/pending-approval']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('client_profiles')
      .select('role, is_approved, is_super_admin')
      .eq('user_id', user.id)
      .single()

    // Authenticated user hitting a public route → redirect to their dashboard
    if (isPublicRoute && pathname !== '/pending-approval') {
      if (profile?.role === 'agent') {
        const url = request.nextUrl.clone()
        if (!profile.is_approved) {
          url.pathname = '/pending-approval'
        } else {
          url.pathname = '/admin'
        }
        return NextResponse.redirect(url)
      } else if (profile?.role === 'client') {
        const url = request.nextUrl.clone()
        url.pathname = '/properties'
        return NextResponse.redirect(url)
      }
    }

    // Unapproved agents can only see /pending-approval
    if (profile?.role === 'agent' && !profile.is_approved && pathname !== '/pending-approval') {
      const url = request.nextUrl.clone()
      url.pathname = '/pending-approval'
      return NextResponse.redirect(url)
    }

    // /admin/agents is super-admin only
    if (pathname.startsWith('/admin/agents') && !profile?.is_super_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // /admin/* is agents only
    if (pathname.startsWith('/admin') && profile?.role !== 'agent') {
      const url = request.nextUrl.clone()
      url.pathname = '/properties'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
