import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;  // classId
  };
}

// POST /api/course-schedule/[id]/participant - Add a participant to a course schedule
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: classId } = params;
    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Course schedule not found' },
        { status: 404 }
      );
    }

    // Check if participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if registration already exists
    const existingRegistration = await prisma.courseRegistration.findFirst({
      where: {
        classId,
        participantId
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Participant is already registered for this course' },
        { status: 409 }
      );
    }

    // Create registration
    const registration = await prisma.courseRegistration.create({
      data: {
        id: `reg_${Date.now()}`,
        classId,
        participantId,
        reg_date: new Date(),
        reg_status: 'Registered',
        payment: 0, // Initial payment is 0
        payment_status: 'Unpaid',
        present_day: 0 // Initial present days is 0
      },
      include: {
        participant: {
          select: {
            full_name: true,
            phone_number: true
          }
        }
      }
    });

    return NextResponse.json({
      id: registration.id,
      participantId: registration.participantId,
      name: registration.participant.full_name,
      presentDay: `${registration.present_day} days`,
      paymentStatus: registration.payment_status,
      regDate: registration.reg_date,
      regStatus: registration.reg_status
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding participant to course schedule:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to add participant: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}

// DELETE /api/course-schedule/[id]/participant?registrationId=XXX - Remove a participant from a course schedule
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id: classId } = params;
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required as a query parameter' },
        { status: 400 }
      );
    }

    // Check if registration exists
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        id: registrationId,
        classId
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if there are certifications linked to this registration
    const hasCertifications = await prisma.certification.count({
      where: {
        registrationId
      }
    }) > 0;

    if (hasCertifications) {
      return NextResponse.json(
        { 
          error: 'Cannot delete registration with issued certificates',
          hint: 'Delete the certificates first'
        },
        { status: 400 }
      );
    }

    // Delete value reports first
    await prisma.valueReport.deleteMany({
      where: {
        registrationId
      }
    });

    // Delete registration
    await prisma.courseRegistration.delete({
      where: {
        id: registrationId
      }
    });

    return NextResponse.json(
      { message: 'Participant removed from course successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing participant from course schedule:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to remove participant: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
} 