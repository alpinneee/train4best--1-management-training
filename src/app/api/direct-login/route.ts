import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Dapatkan email dan password dari request
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email dan password diperlukan"
      }, { status: 400 });
    }
    
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userType: true, participant: true }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User tidak ditemukan"
      }, { status: 404 });
    }
    
    // Verifikasi password
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: "Password tidak valid"
      }, { status: 401 });
    }
    
    // Buat token JWT manual dengan secret yang valid
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.username,
        userType: user.userType.usertype
      },
      process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT", // Secret harus tidak kosong dan cukup panjang
      { expiresIn: "1d" }
    );
    
    // Kembalikan info user dan token dengan header redirect
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        name: user.username,
        userType: user.userType.usertype,
        hasProfile: user.participant && user.participant.length > 0
      }
    });
    
    // Set cookie debug_token
    response.cookies.set("debug_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    // Set cookie untuk next-auth juga sebagai fallback
    response.cookies.set("next-auth.session-token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    // Set header untuk redirect
    response.headers.set(
      "Set-Cookie", 
      `login_success=true; Path=/; Max-Age=60;`
    );
    
    // Tambahkan info redirect URL ke respons
    response.headers.set("X-Redirect-URL", `/profile?email=${encodeURIComponent(user.email)}`);
    
    return response;
  } catch (error) {
    console.error("Error login:", error);
    return NextResponse.json({
      success: false,
      error: "Gagal melakukan login",
      details: error.message
    }, { status: 500 });
  }
} 