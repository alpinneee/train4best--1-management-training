import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"
import jwt from "jsonwebtoken"

// Fungsi untuk logging
function logDebug(message: string, data?: any) {
  console.log(`[MIDDLEWARE] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Daftar rute publik yang tidak memerlukan autentikasi
const publicRoutes = [
  "/", 
  "/login", 
  "/register", 
  "/api/auth", 
  "/api/auth/refresh",
  "/api/auth/session-check",
  "/api/profile",
  "/api/direct-login",
  "/api/debug-session",
  "/api/debug-token",
  "/api/logout",
  "/api/admin-auth-bypass",
  "/api/dashboard-access",
  "/api/dashboard-verify",
  "/api/direct-dashboard",
  "/api/dashboard",
  "/api/force-login",
  "/debug-login",
  "/debug-auth",
  "/admin-login",
  "/admin-dashboard",
  "/participant-dashboard",
  "/instructure-dashboard",
  "/dashboard-access",
  "/dashboard-direct",
  "/dashboard-static",
  "/dashboard-bypass",
  "/dashboard-final",
  "/dashboard-fix",
  "/force-dashboard",
  "/_next", 
  "/favicon.ico", 
  "/img"
];

// Rute yang hanya bisa diakses admin
const adminRoutes = [
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
  '/participant',
  '/dashboard'  // Admin boleh mengakses dashboard
];

// Rute untuk instructor
const instructorRoutes = [
  '/instructure/dashboard',
  '/instructure/courses', 
  '/instructure/students', 
  '/instructure/assignment'
];

// Rute untuk participant
const participantRoutes = [
  '/participant/dashboard',
  '/participant/my-course',
  '/participant/my-certificate',
  '/participant/payment'
];

export default async function middleware(request: NextRequestWithAuth) {
  const path = request.nextUrl.pathname;
  logDebug(`Middleware dipanggil untuk path: ${path}`);

  // Izinkan akses ke rute publik tanpa autentikasi
  if (publicRoutes.some(route => path.startsWith(route))) {
    logDebug(`Path ${path} adalah rute publik, akses diizinkan`);
    return NextResponse.next();
  }

  try {
    // Cek apakah ini adalah percobaan login berulang untuk mencegah loop
    const isRedirectLoop = request.cookies.get("redirect_attempt")?.value === "true";
    if (isRedirectLoop) {
      logDebug(`Terdeteksi redirect loop untuk ${path}, membersihkan cookies dan melanjutkan`);
      const response = NextResponse.next();
      response.cookies.set("redirect_attempt", "", { maxAge: 0 });
      return response;
    }

    // Cek token dari berbagai sumber
    const adminToken = request.cookies.get("admin_token")?.value;
    const dashboardToken = request.cookies.get("dashboard_token")?.value;
    const debugToken = request.cookies.get("debug_token")?.value;
    
    // Coba verifikasi token
    const secret = process.env.NEXTAUTH_SECRET || "ee242735312254106fe3e96a49c7439e224a303ff71c148eee211ee52b6df1719d261fbf28697c6375bfa1ff473b328d31659d6308da93ea03ae630421a8024e";
    let userType = null;
    let userId = null;
    let userEmail = null;

    // Cek semua token yang tersedia
    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, secret) as jwt.JwtPayload;
        if (decoded) {
          logDebug(`Admin token valid`);
          userType = "Admin";
          userId = decoded.id;
          userEmail = decoded.email;
        }
      } catch (error) {
        logDebug(`Admin token invalid: ${(error as Error).message}`);
      }
    }

    if (!userType && dashboardToken) {
      try {
        const decoded = jwt.verify(dashboardToken, secret) as jwt.JwtPayload;
        if (decoded) {
          logDebug(`Dashboard token valid`);
          userType = decoded.userType;
          userId = decoded.id;
          userEmail = decoded.email;
        }
      } catch (error) {
        logDebug(`Dashboard token invalid: ${(error as Error).message}`);
      }
    }

    if (!userType && debugToken) {
      try {
        const decoded = jwt.verify(debugToken, secret) as jwt.JwtPayload;
        if (decoded) {
          logDebug(`Debug token valid`);
          userType = decoded.userType;
          userId = decoded.id;
          userEmail = decoded.email;
        }
      } catch (error) {
        logDebug(`Debug token invalid: ${(error as Error).message}`);
      }
    }

    if (!userType) {
      try {
        const token = await getToken({ 
          req: request,
          secret: secret
        });
        
        if (token) {
          logDebug(`NextAuth token valid`);
          userType = token.userType as string;
          userId = token.id as string;
          userEmail = token.email as string;
        }
      } catch (error) {
        logDebug(`Error saat verifikasi NextAuth token: ${(error as Error).message}`);
      }
    }

    // Jika tidak ada token valid, redirect ke login
    if (!userType) {
      logDebug(`Tidak ada token valid untuk ${path}, redirect ke login`);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("redirect_attempt", "true", { maxAge: 60 });
      return response;
    }

    // Verifikasi akses berdasarkan userType
    const userTypeLower = typeof userType === 'string' ? userType.toLowerCase() : '';
    logDebug(`User type: ${userTypeLower}, path: ${path}`);

    // Cek akses berdasarkan tipe pengguna
    if (userTypeLower === 'admin') {
      // Admin dapat mengakses semua rute admin
      if (adminRoutes.some(route => path.startsWith(route))) {
        logDebug(`Admin mengakses rute admin: ${path}, akses diizinkan`);
        return NextResponse.next();
      }
    } else if (userTypeLower === 'instructure') {
      // Instructor hanya dapat mengakses rute instructor
      if (instructorRoutes.some(route => path.startsWith(route))) {
        logDebug(`Instructor mengakses rute instructor: ${path}, akses diizinkan`);
        return NextResponse.next();
      }
    } else if (userTypeLower === 'participant') {
      // Participant hanya dapat mengakses rute participant
      if (participantRoutes.some(route => path.startsWith(route))) {
        logDebug(`Participant mengakses rute participant: ${path}, akses diizinkan`);
        return NextResponse.next();
      }
    }

    // Jika tidak memiliki akses yang sesuai, redirect ke dashboard berdasarkan userType
    let redirectPath = '/dashboard-static';
    if (userTypeLower === 'admin') redirectPath = '/dashboard';
    if (userTypeLower === 'instructure') redirectPath = '/instructure-dashboard';
    if (userTypeLower === 'participant') redirectPath = '/participant-dashboard';

    logDebug(`User ${userTypeLower} tidak memiliki akses ke ${path}, redirect ke ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    logDebug(`Error dalam middleware: ${(error as Error).message}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Konfigurasi rute yang akan diproteksi oleh middleware
export const config = {
  matcher: [
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