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
      include: {
        userType: true
      }
    })

    if (!user || user.userType.usertype !== "Instructor") {
      return NextResponse.json(
        { error: "Only instructors can update enrollment status" },
        { status: 403 }
      )
    }

    const enrollment = await prisma.courseRegistration.findUnique({
      where: { id: params.id },
      include: {
        class: {
          include: {
            course: true
          }
        }
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Cek apakah instruktur adalah pengajar kursus ini
    // Perlu disesuaikan dengan relasi yang sesuai
    const instructureId = user.instructureId;
    if (!instructureId) {
      return NextResponse.json(
        { error: "You are not registered as an instructor" },
        { status: 403 }
      )
    }
    
    // Perlu memeriksa apakah instructor terkait dengan class ini
    const isInstructorForClass = await prisma.instructureClass.findFirst({
      where: {
        instructureId,
        classId: enrollment.classId
      }
    });
    
    if (!isInstructorForClass) {
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

    const updatedEnrollment = await prisma.courseRegistration.update({
      where: { id: params.id },
      data: { reg_status: status },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true
              }
            }
          }
        },
        class: {
          include: {
            course: true
          }
        }
      },
    })

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    console.error("Error updating enrollment:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 