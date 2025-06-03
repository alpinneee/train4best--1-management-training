import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/certificate - Get all certificates
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const limit = Number(url.searchParams.get('limit')) || 10;
    const page = Number(url.searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    
    // Filter untuk mencari sertifikat
    const whereClause = email ? { 
      participant: { 
        user: { email } 
      } 
    } : {};
    
    try {
      // Cari sertifikat yang telah diterbitkan untuk user
      const certificates = await prisma.certificate.findMany({
        where: whereClause,
        include: {
          class: {
            include: {
              course: {
                include: {
                  courseType: true
                }
              }
            }
          },
          participant: {
            include: {
              user: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          issue_date: 'desc'
        }
      });
      
      // Format respons
      const formattedCertificates = certificates.map(cert => {
        return {
          id: cert.id,
          certificateNumber: cert.certificate_number,
          issueDate: cert.issue_date,
          courseName: cert.class.course.course_name,
          courseType: cert.class.course.courseType.course_type,
          location: cert.class.location,
          startDate: cert.class.start_date,
          endDate: cert.class.end_date,
          participantName: cert.participant.user.username,
          description: [
            `${cert.class.duration_day} hari pelatihan`,
            `${cert.class.location} - ${cert.class.room}`
          ]
        };
      });
      
      // Jika tidak ada data tersedia, kembalikan data dummy untuk testing
      if (formattedCertificates.length === 0) {
        const dummyCertificates = [
          {
            id: "dummy_1",
            certificateNumber: "CERT/2023/001",
            issueDate: new Date(),
            courseName: "AIoT",
            courseType: "Technical",
            location: "Jakarta",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
            participantName: "User Test",
            description: [
              "Membangun sistem AIoT",
              "Mengembangkan aplikasi smart home, smart agriculture, smart healthcare"
            ]
          },
          {
            id: "dummy_2",
            certificateNumber: "CERT/2023/002",
            issueDate: new Date(),
            courseName: "Programmer",
            courseType: "Technical",
            location: "Bandung",
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
            participantName: "User Test",
            description: [
              "Introduction (pengenalan web)",
              "Frontend, backend"
            ]
          }
        ];
        
        return NextResponse.json({
          data: dummyCertificates,
          meta: {
            total: dummyCertificates.length,
            page,
            limit,
            totalPages: 1,
            message: "Menampilkan data dummy karena tidak ada sertifikat yang ditemukan"
          }
        });
      }
      
      // Hitung total sertifikat untuk pagination
      const totalCount = await prisma.certificate.count({
        where: whereClause
      });
      
      return NextResponse.json({
        data: formattedCertificates,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Jika terjadi error database, kembalikan data dummy
      const dummyCertificates = [
        {
          id: "dummy_1",
          certificateNumber: "CERT/2023/001",
          issueDate: new Date(),
          courseName: "AIoT",
          courseType: "Technical",
          location: "Jakarta",
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
          participantName: "User Test",
          description: [
            "Membangun sistem AIoT",
            "Mengembangkan aplikasi smart home, smart agriculture, smart healthcare"
          ]
        },
        {
          id: "dummy_2",
          certificateNumber: "CERT/2023/002",
          issueDate: new Date(),
          courseName: "Programmer",
          courseType: "Technical",
          location: "Bandung",
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
          participantName: "User Test",
          description: [
            "Introduction (pengenalan web)",
            "Frontend, backend"
          ]
        }
      ];
      
      return NextResponse.json({
        data: dummyCertificates,
        meta: {
          total: dummyCertificates.length,
          page,
          limit,
          totalPages: 1,
          error: "Database error, menggunakan data dummy",
          details: dbError instanceof Error ? dbError.message : "Unknown error"
        }
      });
    }
  } catch (error) {
    console.error("Fatal error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST /api/certificate - Create a new certificate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      certificateNumber, 
      name, 
      issueDate, 
      expiryDate, 
      status, 
      participantId, 
      courseId 
    } = body;

    // Validate required fields
    if (!certificateNumber || !name || !issueDate || !expiryDate) {
      return NextResponse.json(
        { error: "Certificate number, name, issue date, and expiry date are required" },
        { status: 400 }
      );
    }

    // Check if certificate number already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
    });

    if (existingCertificate) {
      return NextResponse.json(
        { error: "Certificate number already exists" },
        { status: 409 }
      );
    }

    // Create certificate
    const newCertificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        name,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        status: status || "Valid",
        participantId,
        courseId,
      },
    });

    return NextResponse.json(newCertificate, { status: 201 });
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
} 