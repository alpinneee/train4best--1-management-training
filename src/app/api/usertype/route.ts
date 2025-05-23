import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ensure default unassigned role exists
async function ensureDefaultRolesExist() {
  const roles = [
    { id: 'utype_unassigned', usertype: 'unassigned', description: 'Default role for new users' },
    { id: 'utype_participant', usertype: 'participant', description: 'Training participant' }
  ];
  
  for (const role of roles) {
    const existingRole = await prisma.userType.findFirst({
      where: { usertype: role.usertype }
    });
    
    if (!existingRole) {
      await prisma.userType.create({
        data: role
      });
      console.log(`Created default role: ${role.usertype}`);
    }
  }
}

// GET /api/usertype - Get all usertypes
export async function GET() {
  try {
    // Ensure default roles exist on each GET request
    await ensureDefaultRolesExist();
    
    const usertypes = await prisma.userType.findMany({
      select: {
        id: true,
        usertype: true,
      },
      orderBy: {
        usertype: 'asc',
      },
    });

    return NextResponse.json(usertypes);
  } catch (error) {
    console.error('Error fetching user types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user types' },
      { status: 500 }
    );
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