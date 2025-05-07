import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"

// Definisi tipe untuk token
interface CustomToken {
  name?: string | null
  email?: string | null
  role?: string
  exp?: number
  [key: string]: unknown
}

// Konfigurasi rute yang memerlukan autentikasi berdasarkan role
const roleBasedRoutes = {
  super_admin: ["/dashboard", "/users", "/settings"],
  instructor: ["/instructor", "/courses", "/enrollments"],
  participant: ["/participant", "/my-courses", "/profile"],
}

// Konfigurasi rute publik yang tidak memerlukan autentikasi
const publicRoutes = ["/", "/login", "/register", "/api/auth"]

// Helper function untuk memeriksa apakah rute saat ini adalah rute publik
const isPublicRoute = (path: string) => {
  return publicRoutes.some((route) => path.startsWith(route))
}

// Helper function untuk memeriksa apakah pengguna memiliki akses ke rute
const hasRouteAccess = (userRole: string, path: string) => {
  const allowedRoutes = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes] || []
  return allowedRoutes.some((route) => path.startsWith(route))
}

export default async function middleware(request: NextRequestWithAuth) {
  const path = request.nextUrl.pathname
  
  // Izinkan akses ke rute publik
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }

  try {
    // Dapatkan token dan informasi pengguna dengan timeout
    const tokenPromise = getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as Promise<CustomToken | null>

    // Tambahkan timeout 5 detik untuk mendapatkan token
    const token = await Promise.race([
      tokenPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Token retrieval timeout")), 5000)
      )
    ]) as CustomToken | null

    // Jika tidak ada token atau token expired, redirect ke login
    if (!token || !token.exp || Date.now() >= token.exp * 1000) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(loginUrl)
    }

    // Dapatkan role pengguna dari token
    const userRole = token.role

    // Jika tidak ada role, redirect ke login
    if (!userRole) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(loginUrl)
    }

    // Periksa apakah pengguna memiliki akses ke rute
    if (!hasRouteAccess(userRole, path)) {
      // Redirect ke halaman default berdasarkan role
      const defaultRoute = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes]?.[0] || "/"
      return NextResponse.redirect(new URL(defaultRoute, request.url))
    }

    // Tambahkan headers keamanan
    const response = NextResponse.next()
    
    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "DENY")
    
    // Enable XSS protection
    response.headers.set("X-XSS-Protection", "1; mode=block")
    
    // Prevent MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff")
    
    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    )

    // Strict Transport Security
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    )

    // Referrer Policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    // Cache Control - Prevent caching of authenticated pages
    response.headers.set("Cache-Control", "no-store, max-age=0")
    response.headers.set("Pragma", "no-cache")

    return response
  } catch (error) {
    // Jika terjadi error atau timeout, redirect ke login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }
}

// Konfigurasi matcher untuk Next.js
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js system files)
     * 3. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!api/auth|_next|favicon.ico|sitemap.xml).*)",
  ],
} 