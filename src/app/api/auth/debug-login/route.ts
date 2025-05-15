import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("Debug login attempt:", { email });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password diperlukan" },
        { status: 400 }
      );
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userType: true,
        participants: true,
        instructure: true
      }
    });

    if (!user) {
      console.log("User tidak ditemukan");
      return NextResponse.json(
        { error: "Kredensial tidak valid" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Password tidak valid");
      return NextResponse.json(
        { error: "Kredensial tidak valid" },
        { status: 401 }
      );
    }

    console.log("Login berhasil:", {
      id: user.id,
      email: user.email,
      userType: user.userType.usertype
    });

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        userType: user.userType.usertype,
        name: user.participants?.[0]?.full_name || user.instructure?.full_name || user.username
      },
      process.env.NEXTAUTH_SECRET || 'rahasia_debug',
      { expiresIn: '1d' }
    );

    // Set cookie
    cookies().set({
      name: 'debug_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });

    // Return user info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType.usertype,
        name: user.participants?.[0]?.full_name || user.instructure?.full_name || user.username
      },
      redirectTo: user.userType.usertype === 'admin' ? '/dashboard' : 
                 user.userType.usertype === 'instructor' ? '/instructure/dashboard' : 
                 '/participant/dashboard'
    });
  } catch (error) {
    console.error("Debug login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
} 