import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

// GET /api/enrollments - Mendapatkan semua pendaftaran
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      )
    }

    // Get enrollments for the participant
    const enrollments = await prisma.courseRegistration.findMany({
      where: {
        participantId,
      },
      include: {
        class: {
          include: {
            course: true,
          },
        },
        payments: true,
      },
      orderBy: {
        reg_date: 'desc',
      },
    })

    return NextResponse.json({
      data: enrollments.map(enrollment => ({
        id: enrollment.id,
        registrationDate: enrollment.reg_date,
        status: enrollment.reg_status,
        amount: enrollment.payment,
        paymentStatus: enrollment.payment_status,
        className: enrollment.class.course.course_name,
        classStart: enrollment.class.start_date,
        classEnd: enrollment.class.end_date,
        location: enrollment.class.location,
        payment: enrollment.payments[0] || null,
      })),
    })
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to fetch enrollments",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// POST /api/enrollments - Create a new course enrollment
export async function POST(request: Request) {
  try {
    const { participantId, classId, payment_method } = await request.json()

    // Validate required fields
    if (!participantId || !classId) {
      return NextResponse.json(
        { error: "Participant ID and Class ID are required" },
        { status: 400 }
      )
    }

    // Check if participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      )
    }

    // Check if class exists and has available quota
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // Check if the class is still open for registration
    const currentDate = new Date()
    if (currentDate < new Date(classData.start_reg_date) || 
        currentDate > new Date(classData.end_reg_date)) {
      return NextResponse.json(
        { error: "Registration period for this class is closed" },
        { status: 400 }
      )
    }

    // Check if there's available quota
    // First, count existing registrations
    const registrationCount = await prisma.courseRegistration.count({
      where: { classId },
    })

    if (registrationCount >= classData.quota) {
      return NextResponse.json(
        { error: "Class is already full" },
        { status: 400 }
      )
    }

    // Check if participant is already registered for this class
    const existingRegistration = await prisma.courseRegistration.findFirst({
      where: {
        participantId,
        classId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this class" },
        { status: 400 }
      )
    }

    // Create a registration ID
    const registrationId = `reg_${Date.now()}`

    // Create the registration in a transaction
    const newRegistration = await prisma.$transaction(async (prisma) => {
      // Create the course registration
      const registration = await prisma.courseRegistration.create({
        data: {
          id: registrationId,
          reg_date: new Date(),
          reg_status: "Pending",
          payment: classData.price,
          payment_status: "Unpaid",
          payment_method: payment_method || "Transfer Bank",
          present_day: 0,
          classId,
          participantId,
        },
      })

      // Create a payment record
      const payment = await prisma.payment.create({
        data: {
          id: `payment_${Date.now()}`,
          paymentDate: new Date(),
          amount: classData.price,
          paymentMethod: payment_method || "Transfer Bank",
          referenceNumber: `REF${Date.now()}`,
          status: "Unpaid",
          registrationId: registration.id,
        },
      })

      return {
        registration,
        payment,
      }
    })

    return NextResponse.json({
      id: newRegistration.registration.id,
      registrationDate: newRegistration.registration.reg_date,
      amount: newRegistration.registration.payment,
      paymentStatus: newRegistration.registration.payment_status,
      referenceNumber: newRegistration.payment.referenceNumber,
      message: "Registration successful. Please complete your payment.",
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating enrollment:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create enrollment: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    )
  }
} 