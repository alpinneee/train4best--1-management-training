import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const where: any = {
      OR: [
        { full_name: { contains: search } },
        { phone_number: { contains: search } },
      ],
    };

    if (proficiency && proficiency !== 'all') {
      where.profiency = proficiency;
    }

    // Mendapatkan total jumlah data
    const total = await prisma.instructure.count({ where });

    // Mendapatkan data instruktur
    const instructures = await prisma.instructure.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        full_name: 'asc',
      },
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
    const { fullName, phoneNumber, proficiency, address, photo, email, password, username } = await request.json();

    if (!fullName || !phoneNumber || !proficiency || !address || !email || !password || !username) {
      return NextResponse.json(
        { error: 'Full name, phone number, proficiency, address, email, password, and username are required' },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    // Get the Instructure user type
    const instructureUserType = await prisma.userType.findFirst({
      where: { usertype: 'Instructure' }
    });

    if (!instructureUserType) {
      return NextResponse.json(
        { error: 'Instructure user type not found' },
        { status: 500 }
      );
    }

    // Create instructure and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create instructure first
      const newInstructure = await tx.instructure.create({
        data: {
          id: Date.now().toString(), // Generate ID sederhana
          full_name: fullName,
          phone_number: phoneNumber,
          profiency: proficiency,
          address: address,
          photo: photo || null,
        },
      });

      // Create user with reference to instructure
      const newUser = await tx.user.create({
        data: {
          id: Date.now().toString() + '_user', // Generate unique ID for user
          email,
          username,
          password, // Note: In production, this should be hashed
          userTypeId: instructureUserType.id,
          instructureId: newInstructure.id,
        },
      });

      return { instructure: newInstructure, user: newUser };
    });

    return NextResponse.json({
      id: result.instructure.id,
      fullName: result.instructure.full_name,
      phoneNumber: result.instructure.phone_number,
      proficiency: result.instructure.profiency,
      address: result.instructure.address,
      photo: result.instructure.photo,
      email: result.user.email,
      username: result.user.username,
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