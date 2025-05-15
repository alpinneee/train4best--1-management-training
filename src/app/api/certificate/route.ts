import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/certificate - Get all certificates
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const searchQuery = url.searchParams.get("search");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    console.log("Fetching certificates with params:", { status, searchQuery, startDate, endDate });

    // Build where clause
    const where: any = {};
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }
    
    // Filter by search query (name or certificate number)
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { certificateNumber: { contains: searchQuery } }
      ];
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.expiryDate = {};
      
      if (startDate) {
        where.expiryDate.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.expiryDate.lte = new Date(endDate);
      }
    }

    console.log("Query where clause:", JSON.stringify(where));

    // Get certificates
    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        participant: {
          select: {
            full_name: true,
          },
        },
        course: {
          select: {
            course_name: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    console.log(`Found ${certificates.length} certificates`);

    // Format the response
    const formattedCertificates = certificates.map((cert, index) => {
      try {
        return {
          id: cert.id,
          no: index + 1,
          name: cert.name || cert.participant?.full_name || "Unknown",
          certificateNumber: cert.certificateNumber,
          issueDate: cert.issueDate.toISOString().split('T')[0],
          expiryDate: cert.expiryDate.toISOString().split('T')[0],
          status: cert.status,
          course: cert.course?.course_name || "Unknown",
        };
      } catch (err) {
        console.error("Error formatting certificate:", cert.id, err);
        // Return a fallback object if there's an error
        return {
          id: cert.id || "unknown",
          no: index + 1,
          name: cert.name || "Unknown",
          certificateNumber: cert.certificateNumber || "Unknown",
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date().toISOString().split('T')[0],
          status: cert.status || "Unknown",
          course: "Unknown",
        };
      }
    });

    return NextResponse.json(formattedCertificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
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