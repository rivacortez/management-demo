import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Get the response from updateSession which handles cookies
  const response = await updateSession(request)
  
  // Create a Supabase client to check authentication status
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )
  
  // Get the user from the Supabase client
  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/auth',
    '/auth/callback',
    '/forgot-password',
    '/reset-password'
  ]

  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    // no user, redirect to sign-in page
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}