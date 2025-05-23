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

    // Buat user dan participant dalam satu transaksi
    const result = await prisma.$transaction(async () => {
      // Buat user baru
      const userId = uuidv4();
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          username,
          email,
          password: hashedPassword,
          userTypeId: participantType.id,
        },
      });

      // Buat participant baru
      const newParticipant = await prisma.participant.create({
        data: {
          id: uuidv4(),
          full_name: `${firstName} ${lastName}`,
          address: '', // Bisa diupdate nanti
          phone_number: '', // Bisa diupdate nanti
          birth_date: new Date(), // Bisa diupdate nanti
          gender: 'other', // Bisa diupdate nanti
          userId: newUser.id,
        },
      });

      return { user: newUser, participant: newParticipant };
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        userType: participantType.usertype,
        fullName: result.participant.full_name
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