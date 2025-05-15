import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/usertype/[id] - Get a specific usertype
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;

    const usertype = await prisma.userType.findUnique({
      where: {
        id,
      },
    });

    if (!usertype) {
      return NextResponse.json(
        { error: 'Usertype not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      idUsertype: usertype.id,
      usertype: usertype.usertype,
    });
  } catch (error) {
    console.error('Error fetching usertype:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usertype' },
      { status: 500 }
    );
  }
}

// PUT /api/usertype/[id] - Update a usertype
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { usertype } = await request.json();

    if (!usertype) {
      return NextResponse.json(
        { error: 'Usertype name is required' },
        { status: 400 }
      );
    }

    // Check if usertype exists
    const existingUsertype = await prisma.userType.findUnique({
      where: {
        id,
      },
    });

    if (!existingUsertype) {
      return NextResponse.json(
        { error: 'Usertype not found' },
        { status: 404 }
      );
    }

    // Check if the new name conflicts with another usertype
    const existingUsertypes = await prisma.userType.findMany();
    const usertypeLower = usertype.toLowerCase();
    
    const conflictingUsertype = existingUsertypes.find(
      (ut) => ut.usertype.toLowerCase() === usertypeLower && ut.id !== id
    );

    if (conflictingUsertype) {
      return NextResponse.json(
        { error: 'Another usertype with this name already exists' },
        { status: 409 }
      );
    }

    // Update usertype
    const updatedUsertype = await prisma.userType.update({
      where: {
        id,
      },
      data: {
        usertype,
      },
    });

    return NextResponse.json({
      idUsertype: updatedUsertype.id,
      usertype: updatedUsertype.usertype,
    });
  } catch (error) {
    console.error('Error updating usertype:', error);
    return NextResponse.json(
      { error: 'Failed to update usertype' },
      { status: 500 }
    );
  }
}

// DELETE /api/usertype/[id] - Delete a usertype
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;

    // Check if usertype exists
    const existingUsertype = await prisma.userType.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          take: 1, // Only need to check if there are any users
        },
      },
    });

    if (!existingUsertype) {
      return NextResponse.json(
        { error: 'Usertype not found' },
        { status: 404 }
      );
    }

    // Check if usertype is in use
    if (existingUsertype.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete usertype that is in use by users' },
        { status: 400 }
      );
    }

    // Delete usertype
    await prisma.userType.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Usertype deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting usertype:', error);
    return NextResponse.json(
      { error: 'Failed to delete usertype' },
      { status: 500 }
    );
  }
} 