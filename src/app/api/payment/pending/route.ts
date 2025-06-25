import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get all pending payments with payment evidence
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: "Pending",
        paymentProof: {
          not: null
        }
      },
      include: {
        registration: {
          include: {
            participant: true,
            class: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    // Format the response
    const payments = pendingPayments.map(payment => {
      const registration = payment.registration;
      
      return {
        id: payment.id,
        registrationId: registration.id,
        participantName: registration.participant.full_name,
        courseName: registration.class.course.course_name,
        amount: payment.amount,
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        paymentEvidence: payment.paymentProof,
        status: payment.status,
        courseDetails: {
          id: registration.class.id,
          name: registration.class.course.course_name,
          location: registration.class.location,
          startDate: registration.class.start_date,
          endDate: registration.class.end_date
        },
        paymentDetails: {
          referenceNumber: payment.referenceNumber,
          amount: payment.amount,
          status: payment.status
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