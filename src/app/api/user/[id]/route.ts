import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/user/[id] - Get a specific user
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        userType: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.userType.usertype,
      createdAt: user.last_login ? new Date(user.last_login).toISOString() : null,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/[id] - Delete a user
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        instructure: true,
        participant: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has associated data
    if ((existingUser.instructure || existingUser.participant.length > 0) && !force) {
      return NextResponse.json(
        { error: 'Cannot delete user that has associated records', hint: 'Add ?force=true to URL to force deletion' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/[id] - Update a user
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { username, jobTitle, password } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the userType by name
    let userTypeId = existingUser.userTypeId;
    
    if (jobTitle) {
      const userType = await prisma.userType.findFirst({
        where: {
          usertype: jobTitle,
        },
      });

      if (!userType) {
        return NextResponse.json(
          { error: `Role "${jobTitle}" not found` },
          { status: 404 }
        );
      }
      
      userTypeId = userType.id;
    }

    // Create update data object
    const updateData: any = {};
    
    if (username) {
      updateData.username = username;
    }
    
    if (userTypeId !== existingUser.userTypeId) {
      updateData.userTypeId = userTypeId;
    }
    
    if (password) {
      updateData.password = password; // In production, hash this password
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        userType: true,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.userType.usertype,
      createdAt: updatedUser.last_login ? new Date(updatedUser.last_login).toISOString() : null,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 