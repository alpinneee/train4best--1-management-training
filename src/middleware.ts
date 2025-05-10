import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  
  // Jika tidak ada token, redirect ke halaman login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const role = token.role as string
  const path = request.nextUrl.pathname

  // Daftar rute yang hanya bisa diakses oleh super_admin
  const superAdminRoutes = [
    '/dashboard',
    '/user',
    '/usertype',
    '/user-rule',
    '/instructure', // Halaman manajemen instructor (khusus super admin)
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
    '/instructure/dashboard', // Dashboard khusus instructor
    '/instructure/courses', 
    '/instructure/students', 
    '/instructure/assignment', 
  ]

  // Daftar rute untuk participant
  const participantRoutes = [
    '/participant/dashboard',
    '/participant/my-course',           // Halaman kursus participant
    '/participant/my-certificate',      // Halaman sertifikat participant
    '/participant/payment'             // Halaman pembayaran participant
  ]

  // Cek apakah path saat ini termasuk dalam rute yang dilindungi
  const isSuperAdminRoute = superAdminRoutes.some(route => path.startsWith(route))
  const isInstructorRoute = instructorRoutes.some(route => path.startsWith(route))
  const isParticipantRoute = participantRoutes.some(route => path.startsWith(route))

  // Pengecekan akses berdasarkan role
  if (role === "instructor") {
    // Instructor hanya boleh akses rute instructor dashboard
    if (!isInstructorRoute) {
      return NextResponse.redirect(new URL("/instructure/dashboard", request.url))
    }
  } else if (role === "participant") {
    // Participant hanya boleh akses rute participant
    if (!isParticipantRoute) {
      return NextResponse.redirect(new URL("/participant/dashboard", request.url))
    }
  } else if (role === "super_admin") {
    // Super admin boleh akses semua rute
    return NextResponse.next()
  } else {
    // Role lain tidak diizinkan
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Konfigurasi rute yang akan diproteksi oleh middleware
export const config = {
  matcher: [
    "/dashboard/:path*",    // Rute dashboard dan sub-routenya
    "/user/:path*",         // Manajemen pengguna
    "/usertype/:path*",     // Tipe pengguna
    "/user-rule/:path*",    // Aturan pengguna
    "/instructure/:path*",  // Halaman manajemen instructor (super admin)
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