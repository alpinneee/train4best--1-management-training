import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET /api/instructure - Mendapatkan semua instruktur
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const proficiency = searchParams.get('proficiency') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filter berdasarkan nama dan proficiency
    const where: any = {};

    // Menambahkan filter pencarian
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { phone_number: { contains: search } },
      ];
    }

    if (proficiency && proficiency !== 'all') {
      where.profiency = proficiency;
    }

    // Mendapatkan total jumlah data
    const total = await prisma.instructure.count({ where });

    // Mendapatkan data instruktur beserta data user jika ada
    const instructures = await prisma.instructure.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        full_name: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    // Format respons
    const formattedInstructures = instructures.map((instructure, index) => ({
      no: skip + index + 1,
      id: instructure.id,
      fullName: instructure.full_name,
      phoneNumber: instructure.phone_number,
      proficiency: instructure.profiency,
      address: instructure.address,
      photo: instructure.photo || null,
      userId: instructure.user?.[0]?.id || null,
      username: instructure.user?.[0]?.username || null,
      email: instructure.user?.[0]?.email || null,
    }));

    return NextResponse.json({
      data: formattedInstructures,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching instructures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructures' },
      { status: 500 }
    );
  }
}

// POST /api/instructure - Membuat instruktur baru
export async function POST(request: Request) {
  try {
    const { fullName, phoneNumber, proficiency, address, photo, email, password } = await request.json();

    if (!fullName || !phoneNumber || !proficiency || !address || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, phone number, proficiency, address, email, and password are required' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 409 }
      );
    }

    // Cari userType untuk instructor
    const instructorType = await prisma.userType.findFirst({
      where: {
        usertype: 'instructor',
      },
    });

    if (!instructorType) {
      return NextResponse.json(
        { error: 'Instructor role not found in system' },
        { status: 500 }
      );
    }

    // Hash password untuk keamanan
    const hashedPassword = await hash(password, 10);

    // Generate ID untuk instructor dan user
    const instructorId = `inst_${Date.now()}`;
    const userId = `user_${Date.now()}`;

    // Buat instructor dan user sekaligus dengan relasi
    const newInstructure = await prisma.instructure.create({
      data: {
        id: instructorId,
        full_name: fullName,
        phone_number: phoneNumber,
        profiency: proficiency,
        address: address,
        photo: photo || null,
        user: {
          create: {
            id: userId,
            username: fullName.toLowerCase().replace(/\s+/g, '.'),
            email: email,
            password: hashedPassword,
            userTypeId: instructorType.id,
            last_login: new Date()
          }
        }
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      id: newInstructure.id,
      fullName: newInstructure.full_name,
      phoneNumber: newInstructure.phone_number,
      proficiency: newInstructure.profiency,
      address: newInstructure.address,
      photo: newInstructure.photo,
      email: email,
      username: newInstructure.user[0]?.username || null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating instructure:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create instructure: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create instructure' },
      { status: 500 }
    );
  }
} 