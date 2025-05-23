import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }
    
    // Find the user to check role and participant profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { participant: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get user type
    const userType = await prisma.userType.findUnique({
      where: { id: user.userTypeId },
    });
    
    // Check if user needs to complete profile
    let redirectToProfile = false;
    
    // Conditions to redirect to profile:
    // 1. User has 'unassigned' role
    // 2. User doesn't have a participant profile
    // 3. User's participant profile has incomplete required fields
    if (userType?.usertype === 'unassigned') {
      redirectToProfile = true;
    } else if (!user.participant || user.participant.length === 0) {
      // If user doesn't have a participant profile yet and isn't an admin or instructor
      if (userType?.usertype !== 'admin' && userType?.usertype !== 'instructor') {
        redirectToProfile = true;
      }
    } else if (user.participant.length > 0) {
      // Check for incomplete required fields in participant profile
      const participant = user.participant[0];
      if (!participant.phone_number || !participant.address || !participant.gender) {
        redirectToProfile = true;
      }
    }
    
    return NextResponse.json({
      userType: userType?.usertype || 'unassigned',
      redirectToProfile,
      hasCompletedProfile: !redirectToProfile,
    });
    
  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json(
      { error: "Failed to check profile status" },
      { status: 500 }
    );
  }
} 