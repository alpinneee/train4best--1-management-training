import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/instructure/[id] - Mendapatkan instruktur berdasarkan ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;

    const instructure = await prisma.instructure.findUnique({
      where: {
        id,
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

    if (!instructure) {
      return NextResponse.json(
        { error: 'Instructure not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: instructure.id,
      fullName: instructure.full_name,
      phoneNumber: instructure.phone_number,
      proficiency: instructure.profiency,
      address: instructure.address,
      photo: instructure.photo || null,
      userId: instructure.user?.[0]?.id || null,
      username: instructure.user?.[0]?.username || null,
      email: instructure.user?.[0]?.email || null,
    });
  } catch (error) {
    console.error('Error fetching instructure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructure' },
      { status: 500 }
    );
  }
}

// PUT /api/instructure/[id] - Memperbarui instruktur
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { fullName, phoneNumber, proficiency, address, photo, email, password } = await request.json();

    // Periksa apakah instruktur ada
    const existingInstructure = await prisma.instructure.findUnique({
      where: {
        id,
      },
      include: {
        user: true
      }
    });

    if (!existingInstructure) {
      return NextResponse.json(
        { error: 'Instructure not found' },
        { status: 404 }
      );
    }

    // Perbarui data instructor
    const updatedData: any = {
      full_name: fullName || existingInstructure.full_name,
      phone_number: phoneNumber || existingInstructure.phone_number,
      profiency: proficiency || existingInstructure.profiency,
      address: address || existingInstructure.address,
      photo: photo || existingInstructure.photo,
    };

    // Jika ada pengguna terkait, perbarui juga data user
    const users = existingInstructure.user;
    if (users && users.length > 0) {
      const user = users[0];

      // Periksa jika email berubah, pastikan tidak konflik dengan email lain
      if (email && email !== user.email) {
        const existingUserWithEmail = await prisma.user.findFirst({
          where: {
            email,
            NOT: {
              id: user.id
            }
          }
        });

        if (existingUserWithEmail) {
          return NextResponse.json(
            { error: 'Email already in use by another user' },
            { status: 409 }
          );
        }
      }

      // Perbarui user terkait
      const userUpdateData: any = {
        username: fullName.toLowerCase().replace(/\s+/g, '.') // Update username jika nama berubah
      };
      
      if (email) {
        userUpdateData.email = email;
      }
      
      if (password && password.trim() !== '') {
        userUpdateData.password = await hash(password, 10);
      }

      // Update user jika ada perubahan data
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData
        });
      }
    } else if (email) {
      // Jika tidak ada user terkait tapi ada email, cari userType untuk instructor
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

      // Buat user baru
      const hashedPassword = password ? await hash(password, 10) : await hash("password123", 10);
      
      await prisma.user.create({
        data: {
          id: `user_${Date.now()}`,
          username: fullName.toLowerCase().replace(/\s+/g, '.'),
          email: email,
          password: hashedPassword,
          userTypeId: instructorType.id,
          last_login: new Date(),
          instructure: {
            connect: {
              id: existingInstructure.id
            }
          }
        }
      });
    }

    // Perbarui instruktur
    const updatedInstructure = await prisma.instructure.update({
      where: {
        id,
      },
      data: updatedData,
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

    return NextResponse.json({
      id: updatedInstructure.id,
      fullName: updatedInstructure.full_name,
      phoneNumber: updatedInstructure.phone_number,
      proficiency: updatedInstructure.profiency,
      address: updatedInstructure.address,
      photo: updatedInstructure.photo,
      email: updatedInstructure.user[0]?.email || email || null,
    });
  } catch (error) {
    console.error('Error updating instructure:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update instructure: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update instructure' },
      { status: 500 }
    );
  }
}

// DELETE /api/instructure/[id] - Menghapus instruktur
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    console.log(`Attempting to delete instructure with ID: ${id}, force: ${force}`);
    
    // Periksa apakah instruktur ada
    const existingInstructure = await prisma.instructure.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!existingInstructure) {
      console.log(`Instructure with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Instructure not found' },
        { status: 404 }
      );
    }

    console.log(`Found instructure: ${existingInstructure.full_name}`);

    // Jika tidak force delete, periksa relasi
    if (!force) {
      // Cek relasi kelas - menggunakan camelCase untuk nama model sesuai dengan Prisma
      try {
        const classesCount = await prisma.instructureClass.count({
          where: { instructureId: id }
        });
        
        if (classesCount > 0) {
          console.log(`Cannot delete: ${classesCount} classes associated with this instructure`);
          return NextResponse.json(
            { 
              error: 'Cannot delete instructure that is associated with classes',
              hint: 'Add ?force=true to URL to force deletion'
            },
            { status: 400 }
          );
        }
      } catch (relError) {
        console.error('Error checking class relations:', relError);
      }
    }

    // Hapus user terkait jika ada
    if (existingInstructure.user && existingInstructure.user.length > 0) {
      const userId = existingInstructure.user[0].id;
      console.log(`Deleting linked user account with ID: ${userId}`);
      
      try {
        await prisma.user.delete({
          where: { id: userId }
        });
        console.log(`Successfully deleted user with ID: ${userId}`);
      } catch (userError) {
        console.error('Error deleting user:', userError);
        if (!force) {
          return NextResponse.json(
            { 
              error: 'Failed to delete linked user account', 
              hint: 'Add ?force=true to URL to force deletion of instructor only' 
            },
            { status: 500 }
          );
        }
      }
    }

    // Hapus instruktur
    console.log(`Proceeding with deletion of instructure ID: ${id}`);
    
    await prisma.instructure.delete({
      where: { id },
    });

    console.log(`Successfully deleted instructure ID: ${id}`);
    
    return NextResponse.json(
      { message: 'Instructure and linked user account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting instructure:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to delete instructure: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete instructure' },
      { status: 500 }
    );
  }
}