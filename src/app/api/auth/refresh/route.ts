import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decode, sign } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("next-auth.session-token")?.value;
    const debugToken = cookieStore.get("debug_token")?.value;
    
    // Cek apakah ada token
    if (!sessionToken && !debugToken) {
      console.log("Tidak ada token untuk di-refresh");
      return NextResponse.json({
        success: false,
        error: "Tidak ada sesi yang aktif"
      }, { status: 401 });
    }
    
    // Coba decode token yang ada
    const token = sessionToken || debugToken;
    let decoded;
    
    try {
      decoded = decode(token as string);
    } catch (error) {
      console.error("Token tidak valid untuk di-decode:", error);
      return NextResponse.json({
        success: false,
        error: "Sesi tidak valid"
      }, { status: 401 });
    }
    
    if (!decoded || typeof decoded !== 'object' || !decoded.email) {
      console.log("Token tidak memiliki format yang valid");
      return NextResponse.json({
        success: false,
        error: "Format sesi tidak valid"
      }, { status: 401 });
    }
    
    // Cari user berdasarkan email di token
    const user = await prisma.user.findUnique({
      where: { email: decoded.email as string },
      include: { userType: true }
    });
    
    if (!user) {
      console.log("User tidak ditemukan untuk token");
      return NextResponse.json({
        success: false,
        error: "User tidak ditemukan"
      }, { status: 401 });
    }
    
    // Buat token baru dengan data yang sama
    const newToken = sign(
      {
        id: user.id,
        email: user.email,
        name: user.username,
        userType: user.userType.usertype
      },
      process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT",
      { expiresIn: "30d" } // Sama dengan maxAge di konfigurasi NextAuth
    );
    
    // Buat response dengan token baru
    const response = NextResponse.json({
      success: true,
      message: "Token berhasil di-refresh"
    });
    
    // Set cookie baru dengan token yang telah di-refresh
    response.cookies.set("next-auth.session-token", newToken, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 hari
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    // Juga refresh debug_token jika ada
    if (debugToken) {
      response.cookies.set("debug_token", newToken, {
        httpOnly: true,
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 hari
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }
    
    // Log untuk debugging
    console.log("Token berhasil di-refresh untuk user:", user.email);
    
    return response;
  } catch (error) {
    console.error("Error refresh token:", error);
    return NextResponse.json({
      success: false,
      error: "Gagal refresh token"
    }, { status: 500 });
  }
}

// Tambahkan handler GET untuk mendukung refresh dengan redirect
export async function GET(req: Request) {
  try {
    // Ambil parameter redirect jika ada
    const redirectUrl = new URL(req.url).searchParams.get('redirect');
    
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("next-auth.session-token")?.value;
    const debugToken = cookieStore.get("debug_token")?.value;
    
    console.log("Mencoba refresh token dengan redirect ke:", redirectUrl);
    
    // Cek apakah ada token
    if (!sessionToken && !debugToken) {
      console.log("Tidak ada token untuk di-refresh, redirect ke login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Coba decode token yang ada
    const token = sessionToken || debugToken;
    let decoded;
    
    try {
      decoded = decode(token as string);
    } catch (error) {
      console.error("Token tidak valid untuk di-decode, redirect ke login:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if (!decoded || typeof decoded !== 'object' || !decoded.email) {
      console.log("Token tidak memiliki format yang valid, redirect ke login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Cari user berdasarkan email di token
    const user = await prisma.user.findUnique({
      where: { email: decoded.email as string },
      include: { userType: true }
    });
    
    if (!user) {
      console.log("User tidak ditemukan untuk token, redirect ke login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Buat token baru dengan data yang sama
    const newToken = sign(
      {
        id: user.id,
        email: user.email,
        name: user.username,
        userType: user.userType.usertype
      },
      process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT",
      { expiresIn: "30d" } // Sama dengan maxAge di konfigurasi NextAuth
    );
    
    // Tentukan URL redirect
    const targetUrl = redirectUrl || "/dashboard";
    
    // Buat response dengan redirect
    const response = NextResponse.redirect(new URL(targetUrl, req.url));
    
    // Set cookie baru dengan token yang telah di-refresh
    response.cookies.set("next-auth.session-token", newToken, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 hari
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    // Juga refresh debug_token jika ada
    if (debugToken) {
      response.cookies.set("debug_token", newToken, {
        httpOnly: true,
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 hari
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }
    
    // Log untuk debugging
    console.log("Token berhasil di-refresh untuk user:", user.email, "redirect ke:", targetUrl);
    
    return response;
  } catch (error) {
    console.error("Error refresh token GET:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
} 