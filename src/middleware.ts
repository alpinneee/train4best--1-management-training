import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"

// Definisi tipe untuk token
interface CustomToken {
  id?: string
  name?: string | null
  email?: string | null
  userType?: string
  exp?: number
  [key: string]: unknown
}

export default async function middleware(request: NextRequestWithAuth) {
  const path = request.nextUrl.pathname

  // Daftar rute yang hanya bisa diakses oleh admin
  const adminRoutes = [
    '/dashboard',
    '/user',
    '/usertype',
    '/user-rule',
    '/instructure', // Halaman manajemen instructor
    '/courses',
    '/course-type',
    '/course-schedule',
    '/payment-report',
    '/list-certificate',
    '/certificate-expired',
    '/participant' // Halaman admin untuk mengelola participants
  ]

  // Daftar rute untuk participant (user yang terdaftar sebagai peserta)
  const participantRoutes = [
    '/participant/dashboard',
    '/participant/my-course',
    '/participant/my-certificate',
    '/participant/payment'
  ]

  // Daftar rute untuk instructor
  const instructorRoutes = [
    '/instructure/dashboard',
    '/instructure/courses', 
    '/instructure/students', 
    '/instructure/assignment'
  ]

  // Daftar rute publik
  const publicRoutes = [
    "/", 
    "/login", 
    "/register", 
    "/api/auth", 
    "/_next", 
    "/favicon.ico", 
    "/img"
  ]

  // Izinkan akses ke rute publik
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    // Cek token NextAuth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as CustomToken | null

    // Jika tidak ada token, redirect ke login
    if (!token) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("next-auth.callback-url")
      response.cookies.delete("next-auth.csrf-token")
      return response
    }

    // Cek expiry token
    if (token.exp && Date.now() >= token.exp * 1000) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("next-auth.callback-url")
      response.cookies.delete("next-auth.csrf-token")
      return response
    }

    const userType = token.userType
    // Logging untuk debug
    console.log('Middleware check:', path, 'Role:', userType);
    if (!userType) {
      console.error('User type tidak ditemukan dalam token:', token)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Implementasi logika akses sesuai role
    if (userType === 'admin') {
      // Admin hanya boleh akses adminRoutes dan /participant (tanpa subpath)
      if (
        !adminRoutes.some(route => path === route || path.startsWith(route + '/'))
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      // Admin tidak boleh akses dashboard participant
      if (
        path === '/participant/dashboard' ||
        path.startsWith('/participant/my-course') ||
        path.startsWith('/participant/my-certificate') ||
        path.startsWith('/participant/payment')
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } else if (userType === 'participant') {
      // Participant tidak boleh akses adminRoutes - cek ini duluan
      if (adminRoutes.some(route => path === route || path.startsWith(route + '/'))) {
        return NextResponse.redirect(new URL("/participant/dashboard", request.url))
      }

      // Participant hanya boleh akses rute yang sudah ditentukan
      if (!participantRoutes.some(route => path === route || path.startsWith(route + '/'))) {
        return NextResponse.redirect(new URL("/participant/dashboard", request.url))
      }
    } else if (userType === 'instructor') {
      // Instructor tidak boleh akses adminRoutes
      if (adminRoutes.some(route => path === route || path.startsWith(route + '/'))) {
        return NextResponse.redirect(new URL("/instructure/dashboard", request.url))
      }
      // Instructor hanya boleh akses instructorRoutes
      if (!instructorRoutes.some(route => path === route || path.startsWith(route + '/'))) {
        return NextResponse.redirect(new URL("/instructure/dashboard", request.url))
      }
    } else {
      // UserType tidak valid
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Akses diizinkan, tambahkan header keamanan
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("X-Content-Type-Options", "nosniff")
    
    return response
  } catch (error) {
    console.error(`Error dalam middleware:`, error)
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("next-auth.callback-url")
    response.cookies.delete("next-auth.csrf-token")
    return response
  }
}

// Konfigurasi rute yang akan diproteksi oleh middleware
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/user/:path*",
    "/usertype/:path*",
    "/user-rule/:path*",
    "/instructure/:path*",
    "/instructor/:path*",
    "/courses/:path*",
    "/course-type/:path*",
    "/course-schedule/:path*",
    "/payment-report/:path*",
    "/list-certificate/:path*",
    "/certificate-expired/:path*",
    "/participant",
    "/participant/:path*",
    "/my-course/:path*",
    "/my-certificate/:path*",
    "/payment/:path*"
  ]
} 