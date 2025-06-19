import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get all pending registrations with payment evidence
    const pendingRegistrations = await prisma.courseRegistration.findMany({
      where: {
        payment_status: "Pending",
        payment_evidence: {
          not: null
        }
      },
      include: {
        participant: true,
        class: {
          include: {
            course: true
          }
        },
        payment: true
      }
    });

    // Format the response
    const payments = pendingRegistrations.map(registration => {
      // Get the latest payment record if exists
      const paymentRecord = registration.payment.length > 0 ? registration.payment[0] : null;
      
      return {
        id: registration.id,
        registrationId: registration.id,
        participantName: registration.participant.full_name,
        courseName: registration.class.course.course_name,
        amount: registration.payment,
        paymentDate: registration.payment_date || new Date().toISOString(),
        paymentMethod: registration.payment_method || "Transfer Bank",
        paymentEvidence: registration.payment_evidence,
        status: registration.payment_status,
        courseDetails: {
          id: registration.class.id,
          name: registration.class.course.course_name,
          location: registration.class.location,
          startDate: registration.class.start_date,
          endDate: registration.class.end_date
        },
        paymentDetails: {
          referenceNumber: paymentRecord ? paymentRecord.referenceNumber : null,
          amount: registration.payment,
          status: registration.payment_status
        }
      };
    });

    return NextResponse.json({
      success: true,
      payments
    });
    
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending payments" },
      { status: 500 }
    );
  }
} 