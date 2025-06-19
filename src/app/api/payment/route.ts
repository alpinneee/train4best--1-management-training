import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment - Get all payments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    
    // Build where clause based on filters
    let whereClause: any = {};
    
    if (status && status !== 'All') {
      whereClause.status = status;
    }
    
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    
    if (startDate || endDate) {
      whereClause.paymentDate = {};
      
      if (startDate) {
        whereClause.paymentDate.gte = new Date(startDate);
      }
      
      if (endDate) {
        // Set to end of day for the end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.paymentDate.lte = endDateTime;
      }
    }
    
    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        {
          registration: {
            participant: {
              full_name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          referenceNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    console.log("Payment query where clause:", JSON.stringify(whereClause, null, 2));
    
    // Get payments with filter
    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { paymentDate: 'desc' },
      take: limit,
      include: {
        registration: {
          include: {
            participant: {
              include: {
                user: true
              }
            },
            class: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${payments.length} payments`);
    
    // Format payments for response
    const formattedPayments = payments.map((payment, index) => ({
      id: payment.id,
      no: index + 1,
      nama: payment.registration?.participant?.full_name || 'Unknown',
      tanggal: payment.paymentDate.toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod,
      nomorReferensi: payment.referenceNumber,
      jumlah: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(payment.amount),
      amount: payment.amount,
      status: payment.status,
      registrationId: payment.registrationId,
      paymentProof: (payment as any).paymentProof || null,
      courseName: payment.registration?.class?.course?.course_name || 'Unknown Course',
      className: `${payment.registration?.class?.location || 'Unknown'} - ${new Date(payment.registration?.class?.start_date || new Date()).toLocaleDateString()}`
    }));
    
    // If no payments found and in development, return mock data
    if (formattedPayments.length === 0 && process.env.NODE_ENV === 'development') {
      // Check if any filter is applied
      const hasFilters = search || paymentMethod || startDate || endDate || (status && status !== 'All');
      
      if (!hasFilters) {
        // Only return mock data if no filters are applied
        console.log("No payments found and no filters applied, returning mock data");
        return NextResponse.json(getMockPayments());
      } else {
        console.log("No payments found with applied filters, returning empty result");
      }
    }
    
    return NextResponse.json({
      data: formattedPayments,
      total: formattedPayments.length
    });
    
  } catch (error) {
    console.error("Error fetching payments:", error);
    
    // If in development, return mock data on error
    if (process.env.NODE_ENV === 'development') {
      // Check if any filter is applied
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const search = searchParams.get('search');
      const paymentMethod = searchParams.get('paymentMethod');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const status = searchParams.get('status');
      
      const hasFilters = search || paymentMethod || startDate || endDate || (status && status !== 'All');
      
      if (!hasFilters) {
        console.log("Error occurred with no filters, returning mock data");
        return NextResponse.json(getMockPayments());
      } else {
        console.log("Error occurred with filters, returning empty result");
        return NextResponse.json({
          data: [],
          total: 0
        });
      }
    }
    
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payment - Create a new payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      paymentDate, 
      amount, 
      paymentMethod, 
      referenceNumber, 
      status, 
      registrationId 
    } = body;

    // Validate required fields
    if (!paymentDate || !amount || !paymentMethod || !referenceNumber || !registrationId) {
      return NextResponse.json(
        { error: "Payment date, amount, payment method, reference number, and registration ID are required" },
        { status: 400 }
      );
    }

    // Check if reference number already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { referenceNumber },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Reference number already exists" },
        { status: 409 }
      );
    }

    // Check if registration exists
    const registration = await prisma.courseRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Create payment
    const newPayment = await prisma.payment.create({
      data: {
        paymentDate: new Date(paymentDate),
        amount: parseFloat(amount.toString()),
        paymentMethod,
        referenceNumber,
        status: status || "Unpaid",
        registrationId,
      },
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockPayments() {
  const mockData = [
    {
      id: "mock-1",
      no: 1,
      nama: "Ilham Ramadhan",
      tanggal: "2024-01-02",
      paymentMethod: "Transfer Bank",
      nomorReferensi: "TRF-20240102-001",
      jumlah: "Rp 1.000.000",
      amount: 1000000,
      status: "Paid",
      registrationId: "mock-reg-1",
      paymentProof: "/uploads/payment-proofs/sample-receipt.jpg"
    },
    {
      id: "mock-2",
      no: 2,
      nama: "Risky Febriana",
      tanggal: "2024-01-10",
      paymentMethod: "E-Wallet",
      nomorReferensi: "EWL-20240110-001",
      jumlah: "Rp 1.000.000",
      amount: 1000000,
      status: "Unpaid",
      registrationId: "mock-reg-2",
      paymentProof: null
    },
    {
      id: "mock-3",
      no: 3,
      nama: "Affine Makarizo",
      tanggal: "2024-01-05",
      paymentMethod: "Kartu Kredit",
      nomorReferensi: "CC-20240105-002",
      jumlah: "Rp 1.500.000",
      amount: 1500000,
      status: "Pending",
      registrationId: "mock-reg-3",
      paymentProof: "/uploads/payment-proofs/sample-receipt-2.jpg"
    },
    {
      id: "mock-4",
      no: 4,
      nama: "Cyntia Febiola",
      tanggal: "2024-02-12",
      paymentMethod: "Transfer Bank",
      nomorReferensi: "TRF-20240212-002",
      jumlah: "Rp 2.000.000",
      amount: 2000000,
      status: "Paid",
      registrationId: "mock-reg-4",
      paymentProof: "/uploads/payment-proofs/sample-receipt-3.jpg"
    },
    {
      id: "mock-5",
      no: 5,
      nama: "Saska Khairani",
      tanggal: "2024-02-03",
      paymentMethod: "E-Wallet",
      nomorReferensi: "EWL-20240203-002",
      jumlah: "Rp 2.000.000",
      amount: 2000000,
      status: "Paid",
      registrationId: "mock-reg-5",
      paymentProof: "/uploads/payment-proofs/sample-receipt-4.jpg"
    }
  ];
  
  return {
    data: mockData,
    total: mockData.length
  };
} 