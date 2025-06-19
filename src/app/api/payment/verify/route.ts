import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { registrationId, action } = await request.json();
    
    if (!registrationId || !action) {
      return NextResponse.json(
        { error: "Registration ID and action are required" },
        { status: 400 }
      );
    }
    
    // Verify the registration exists
    const registration = await prisma.courseRegistration.findUnique({
      where: { id: registrationId },
      include: {
        payment: true,
        class: true,
        participant: true
      }
    });
    
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }
    
    if (action === 'approve') {
      // Approve payment and registration
      await prisma.courseRegistration.update({
        where: { id: registrationId },
        data: {
          reg_status: "Registered", // Change status to registered
          payment_status: "Paid",
          payment_detail: `${registration.payment_detail || ''} Payment verified and approved on ${new Date().toISOString()}.`
        }
      });
      
      // Update payment status
      if (registration.payment.length > 0) {
        await prisma.payment.update({
          where: { id: registration.payment[0].id },
          data: {
            status: "Paid"
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        message: "Payment approved and registration confirmed"
      });
      
    } else if (action === 'reject') {
      // Reject payment
      await prisma.courseRegistration.update({
        where: { id: registrationId },
        data: {
          reg_status: "Rejected",
          payment_status: "Rejected",
          payment_detail: `${registration.payment_detail || ''} Payment rejected on ${new Date().toISOString()}.`
        }
      });
      
      // Update payment status
      if (registration.payment.length > 0) {
        await prisma.payment.update({
          where: { id: registration.payment[0].id },
          data: {
            status: "Rejected"
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        message: "Payment rejected"
      });
      
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'." },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
} 