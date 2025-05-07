import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

// PATCH /api/enrollments/[id] - Update status pendaftaran
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { error: "Only instructors can update enrollment status" },
        { status: 403 }
      )
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: params.id },
      include: {
        course: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Cek apakah instruktur adalah pengajar kursus ini
    if (enrollment.course.instructorId !== user.id) {
      return NextResponse.json(
        { error: "You are not the instructor of this course" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 