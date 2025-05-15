import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"
import jwt from "jsonwebtoken"

// Definisi tipe untuk token
interface CustomToken {
  name?: string | null
  email?: string | null
  userType?: string
  exp?: number
  [key: string]: unknown
}

// Konfigurasi rute publik yang tidak memerlukan autentikasi
const publicRoutes = [
  "/", 
  "/login", 
  "/debug-login", 
  "/debug-auth",
  "/register", 
  "/api/auth", 
  "/api/debug-token",
  "/_next", 
  "/favicon.ico", 
  "/img"
]

// Helper function untuk memeriksa apakah rute saat ini adalah rute publik
const isPublicRoute = (path: string) => {
  return publicRoutes.some((route) => path.startsWith(route))
}

export default async function middleware(request: NextRequestWithAuth) {
  const path = request.nextUrl.pathname
  
  // Izinkan akses ke rute publik
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }

  try {
    // Cek cookie debug_token terlebih dahulu
    const debugToken = request.cookies.get("debug_token")?.value
    if (debugToken) {
      // Tambahkan validasi token debug
      try {
        const decoded = await jwt.verify(debugToken, process.env.NEXTAUTH_SECRET || "rahasia_debug")
        if (decoded) {
          return NextResponse.next()
        }
      } catch (error) {
        console.error('Debug token invalid:', error)
        // Hapus cookie debug_token yang invalid
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("debug_token")
        return response
      }
    }

    // Cek token NextAuth jika tidak ada debug token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as CustomToken | null

    console.log("NextAuth token in middleware:", token);

    // Jika tidak ada token, redirect ke login
    if (!token) {
      console.log("No token found, redirecting to login");
      const response = NextResponse.redirect(new URL("/login", request.url))
      // Hapus semua cookie auth yang mungkin invalid
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("next-auth.callback-url")
      response.cookies.delete("next-auth.csrf-token")
      return response
    }

    // Cek expiry token
    if (token.exp && Date.now() >= token.exp * 1000) {
      console.log("Token expired, redirecting to login");
      const response = NextResponse.redirect(new URL("/login", request.url))
      // Hapus semua cookie auth yang expired
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("next-auth.callback-url")
      response.cookies.delete("next-auth.csrf-token")
      return response
    }

    // Akses diizinkan, tambahkan header keamanan
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("X-Content-Type-Options", "nosniff")
    
    return response
  } catch (error) {
    // Jika terjadi error, redirect ke login dan hapus semua cookie
    console.error(`Error dalam middleware:`, error)
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("next-auth.callback-url")
    response.cookies.delete("next-auth.csrf-token")
    response.cookies.delete("debug_token")
    return response
  }
}

// Konfigurasi matcher untuk Next.js - hanya dashboard, usertype, dan admin routes yang dilindungi
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/instructure/:path*",
    "/participant/:path*",
    "/user/:path*",
    "/usertype/:path*",
    "/settings/:path*"
  ],
} 