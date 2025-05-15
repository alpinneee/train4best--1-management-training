import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/payment/[id] - Get a specific payment
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // For mock IDs in development mode, return mock data
    if (id.startsWith('mock-') && process.env.NODE_ENV !== 'production') {
      console.log(`Returning mock data for ID: ${id}`);
      return NextResponse.json(getMockPaymentById(id));
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                id: true,
                full_name: true,
                company: true,
                job_title: true,
              },
            },
            class: {
              include: {
                course: true
              }
            }
          },
        },
      },
    });

    if (!payment) {
      // If payment not found but we're in development, return mock data
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Payment not found, returning mock data for ID: ${id}`);
        return NextResponse.json(getMockPaymentById(id));
      }
      
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Format the response
    const formattedPayment = {
      id: payment.id,
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
      amount: payment.amount,
      formattedAmount: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(payment.amount),
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      status: payment.status,
      registrationId: payment.registrationId,
      participant: payment.registration?.participant ? {
        id: payment.registration.participant.id,
        name: payment.registration.participant.full_name,
        company: payment.registration.participant.company,
        jobTitle: payment.registration.participant.job_title,
      } : null,
      course: payment.registration?.class?.course ? {
        id: payment.registration.class.course.id,
        name: payment.registration.class.course.course_name,
      } : null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedPayment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    
    // If in development, provide mock data
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Returning mock data due to error for ID: ${params.id}`);
      return NextResponse.json(getMockPaymentById(params.id));
    }
    
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockPaymentById(id: string) {
  // If the ID is a specific mock ID, return matching data
  const mockId = id.startsWith('mock-') ? id : `mock-${id}`;
  const mockNumber = parseInt(mockId.split('-')[1] || '1');
  
  return {
    id: mockId,
    paymentDate: "2024-03-01",
    amount: 1000000 + (mockNumber * 500000),
    formattedAmount: `Rp ${(1000000 + (mockNumber * 500000)).toLocaleString('id-ID')}`,
    paymentMethod: ["Transfer Bank", "E-Wallet", "Kartu Kredit"][mockNumber % 3],
    referenceNumber: `REF-DEV-${mockNumber.toString().padStart(3, '0')}`,
    status: mockNumber % 2 === 0 ? "Paid" : "Unpaid",
    registrationId: `reg-${mockNumber}`,
    participant: {
      id: `participant-${mockNumber}`,
      name: ["Ilham Ramadhan", "Risky Febriana", "Affine Makarizo", "Cyntia Febiola", "Saska Khairani"][mockNumber % 5],
      company: "Train4Best Company",
      jobTitle: "Trainee",
    },
    course: {
      id: `course-${mockNumber}`,
      name: ["Web Development", "Digital Marketing", "Leadership", "Management", "Data Science"][mockNumber % 5],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// PUT /api/payment/[id] - Update a payment
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      paymentDate, 
      amount, 
      paymentMethod, 
      referenceNumber, 
      status, 
      registrationId 
    } = body;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if reference number is being changed and if it already exists
    if (referenceNumber && referenceNumber !== existingPayment.referenceNumber) {
      const paymentWithSameReference = await prisma.payment.findUnique({
        where: { referenceNumber },
      });

      if (paymentWithSameReference && paymentWithSameReference.id !== id) {
        return NextResponse.json(
          { error: "Reference number already exists" },
          { status: 409 }
        );
      }
    }

    // Check if registration exists
    if (registrationId && registrationId !== existingPayment.registrationId) {
      const registration = await prisma.courseRegistration.findUnique({
        where: { id: registrationId },
      });

      if (!registration) {
        return NextResponse.json(
          { error: "Registration not found" },
          { status: 404 }
        );
      }
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        amount: amount ? parseFloat(amount.toString()) : undefined,
        paymentMethod: paymentMethod || undefined,
        referenceNumber: referenceNumber || undefined,
        status: status || undefined,
        registrationId: registrationId || undefined,
      },
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

// DELETE /api/payment/[id] - Delete a payment
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Payment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
} 