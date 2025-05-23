import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"
import jwt from "jsonwebtoken"

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
  console.log(`Middleware dipanggil untuk path: ${path}`);

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
    "/api/auth/refresh",
    "/api/profile",
    "/api/direct-login",
    "/api/debug-session",
    "/api/debug-token",
    "/api/logout",
    "/debug-login",
    "/debug-auth",
    "/profile", // Tambahkan profile sebagai rute publik sementara
    "/_next", 
    "/favicon.ico", 
    "/img"
  ]

  // Izinkan akses ke rute publik
  if (publicRoutes.some(route => path.startsWith(route))) {
    console.log(`Path ${path} adalah rute publik, akses diizinkan`);
    return NextResponse.next()
  }

  try {
    let userType = null;
    let hasValidToken = false;

    // Cek cookie debug_token terlebih dahulu
    const debugToken = request.cookies.get("debug_token")?.value
    if (debugToken) {
      console.log(`Debug token ditemukan untuk ${path}`);
      // Tambahkan validasi token debug
      try {
        const decoded = jwt.verify(debugToken, process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT") as jwt.JwtPayload;
        
        if (decoded) {
          console.log(`Debug token valid untuk ${path}, userType:`, decoded.userType);
          userType = decoded.userType as string;
          hasValidToken = true;
        }
      } catch (error) {
        console.error('Debug token invalid:', error);
        // Jangan langsung redirect, coba cek next-auth token dulu
      }
    }

    // Jika tidak ada debug token yang valid, coba cek token NextAuth
    if (!hasValidToken) {
      console.log(`Mencoba verifikasi NextAuth token untuk ${path}`);
      
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT"
      }) as CustomToken | null;
      
      console.log(`NextAuth token untuk ${path}:`, token ? "ditemukan" : "tidak ditemukan");
      
      // Jika token ditemukan, ambil userType
      if (token) {
        userType = token.userType;
        hasValidToken = true;
        console.log(`UserType dari NextAuth token:`, userType);
      }
    }

    // Jika tidak ada token valid, coba refresh token
    if (!hasValidToken) {
      // Redirect ke login
      console.log(`Tidak ada token valid untuk ${path}, redirect ke login`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Cek userType ada atau tidak
    if (!userType) {
      console.error('User type tidak ditemukan dalam token.');
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Cek akses berdasarkan userType
    let hasAccess = false;
    
    if (userType === 'admin') {
      hasAccess = true; // Admin dapat mengakses semua rute
    } else if (userType === 'instructor' && instructorRoutes.some(route => path.startsWith(route))) {
      hasAccess = true;
    } else if (userType === 'participant' && participantRoutes.some(route => path.startsWith(route))) {
      hasAccess = true;
    } else if (userType === 'super_admin') {
      hasAccess = true; // Super admin juga bisa akses semua
    }
    
    if (!hasAccess) {
      console.log(`Pengguna dengan userType ${userType} tidak memiliki akses ke ${path}`);
      // Redirect ke dashboard sesuai dengan userType
      let redirectPath = '/dashboard';
      if (userType === 'instructor') redirectPath = '/instructure/dashboard';
      if (userType === 'participant') redirectPath = '/participant/dashboard';
      
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Akses diizinkan, tambahkan header keamanan
    console.log(`Akses diizinkan untuk ${path} dengan userType ${userType}`);
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    
    return response;
  } catch (error) {
    console.error(`Error dalam middleware untuk ${path}:`, error);
    // Jangan langsung redirect ke login, coba refresh token dulu
    try {
      // Coba refresh token via cookie
      const response = NextResponse.redirect(new URL("/api/auth/refresh?redirect=" + encodeURIComponent(path), request.url));
      return response;
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
      // Jika gagal refresh, baru redirect ke login
      return NextResponse.redirect(new URL("/login", request.url));
    }
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