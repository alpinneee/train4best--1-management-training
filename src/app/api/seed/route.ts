import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Hash password yang sama untuk semua user (password: "password123")
    const hashedPassword = await bcrypt.hash("password123", 10)

    // Buat Super Admin
    await prisma.user.upsert({
      where: { email: "admin@train4best.com" },
      update: {},
      create: {
        name: "Super Admin",
        email: "admin@train4best.com",
        password: hashedPassword,
        role: "super_admin",
      },
    })

    // Buat Instructor
    await prisma.user.upsert({
      where: { email: "instructor@train4best.com" },
      update: {},
      create: {
        name: "Instructor",
        email: "instructor@train4best.com",
        password: hashedPassword,
        role: "instructor",
      },
    })

    // Buat Participant
    await prisma.user.upsert({
      where: { email: "participant@train4best.com" },
      update: {},
      create: {
        name: "Participant",
        email: "participant@train4best.com",
        password: hashedPassword,
        role: "participant",
      },
    })

    return NextResponse.json({
      message: "Test users created successfully",
      users: [
        { email: "admin@train4best.com", role: "super_admin" },
        { email: "instructor@train4best.com", role: "instructor" },
        { email: "participant@train4best.com", role: "participant" },
      ],
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    )
  }
} 