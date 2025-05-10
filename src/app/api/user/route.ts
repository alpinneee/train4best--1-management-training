import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data user" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Cek session dan role
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { username, idUser, jobTitle, password = "password123" } = await req.json()
    
    // Buat email dari username (untuk keperluan login)
    const email = `${username.toLowerCase().replace(/\s+/g, '.')}@train4best.com`

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User dengan email tersebut sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        role: jobTitle, // Set role sesuai dengan jobTitle yang dipilih
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Add user error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambah user" },
      { status: 500 }
    )
  }
} 