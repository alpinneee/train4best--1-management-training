import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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
        instructure: true,
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
      instructureId: user.instructureId,
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

    // Fetch the user to check their current role
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        userType: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the userType for the new job title
    const userType = await prisma.userType.findFirst({
      where: { usertype: jobTitle },
    });

    if (!userType) {
      return NextResponse.json(
        { error: `User type "${jobTitle}" not found` },
        { status: 400 }
      );
    }

    // Check if we're changing to Instructure role from another role
    const isChangingToInstructure = 
      existingUser.userType.usertype !== "Instructure" && 
      jobTitle === "Instructure";

    // Update the user
    const updateData: any = {
      username,
      userTypeId: userType.id,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await hash(password, 10);
    }

    // Update user in transaction with possible instructure creation
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Create instructor record first if needed
      let instructureId = existingUser.instructureId;
      
      if (isChangingToInstructure && !instructureId) {
        // Create a basic instructure record
        const newInstructureId = uuidv4();
        
        const instructure = await tx.instructure.create({
          data: {
            id: newInstructureId,
            full_name: username, // Use username as initial full name
            phone_number: "",
            address: "",
            profiency: "", // Empty proficiency to be filled later
          },
        });
        
        instructureId = instructure.id;
      }
      
      // Update user with instructureId if applicable
      if (isChangingToInstructure && instructureId) {
        updateData.instructureId = instructureId;
      }
      
      // Update the user
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        include: {
          userType: true,
        },
      });

      return user;
    });

    // Transform the user data for response
    const responseUser = {
      id: updatedUser.id,
      name: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.userType.usertype,
      createdAt: updatedUser.last_login || new Date(),
      instructureId: updatedUser.instructureId,
    };

    return NextResponse.json(responseUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
} 