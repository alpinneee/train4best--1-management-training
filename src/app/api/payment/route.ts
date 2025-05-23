import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment - Get all payments
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const limit = Number(url.searchParams.get('limit')) || 10;
    const page = Number(url.searchParams.get('page')) || 1;
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const method = url.searchParams.get('method');
    const skip = (page - 1) * limit;
    
    // Filter untuk mencari pembayaran
    let whereClause: any = {};
    
    // Filter by user email
    if (email) {
      whereClause.registration = {
        participant: {
          user: { email }
        }
      };
    }
    
    // Filter by search (nama or nomor referensi)
    if (search) {
      whereClause.OR = [
        { 
          referenceNumber: { contains: search } 
        },
        {
          registration: {
            participant: {
              full_name: { contains: search }
            }
          }
        }
      ];
    }
    
    // Filter by status
    if (status) {
      whereClause.status = status;
    }
    
    // Filter by payment method
    if (method) {
      whereClause.paymentMethod = method;
    }
    
    try {
      // Cari pembayaran
      const payments = await prisma.payment.findMany({
        where: whereClause,
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
        },
        skip,
        take: limit,
        orderBy: {
          paymentDate: 'desc'
        }
      });
      
      // Format respons
      const formattedPayments = payments.map(payment => {
        const participantName = payment.registration.participant.full_name;
        
        return {
          id: payment.id,
          nama: participantName,
          tanggal: payment.paymentDate.toISOString().split('T')[0],
          paymentMethod: payment.paymentMethod,
          nomorReferensi: payment.referenceNumber,
          jumlah: payment.amount,
          status: payment.status,
          courseName: payment.registration.class.course.course_name,
          courseId: payment.registration.class.course.id,
          registrationId: payment.registration.id
        };
      });
      
      // Jika tidak ada data tersedia, kembalikan data dummy untuk testing
      if (formattedPayments.length === 0) {
        const dummyPayments = [
          {
            id: "dummy_1",
            nama: "Demo User",
            tanggal: new Date().toISOString().split('T')[0],
            paymentMethod: "Transfer Bank",
            nomorReferensi: "TRF-20240108-001",
            jumlah: 1000000,
            status: "Paid",
            courseName: "AIoT (Artificial Intelligence of Things)",
            courseId: "course_1",
            registrationId: "reg_1"
          },
          {
            id: "dummy_2",
            nama: "Demo User",
            tanggal: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentMethod: "E-Wallet",
            nomorReferensi: "EWL-20240110-001",
            jumlah: 1200000,
            status: "Paid",
            courseName: "Full Stack Web Development",
            courseId: "course_2",
            registrationId: "reg_2"
          }
        ];
        
        return NextResponse.json({
          data: dummyPayments,
          meta: {
            total: dummyPayments.length,
            page,
            limit,
            totalPages: 1,
            message: "Menampilkan data dummy karena tidak ada pembayaran yang ditemukan"
          }
        });
      }
      
      // Hitung total pembayaran untuk pagination
      const totalCount = await prisma.payment.count({
        where: whereClause
      });
      
      return NextResponse.json({
        data: formattedPayments,
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
      const dummyPayments = [
        {
          id: "dummy_1",
          nama: "Demo User",
          tanggal: new Date().toISOString().split('T')[0],
          paymentMethod: "Transfer Bank",
          nomorReferensi: "TRF-20240108-001",
          jumlah: 1000000,
          status: "Paid",
          courseName: "AIoT (Artificial Intelligence of Things)",
          courseId: "course_1",
          registrationId: "reg_1"
        },
        {
          id: "dummy_2",
          nama: "Demo User",
          tanggal: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentMethod: "E-Wallet",
          nomorReferensi: "EWL-20240110-001",
          jumlah: 1200000,
          status: "Paid",
          courseName: "Full Stack Web Development",
          courseId: "course_2",
          registrationId: "reg_2"
        }
      ];
      
      return NextResponse.json({
        data: dummyPayments,
        meta: {
          total: dummyPayments.length,
          page,
          limit,
          totalPages: 1,
          error: "Database error, menggunakan data dummy",
          details: dbError instanceof Error ? dbError.message : "Unknown error"
        }
      });
    }
  } catch (error) {
    console.error("Fatal error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error instanceof Error ? error.message : "Unknown error" },
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