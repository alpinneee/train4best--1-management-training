import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

// GET /api/enrollments - Mendapatkan semua pendaftaran
export async function GET() {
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

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Jika user adalah instruktur, tampilkan semua pendaftaran untuk kursus yang dia ajar
    if (user.role === "instructor") {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          course: {
            instructorId: user.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          course: true,
        },
      })
      return NextResponse.json(enrollments)
    }

    // Jika user adalah peserta, tampilkan pendaftaran mereka sendiri
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })
    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// POST /api/enrollments - Membuat pendaftaran baru
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

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { courseId } = body

    // Cek apakah kursus ada
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Cek apakah kursus sudah penuh
    if (course._count.enrollments >= course.capacity) {
      return NextResponse.json(
        { error: "Course is full" },
        { status: 400 }
      )
    }

    // Cek apakah user sudah mendaftar
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // Buat pendaftaran baru
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
      },
      include: {
        course: true,
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 