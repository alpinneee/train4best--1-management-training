import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Fungsi untuk logging
function logDebug(message: string, data?: any) {
  console.log(`[DASHBOARD-API] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Data fallback jika database tidak tersedia
const fallbackTrainingData = [
  { name: "Jan", value: 15 },
  { name: "Feb", value: 20 },
  { name: "Mar", value: 25 },
  { name: "Apr", value: 18 },
  { name: "May", value: 30 },
  { name: "Jun", value: 22 },
  { name: "Jul", value: 35 },
  { name: "Aug", value: 28 },
  { name: "Sep", value: 32 },
  { name: "Oct", value: 40 },
  { name: "Nov", value: 38 },
  { name: "Dec", value: 45 },
];

const fallbackCertificationTypeData = [
  { name: "Technical", value: 45 },
  { name: "Soft Skills", value: 30 },
  { name: "Leadership", value: 25 },
];

const fallbackUpcomingTrainings = [
  {
    title: "Web Development Fundamentals",
    date: "2024-03-25",
    trainer: "John Doe",
  },
  {
    title: "Advanced JavaScript", 
    date: "2024-03-28",
    trainer: "Jane Smith",
  },
  {
    title: "Project Management",
    date: "2024-04-01", 
    trainer: "Mike Johnson",
  },
];

export async function GET(req: Request) {
  try {
    logDebug('Dashboard API called');
    
    // Verifikasi autentikasi
    const cookieStore = cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    const dashboardToken = cookieStore.get("dashboard_token")?.value;
    const debugToken = cookieStore.get("debug_token")?.value;
    const sessionToken = cookieStore.get("next-auth.session-token")?.value;
    
    logDebug(`Cookies: adminToken=${!!adminToken}, dashboardToken=${!!dashboardToken}, debugToken=${!!debugToken}, sessionToken=${!!sessionToken}`);
    
    // Coba verifikasi token
    const secret = process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT";
    let userData = null;
    
    // Cek semua token yang tersedia
    const tokens = [adminToken, dashboardToken, debugToken, sessionToken].filter(Boolean);
    
    for (const token of tokens) {
      try {
        const decoded = verify(token as string, secret) as any;
        if (decoded) {
          logDebug("Token valid");
          userData = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            userType: decoded.userType || "User"
          };
          break;
        }
      } catch (error) {
        logDebug(`Token invalid: ${(error as Error).message}`);
      }
    }
    
    // Jika tidak ada token valid, kembalikan error
    if (!userData) {
      logDebug("No valid token found");
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }
    
    // Coba ambil data dari database
    let trainingData = fallbackTrainingData;
    let certificationTypeData = fallbackCertificationTypeData;
    let upcomingTrainings = fallbackUpcomingTrainings;
    
    try {
      // Ambil data training berdasarkan bulan
      const currentYear = new Date().getFullYear();
      const registrations = await prisma.registration.findMany({
        where: {
          createdAt: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`)
          }
        },
        include: {
          class: true
        }
      });
      
      // Hitung jumlah registrasi per bulan
      const registrationsByMonth = Array(12).fill(0);
      registrations.forEach(reg => {
        const month = new Date(reg.createdAt).getMonth();
        registrationsByMonth[month]++;
      });
      
      // Format data untuk chart
      trainingData = [
        { name: "Jan", value: registrationsByMonth[0] || 0 },
        { name: "Feb", value: registrationsByMonth[1] || 0 },
        { name: "Mar", value: registrationsByMonth[2] || 0 },
        { name: "Apr", value: registrationsByMonth[3] || 0 },
        { name: "May", value: registrationsByMonth[4] || 0 },
        { name: "Jun", value: registrationsByMonth[5] || 0 },
        { name: "Jul", value: registrationsByMonth[6] || 0 },
        { name: "Aug", value: registrationsByMonth[7] || 0 },
        { name: "Sep", value: registrationsByMonth[8] || 0 },
        { name: "Oct", value: registrationsByMonth[9] || 0 },
        { name: "Nov", value: registrationsByMonth[10] || 0 },
        { name: "Dec", value: registrationsByMonth[11] || 0 },
      ];
      
      // Ambil data sertifikat berdasarkan tipe kursus
      const certificates = await prisma.certificate.findMany({
        include: {
          registration: {
            include: {
              class: {
                include: {
                  course: true
                }
              }
            }
          }
        }
      });
      
      // Hitung sertifikat berdasarkan tipe kursus
      const certByType: Record<string, number> = {};
      certificates.forEach(cert => {
        const courseType = cert.registration.class.course.course_type || "Unknown";
        certByType[courseType] = (certByType[courseType] || 0) + 1;
      });
      
      // Format data untuk chart
      certificationTypeData = Object.entries(certByType).map(([name, value]) => ({
        name,
        value
      }));
      
      // Jika tidak ada data, gunakan fallback
      if (certificationTypeData.length === 0) {
        certificationTypeData = fallbackCertificationTypeData;
      }
      
      // Ambil kelas yang akan datang
      const upcomingClasses = await prisma.class.findMany({
        where: {
          start_date: {
            gte: new Date()
          }
        },
        include: {
          course: true,
          instructure: true
        },
        orderBy: {
          start_date: 'asc'
        },
        take: 5
      });
      
      // Format data untuk tampilan
      upcomingTrainings = upcomingClasses.map(cls => ({
        title: cls.course.course_name,
        date: cls.start_date.toISOString().split('T')[0],
        trainer: cls.instructure?.name || "Unassigned"
      }));
      
      // Jika tidak ada data, gunakan fallback
      if (upcomingTrainings.length === 0) {
        upcomingTrainings = fallbackUpcomingTrainings;
      }
      
      logDebug("Data retrieved from database");
    } catch (error) {
      logDebug(`Error retrieving data from database: ${(error as Error).message}`);
      // Gunakan data fallback jika terjadi error
    }
    
    // Kembalikan data dashboard
    return NextResponse.json({
      success: true,
      data: {
        trainingData,
        certificationTypeData,
        upcomingTrainings,
        user: userData
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to load dashboard data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 