import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get("participantId");

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    console.log(`Processing detail request for scheduleId: ${scheduleId}, participantId: ${participantId}`);

    // Ambil data kelas
    const classData = await prisma.class.findUnique({
      where: { id: scheduleId },
      select: {
        duration_day: true,
        price: true
      }
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Ambil data peserta
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        address: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Ambil data registrasi
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        classId: scheduleId,
        participantId
      },
      select: {
        id: true,
        participantId: true,
        present_day: true,
        payment_status: true,
        reg_status: true,
        reg_date: true,
        payment: true,
        payment_method: true
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Ambil data sertifikat
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: registration.id
      },
      select: {
        id: true,
        certificateNumber: true,
        issueDate: true,
        createdAt: true
      }
    });

    // Ambil data nilai
    const values = await prisma.valueReport.findMany({
      where: {
        registrationId: registration.id
      },
      select: {
        id: true,
        value_type: true,
        remark: true,
        value: true
      }
    });

    // Hitung progress
    const presentDays = registration.present_day;
    const totalDays = classData.duration_day;
    const progressPercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Format response
    const responseData = {
      personalInfo: {
        id: participant.id,
        name: participant.full_name,
        email: participant.user?.email || '',
        phone: participant.phone_number || '',
        address: participant.address || ''
      },
      courseInfo: {
        presentDays: `${presentDays}/${totalDays}`,
        totalDays: totalDays.toString(),
        paymentStatus: registration.payment_status,
        regStatus: registration.reg_status,
        joinedDate: registration.reg_date.toISOString(),
        payment: {
          amount: registration.payment,
          total: classData.price,
          method: registration.payment_method || '',
          date: registration.reg_date ? registration.reg_date.toISOString() : null
        }
      },
      progressInfo: {
        percentage: progressPercentage,
        days: {
          present: presentDays,
          total: totalDays
        }
      },
      certificateInfo: certificate ? {
        id: certificate.id,
        number: certificate.certificateNumber,
        issueDate: certificate.issueDate.toISOString(),
        registrationDate: certificate.createdAt.toISOString()
      } : null,
      testResults: values.map((test: any) => ({
        id: test.id,
        type: test.value_type,
        remark: test.remark || '',
        value: parseInt(test.value),
        maxValue: 100 // Asumsi nilai maksimal adalah 100
      }))
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching participant details:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant details" },
      { status: 500 }
    );
  }
} 