import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/usertype - Get all usertypes
export async function GET() {
  try {
    const usertypes = await prisma.userType.findMany({
      select: {
        id: true,
        usertype: true,
      },
      orderBy: {
        usertype: 'asc',
      },
    });

    // Format the response to match the expected structure in the frontend
    const formattedUsertypes = usertypes.map((usertype, index) => ({
      no: index + 1,
      idUsertype: usertype.id,
      usertype: usertype.usertype,
    }));

    return NextResponse.json(formattedUsertypes);
  } catch (error) {
    console.error('Error fetching usertypes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usertypes' },
      { status: 500 }
    );
  }
}

// POST /api/usertype - Create a new usertype
export async function POST(request: Request) {
  try {
    const { usertype } = await request.json();

    if (!usertype) {
      return NextResponse.json(
        { error: 'Usertype name is required' },
        { status: 400 }
      );
    }

    // Check if usertype already exists
    const existingUsertypes = await prisma.userType.findMany();
    const usertypeLower = usertype.toLowerCase();
    
    const existingUsertype = existingUsertypes.find(
      (ut) => ut.usertype.toLowerCase() === usertypeLower
    );

    if (existingUsertype) {
      return NextResponse.json(
        { error: 'Usertype already exists' },
        { status: 409 }
      );
    }

    // Create new usertype
    const newUsertype = await prisma.userType.create({
      data: {
        id: `utype_${Date.now()}`,
        usertype,
      },
    });

    return NextResponse.json({
      idUsertype: newUsertype.id,
      usertype: newUsertype.usertype,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating usertype:', error);
    return NextResponse.json(
      { error: 'Failed to create usertype' },
      { status: 500 }
    );
  }
} 