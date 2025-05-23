import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/usertype - Mendapatkan semua tipe pengguna
export async function GET() {
  try {
    // Pastikan tipe pengguna dasar tersedia
    await ensureBasicUserTypes();
    
    // Ambil semua tipe pengguna
    const userTypes = await prisma.userType.findMany({
      orderBy: {
        usertype: 'asc',
      },
    });

    // Format respons untuk kebutuhan frontend
    const formattedUserTypes = userTypes.map((userType, index) => ({
      no: index + 1,
      idUsertype: userType.id,
      usertype: userType.usertype,
    }));

    // Mengembalikan kedua format untuk kompatibilitas
    return NextResponse.json({
      userTypes: userTypes,
      formattedUserTypes: formattedUserTypes
    });
  } catch (error) {
    console.error('Error fetching user types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user types' },
      { status: 500 }
    );
  }
}

// Fungsi ini memastikan tipe pengguna dasar tersedia dalam database
async function ensureBasicUserTypes() {
  const basicTypes = ['admin', 'instructor', 'participant'];
  
  for (const type of basicTypes) {
    // Periksa apakah tipe pengguna sudah ada
    const existingType = await prisma.userType.findFirst({
      where: {
        usertype: type,
      },
    });
    
    // Jika belum ada, buat baru
    if (!existingType) {
      await prisma.userType.create({
        data: {
          id: `usertype_${type}_${Date.now()}`,
          usertype: type,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} user role`,
          status: 'Active',
        },
      });
      console.log(`Created missing user type: ${type}`);
    }
  }
}

// POST /api/usertype - Membuat tipe pengguna baru
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.usertype) {
      return NextResponse.json(
        { error: 'User type name is required' },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada tipe pengguna dengan nama yang sama
    const existingUserType = await prisma.userType.findFirst({
      where: {
        usertype: data.usertype,
      },
    });

    if (existingUserType) {
      return NextResponse.json(
        { error: 'User type with that name already exists' },
        { status: 409 }
      );
    }

    // Buat tipe pengguna baru
    const newUserType = await prisma.userType.create({
      data: {
        id: `usertype_${Date.now()}`,
        usertype: data.usertype,
        description: data.description || null,
        status: 'Active',
      },
    });

    return NextResponse.json(newUserType, { status: 201 });
  } catch (error) {
    console.error('Error creating user type:', error);
    return NextResponse.json(
      { error: 'Failed to create user type' },
      { status: 500 }
    );
  }
} 