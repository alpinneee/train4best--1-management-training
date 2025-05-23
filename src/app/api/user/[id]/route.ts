import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Jika force delete, hapus data terkait
    if (force) {
      // Gunakan transaksi untuk memastikan semua operasi berhasil
      await prisma.$transaction(async (prisma) => {
        // Jika ada data instructor, hapus
        if (existingUser.instructure) {
          await prisma.instructure.delete({
            where: {
              id: existingUser.instructure.id
            }
          });
        }

        // Jika ada data participant, hapus
        if (existingUser.participant.length > 0) {
          for (const participant of existingUser.participant) {
            await prisma.participant.delete({
              where: {
                id: participant.id
              }
            });
          }
        }

        // Hapus user
        await prisma.user.delete({
          where: {
            id,
          },
        });
      });

      return NextResponse.json(
        { message: 'User and all associated data deleted successfully' },
        { status: 200 }
      );
    } else {
      // Cek apakah user memiliki data terkait
      if (existingUser.instructure || existingUser.participant.length > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete user that has associated records',
            hint: 'Add ?force=true to URL to force deletion'
          },
          { status: 400 }
        );
      }

      // Hapus user tanpa data terkait
      await prisma.user.delete({
        where: {
          id,
        },
      });

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      );
    }
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
    const { username, jobTitle, password, email } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        userType: true,
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

    // Find the userType by name
    let userTypeId = existingUser.userTypeId;
    let newRoleIsInstructor = false;
    let newRoleIsParticipant = false;
    
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
      
      // Check role type
      const roleLower = jobTitle.toLowerCase();
      newRoleIsInstructor = roleLower === 'instructor';
      newRoleIsParticipant = roleLower === 'participant';
    }

    // Check if email is already in use by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id
          }
        }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already in use by another user' },
          { status: 409 }
        );
      }
    }

    // Create update data object
    const updateData: {
      username?: string;
      email?: string;
      userTypeId?: string;
      password?: string;
    } = {};
    
    if (username) {
      updateData.username = username;
    }
    
    if (email) {
      updateData.email = email;
    }
    
    if (userTypeId !== existingUser.userTypeId) {
      updateData.userTypeId = userTypeId;
    }
    
    if (password) {
      // Hash the password before saving
      updateData.password = await hash(password, 10);
    }

    // Jika role berubah menjadi instructor dan user tidak memiliki data instructor, buat data
    if (newRoleIsInstructor && !existingUser.instructure) {
      // Add the instructor data
      await prisma.instructure.create({
        data: {
          id: `inst_${Date.now()}`,
          full_name: username || existingUser.username,
          phone_number: "-", // Default value
          address: "-", // Default value
          profiency: "-", // Default value
          user: {
            connect: {
              id: existingUser.id
            }
          }
        }
      });
    }
    
    // Jika role berubah menjadi participant dan user tidak memiliki data participant, buat data
    if (newRoleIsParticipant && existingUser.participant.length === 0) {
      // Add the participant data
      await prisma.participant.create({
        data: {
          id: `participant_${Date.now()}`,
          full_name: username || existingUser.username,
          phone_number: "-", // Default value
          address: "-", // Default value
          gender: "Unknown", // Default value
          birth_date: new Date(), // Default to current date
          userId: existingUser.id,
        }
      });
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