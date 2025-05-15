import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { fullName, phoneNumber, proficiency, address, photo } = await request.json();

    // Periksa apakah instruktur ada
    const existingInstructure = await prisma.instructure.findUnique({
      where: {
        id,
      },
    });

    if (!existingInstructure) {
      return NextResponse.json(
        { error: 'Instructure not found' },
        { status: 404 }
      );
    }

    // Perbarui instruktur
    const updatedInstructure = await prisma.instructure.update({
      where: {
        id,
      },
      data: {
        full_name: fullName || existingInstructure.full_name,
        phone_number: phoneNumber || existingInstructure.phone_number,
        profiency: proficiency || existingInstructure.profiency,
        address: address || existingInstructure.address,
        photo: photo || existingInstructure.photo,
      },
    });

    return NextResponse.json({
      id: updatedInstructure.id,
      fullName: updatedInstructure.full_name,
      phoneNumber: updatedInstructure.phone_number,
      proficiency: updatedInstructure.profiency,
      address: updatedInstructure.address,
      photo: updatedInstructure.photo,
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
      // Cek relasi user
      try {
        const usersCount = await prisma.user.count({
          where: { instructureId: id }
        });
        
        if (usersCount > 0) {
          console.log(`Cannot delete: ${usersCount} users associated with this instructure`);
          return NextResponse.json(
            { 
              error: 'Cannot delete instructure that is associated with users', 
              hint: 'Add ?force=true to URL to force deletion' 
            },
            { status: 400 }
          );
        }
      } catch (relError) {
        console.error('Error checking user relations:', relError);
      }

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

    // Hapus instruktur
    console.log(`Proceeding with deletion of instructure ID: ${id}`);
    
    await prisma.instructure.delete({
      where: { id },
    });

    console.log(`Successfully deleted instructure ID: ${id}`);
    
    return NextResponse.json(
      { message: 'Instructure deleted successfully' },
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