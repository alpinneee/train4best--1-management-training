import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

// GET /api/courses - Mendapatkan semua kursus
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// POST /api/courses - Membuat kursus baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || user.role !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can create courses" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, startDate, endDate, capacity, price } = body

    const course = await prisma.course.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacity,
        price,
        instructorId: user.id,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 