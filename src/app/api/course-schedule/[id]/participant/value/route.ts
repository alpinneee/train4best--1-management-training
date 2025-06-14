import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;  // classId
  };
}

// GET /api/course-schedule/[id]/participant/value?participantId=XXX - Get values for a participant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get("participantId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        classId: scheduleId,
        participantId
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Participant is not registered for this course' },
        { status: 404 }
      );
    }

    // Find values
    const values = await prisma.valueReport.findMany({
      where: {
        registrationId: registration.id
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Count total values for pagination
    const totalValues = await prisma.valueReport.count({
      where: {
        registrationId: registration.id
      }
    });

    const totalPages = Math.ceil(totalValues / pageSize);
    
    const formattedValues = values.map(value => ({
      id: value.id,
      valueType: value.value_type,
      remark: value.remark,
      value: value.value.toString()
    }));

    return NextResponse.json({
      values: formattedValues,
      currentPage: page,
      totalPages: totalPages,
      totalValues: totalValues
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching participant values:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant values" },
      { status: 500 }
    );
  }
}

// POST /api/course-schedule/[id]/participant/value - Add a value for a participant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    const data = await request.json();
    const { participantId, valueType, remark, value } = data;

    if (!participantId || !valueType || !value) {
      return NextResponse.json(
        { error: "Participant ID, value type, and value are required" },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        classId: scheduleId,
        participantId
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Participant is not registered for this course' },
        { status: 404 }
      );
    }

    // Create value
    const valueReport = await prisma.valueReport.create({
      data: {
        id: `val_${Date.now()}`,
        registrationId: registration.id,
        value_type: valueType,
        remark: remark || '',
        value: Number(value)
      }
    });

    return NextResponse.json({
      id: valueReport.id,
      valueType: valueReport.value_type,
      remark: valueReport.remark,
      value: valueReport.value.toString(),
      message: 'Value added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding participant value:", error);
    return NextResponse.json(
      { error: "Failed to add participant value" },
      { status: 500 }
    );
  }
}

// PUT /api/course-schedule/[id]/participant/value - Update a value
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id: classId } = params;
    const { valueId, valueType, remark, value } = await request.json();

    if (!valueId) {
      return NextResponse.json(
        { error: 'Value ID is required' },
        { status: 400 }
      );
    }

    // Find value
    const existingValue = await prisma.valueReport.findUnique({
      where: {
        id: valueId
      }
    });

    if (!existingValue) {
      return NextResponse.json(
        { error: 'Value not found' },
        { status: 404 }
      );
    }

    // Update value
    const updatedValue = await prisma.valueReport.update({
      where: {
        id: valueId
      },
      data: {
        value_type: valueType || existingValue.value_type,
        remark: remark !== undefined ? remark : existingValue.remark,
        value: value !== undefined ? Number(value) : existingValue.value
      }
    });

    return NextResponse.json({
      id: updatedValue.id,
      valueType: updatedValue.value_type,
      remark: updatedValue.remark,
      value: updatedValue.value.toString(),
      message: 'Value updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating value:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update value: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update value' },
      { status: 500 }
    );
  }
}

// DELETE /api/course-schedule/[id]/participant/value?valueId=XXX - Delete a value
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { searchParams } = new URL(request.url);
    const valueId = searchParams.get('valueId');

    if (!valueId) {
      return NextResponse.json(
        { error: 'Value ID is required as a query parameter' },
        { status: 400 }
      );
    }

    // Find value
    const value = await prisma.valueReport.findUnique({
      where: {
        id: valueId
      }
    });

    if (!value) {
      return NextResponse.json(
        { error: 'Value not found' },
        { status: 404 }
      );
    }

    // Delete value
    await prisma.valueReport.delete({
      where: {
        id: valueId
      }
    });

    return NextResponse.json(
      { message: 'Value deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting value:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to delete value: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete value' },
      { status: 500 }
    );
  }
} 