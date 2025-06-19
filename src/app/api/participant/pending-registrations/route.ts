import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        participant: true
      }
    });

    if (!user || !user.participant || user.participant.length === 0) {
      return NextResponse.json(
        { error: "User not found or has no participant profile" },
        { status: 404 }
      );
    }

    const participantId = user.participant[0].id;

    // Cari semua pendaftaran yang masih pending pembayaran
    const pendingRegistrations = await prisma.courseRegistration.findMany({
      where: {
        participantId,
        payment_status: {
          in: ["Unpaid", "Pending"]
        }
      },
      include: {
        class: {
          include: {
            course: true
          }
        }
      }
    });

    // Format data untuk respons
    const formattedRegistrations = pendingRegistrations.map(reg => ({
      registrationId: reg.id,
      courseId: reg.class.id,
      courseName: reg.class.course ? reg.class.course.course_name : 'Unknown Course',
      className: `${reg.class.location} - ${new Date(reg.class.start_date).toLocaleDateString()}`,
      status: reg.payment_status,
      paymentAmount: reg.payment,
      paymentEvidence: reg.payment_evidence
    }));

    return NextResponse.json({
      registrations: formattedRegistrations
    });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending registrations" },
      { status: 500 }
    );
  }
} 