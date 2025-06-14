import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;  // classId
  };
}

// POST /api/course-schedule/[id]/participant/certificate - Add a certificate for a participant
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: classId } = params;
    const { participantId, certificateNumber, registrationDate, issueDate, pdfUrl } = await request.json();

    if (!participantId || !certificateNumber) {
      return NextResponse.json(
        { error: 'Participant ID and certificate number are required' },
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

    // Check if registration exists
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        classId,
        participantId
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Participant is not registered for this course' },
        { status: 404 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        registrationId: registration.id
      }
    });

    if (existingCertificate) {
      // Update existing certificate
      const updatedCertificate = await prisma.certificate.update({
        where: {
          id: existingCertificate.id
        },
        data: {
          certificate_number: certificateNumber,
          registration_date: registrationDate ? new Date(registrationDate) : existingCertificate.registration_date,
          issue_date: issueDate ? new Date(issueDate) : existingCertificate.issue_date,
          pdf_url: pdfUrl || existingCertificate.pdf_url
        }
      });

      return NextResponse.json({
        id: updatedCertificate.id,
        certificateNumber: updatedCertificate.certificate_number,
        registrationDate: updatedCertificate.registration_date,
        issueDate: updatedCertificate.issue_date,
        pdfUrl: updatedCertificate.pdf_url,
        message: 'Certificate updated successfully'
      }, { status: 200 });
    }

    // Create new certificate
    const certificate = await prisma.certificate.create({
      data: {
        id: `cert_${Date.now()}`,
        certificate_number: certificateNumber,
        registration_date: registrationDate ? new Date(registrationDate) : new Date(),
        issue_date: issueDate ? new Date(issueDate) : new Date(),
        pdf_url: pdfUrl || null,
        registrationId: registration.id
      }
    });

    return NextResponse.json({
      id: certificate.id,
      certificateNumber: certificate.certificate_number,
      registrationDate: certificate.registration_date,
      issueDate: certificate.issue_date,
      pdfUrl: certificate.pdf_url,
      message: 'Certificate created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding certificate:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to add certificate: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add certificate' },
      { status: 500 }
    );
  }
}

// GET /api/course-schedule/[id]/participant/certificate?participantId=XXX - Get certificate for a participant
export async function GET(request: Request, { params }: Params) {
  try {
    const { id: classId } = params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required as a query parameter' },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        classId,
        participantId
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Participant is not registered for this course' },
        { status: 404 }
      );
    }

    // Find certificate
    const certificate = await prisma.certificate.findFirst({
      where: {
        registrationId: registration.id
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found for this participant' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: certificate.id,
      certificateNumber: certificate.certificate_number,
      registrationDate: certificate.registration_date,
      issueDate: certificate.issue_date,
      pdfUrl: certificate.pdf_url
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch certificate: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}

// DELETE /api/course-schedule/[id]/participant/certificate?participantId=XXX - Delete certificate for a participant
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id: classId } = params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required as a query parameter' },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        classId,
        participantId
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Participant is not registered for this course' },
        { status: 404 }
      );
    }

    // Find certificate
    const certificate = await prisma.certificate.findFirst({
      where: {
        registrationId: registration.id
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found for this participant' },
        { status: 404 }
      );
    }

    // Delete certificate
    await prisma.certificate.delete({
      where: {
        id: certificate.id
      }
    });

    return NextResponse.json(
      { message: 'Certificate deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting certificate:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to delete certificate: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 }
    );
  }
} 