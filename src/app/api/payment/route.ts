import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment - Get all payments
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const searchQuery = url.searchParams.get("search");
    const paymentMethod = url.searchParams.get("paymentMethod");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    console.log("Fetching payments with params:", { status, searchQuery, paymentMethod, startDate, endDate });

    // Build where clause
    const where: any = {};
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }
    
    // Filter by payment method if provided
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    
    // Filter by search query (participant name or reference number)
    if (searchQuery) {
      where.OR = [
        { referenceNumber: { contains: searchQuery } },
        {
          registration: {
            participant: {
              full_name: { contains: searchQuery }
            }
          }
        }
      ];
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.paymentDate = {};
      
      if (startDate) {
        where.paymentDate.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.paymentDate.lte = new Date(endDate);
      }
    }

    console.log("Query where clause:", JSON.stringify(where));

    // First check if payments table exists and has data
    let paymentCount = 0;
    try {
      paymentCount = await prisma.payment.count();
      console.log(`Total payments in database: ${paymentCount}`);
    } catch (countError) {
      console.error("Error counting payments:", countError);
      
      // If in development, provide mock data
      if (process.env.NODE_ENV !== 'production') {
        console.log("Returning mock data for development");
        return NextResponse.json(getMockPayments());
      }
      
      // Return empty array instead of error if table may not exist yet
      return NextResponse.json([]);
    }
    
    // If no payments exist yet but we're in development, provide mock data
    if (paymentCount === 0 && process.env.NODE_ENV !== 'production') {
      console.log("No payments found in database, returning mock data");
      return NextResponse.json(getMockPayments());
    }
    
    // If no payments exist in production, return empty array
    if (paymentCount === 0) {
      console.log("No payments found in database");
      return NextResponse.json([]);
    }

    // Get payments
    const payments = await prisma.payment.findMany({
      where,
      include: {
        registration: {
          include: {
            participant: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    console.log(`Found ${payments.length} payments matching criteria`);

    // Format the response
    const formattedPayments = payments.map((payment, index) => {
      try {
        // Handle the case where registration or participant might be null
        const participantName = payment.registration?.participant?.full_name || "Unknown";
        
        return {
          id: payment.id,
          no: index + 1,
          nama: participantName,
          tanggal: payment.paymentDate.toISOString().split('T')[0],
          paymentMethod: payment.paymentMethod,
          nomorReferensi: payment.referenceNumber,
          jumlah: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(payment.amount),
          amount: payment.amount,
          status: payment.status,
          registrationId: payment.registrationId,
        };
      } catch (err) {
        console.error("Error formatting payment:", payment.id, err);
        // Return a fallback object if there's an error
        return {
          id: payment.id,
          no: index + 1,
          nama: "Unknown",
          tanggal: payment.paymentDate.toISOString().split('T')[0],
          paymentMethod: payment.paymentMethod,
          nomorReferensi: payment.referenceNumber,
          jumlah: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(payment.amount),
          amount: payment.amount,
          status: payment.status,
          registrationId: payment.registrationId,
        };
      }
    });

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    
    // If in development, provide mock data on error
    if (process.env.NODE_ENV !== 'production') {
      console.log("Returning mock data due to error");
      return NextResponse.json(getMockPayments());
    }
    
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error instanceof Error ? error.message : String(error) },
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
  return [
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
      registrationId: "mock-reg-1"
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
      registrationId: "mock-reg-2"
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
      status: "Unpaid",
      registrationId: "mock-reg-3"
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
      registrationId: "mock-reg-4"
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
      registrationId: "mock-reg-5"
    }
  ];
} 