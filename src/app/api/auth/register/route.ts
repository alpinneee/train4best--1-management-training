import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();
    
    // Validasi input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Dapatkan participant userType
    const participantType = await prisma.userType.findFirst({
      where: { usertype: 'participant' }
    });

    if (!participantType) {
      return NextResponse.json(
        { error: "Tipe user participant tidak ditemukan" },
        { status: 500 }
      );
    }

    // Generate username dari email
    const username = email.split('@')[0];

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate unique IDs
    const userId = uuidv4();
    const participantId = uuidv4();

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        password: hashedPassword,
        userTypeId: participantType.id
      }
    });

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        id: participantId,
        full_name: `${firstName} ${lastName}`,
        address: '', // Bisa diupdate nanti
        phone_number: '', // Bisa diupdate nanti
        birth_date: new Date(), // Bisa diupdate nanti
        gender: 'other', // Bisa diupdate nanti
        userId: user.id
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: `${firstName} ${lastName}`
      },
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
} 