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
    '/participant'
  ]

  // Daftar rute untuk instructor
  const instructorRoutes = [
    '/instructure/dashboard',
    '/instructure/courses', 
    '/instructure/students', 
    '/instructure/assignment'
  ]

  // Daftar rute untuk participant
  const participantRoutes = [
    '/participant/dashboard',
    '/participant/my-course',
    '/participant/my-certificate',
    '/participant/payment'
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
    if (!userType) {
      console.error('User type tidak ditemukan dalam token:', token)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Cek akses berdasarkan userType
    if (userType === 'admin') {
      // Admin dapat mengakses semua rute admin
      if (!adminRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } else if (userType === 'instructor') {
      // Instructor hanya boleh akses rute instructor
      if (!instructorRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL("/instructure/dashboard", request.url))
      }
    } else if (userType === 'participant') {
      // Participant hanya boleh akses rute participant
      if (!participantRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL("/participant/dashboard", request.url))
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
    "/dashboard/:path*",    // Rute dashboard dan sub-routenya
    "/user/:path*",         // Manajemen pengguna
    "/usertype/:path*",     // Tipe pengguna
    "/user-rule/:path*",    // Aturan pengguna
    "/instructure/:path*",  // Halaman manajemen instructor
    "/instructor/:path*",   // Dashboard instructor
    "/courses/:path*",      // Manajemen kursus
    "/course-type/:path*",  // Tipe kursus
    "/course-schedule/:path*", // Jadwal kursus
    "/payment-report/:path*",  // Laporan pembayaran
    "/list-certificate/:path*", // Daftar sertifikat
    "/certificate-expired/:path*", // Sertifikat kadaluarsa
    "/participant/:path*",    // Manajemen peserta
    "/my-course/:path*",     // Halaman kursus participant
    "/my-certificate/:path*", // Halaman sertifikat participant
    "/payment/:path*"        // Halaman pembayaran participant
  ]
} 