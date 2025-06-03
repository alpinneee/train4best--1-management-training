import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit')) || 10;
    const page = Number(url.searchParams.get('page')) || 1;
    const search = url.searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    
    // Dapatkan tanggal saat ini
    const currentDate = new Date();
    
    try {
      // Cari kelas yang masih bisa didaftar (end_reg_date >= currentDate)
      const availableClasses = await prisma.class.findMany({
        where: {
          end_reg_date: {
            gte: currentDate
          },
          ...(search ? {
            OR: [
              { location: { contains: search } },
              { course: { course_name: { contains: search } } }
            ]
          } : {})
        },
        include: {
          course: {
            include: {
              courseType: true
            }
          },
          courseregistration: true
        },
        skip,
        take: limit,
        orderBy: {
          start_date: 'asc'
        }
      });
      
      // Format respons
      const classesWithAvailability = availableClasses.map(classItem => {
        const registeredCount = classItem.courseregistration.length;
        const availableSlots = classItem.quota - registeredCount;
        
        // Hilangkan data registrasi peserta dari response
        const { courseregistration, ...classData } = classItem;
        
        return {
          ...classData,
          availableSlots,
          isFull: availableSlots <= 0
        };
      });
      
      // Perkirakan total dengan kueri yang sama
      const totalCount = await prisma.class.count({
        where: {
          end_reg_date: {
            gte: currentDate
          },
          ...(search ? {
            OR: [
              { location: { contains: search } },
              { course: { course_name: { contains: search } } }
            ]
          } : {})
        }
      });
      
      return NextResponse.json({
        data: classesWithAvailability,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Jika terjadi error database, kembalikan response kosong tapi valid
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          error: "Database error, no courses available"
        }
      });
    }
  } catch (error) {
    console.error("Fatal error fetching available courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch available courses", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 