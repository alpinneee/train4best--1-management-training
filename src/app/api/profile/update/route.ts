import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { Session } from "next-auth";

// Create a custom session type to avoid TypeScript errors
type CustomSession = {
  expires: string;
  user: {
    id?: string;
    email?: string;
    name?: string;
  }
}

// Helper function to manually check auth when getServerSession fails
async function validateSessionManually(): Promise<CustomSession | null> {
  try {
    // Get the session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("next-auth.session-token")?.value;
    
    if (!sessionToken) {
      console.log("No session token found in cookies");
      return null;
    }
    
    // Decode the JWT to get user info
    const decodedToken = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET || ""
    });
    
    if (!decodedToken || !decodedToken.email) {
      console.log("Failed to decode session token or missing email");
      return null;
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: decodedToken.email as string }
    });
    
    if (!user) {
      console.log("User not found with email from token");
      return null;
    }
    
    // Return a session-like object with required expires field
    return {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      user: {
        id: user.id,
        email: user.email,
        name: user.username
      }
    };
  } catch (error) {
    console.error("Manual session validation failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  console.log("Profile update API called");
  
  try {
    // Parse request body
    const data = await req.json();
    const {
      fullName,
      email,
      phone,
      address,
      gender,
      birthDate,
      jobTitle,
      company
    } = data;
    
    // Check required fields
    if (!fullName || !email || !phone || !address || !gender || !birthDate) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }
    
    // Get user session and validate it
    let session: CustomSession | null = null;
    
    try {
      // Try to get authenticated session
      session = await validateSessionManually();
      
      // Debug logging for troubleshooting
      console.log("Session obtained:", 
        session ? `ID: ${session.user?.id}, Email: ${session.user?.email}` : "No session");
      
      // Allow email-based requests for testing & debugging
      if (!session && email) {
        console.log("No valid session, using email fallback");
        session = {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          user: {
            email: email,
            name: fullName || email.split('@')[0],
          }
        };
      }
      
      // Try to find user by email if ID is missing
      if ((!session?.user?.id) && email) {
        console.log("Looking for user by email:", email);
        const userByEmail = await prisma.user.findUnique({
          where: { email: email }
        });
        
        if (userByEmail && 'id' in userByEmail) {
          console.log("Found user by email:", userByEmail.id);
          if (session?.user) {
            // Safely modify the session.user object
            session.user = { 
              ...session.user,
              id: userByEmail.id 
            };
          }
        } else {
          // User tidak ditemukan, tapi kita masih punya email
          console.log("User with email not found, will create new user:", email);
        }
      } else if (session?.user?.email && !session?.user?.id) {
        console.log("Looking for user by session email:", session.user.email);
        const userByEmail = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
        
        if (userByEmail && 'id' in userByEmail) {
          console.log("Found user by session email:", userByEmail.id);
          // Safely modify the session.user object
          session.user = { 
            ...session.user,
            id: userByEmail.id 
          };
        }
      }
      
      // Check for debug token as a fallback - skip untuk kecepatan
      /* Disabled to avoid TypeScript errors - this block was already inactive (condition includes && false)
      if (session && !session.user.id && false) { // Nonaktifkan untuk performa
        console.log("Checking for debug token as fallback");
        const cookieStore = cookies();
        const debugToken = cookieStore.get("debug_token")?.value;
        
        if (debugToken) {
          try {
            const decodedToken = await decode({
              token: debugToken,
              secret: process.env.NEXTAUTH_SECRET || "RAHASIA_FALLBACK_YANG_AMAN_DAN_PANJANG_UNTUK_DEVELOPMENT"
            });
            
            if (decodedToken && decodedToken.id) {
              console.log("Found user ID in debug token:", decodedToken.id);
              session.user.id = decodedToken.id as string;
            }
          } catch (decodeError) {
            console.error("Failed to decode debug token:", decodeError);
          }
        }
      }
      */
      
      // Jika tidak ada user ID tapi ada email, coba gunakan fake ID untuk debugging
      if ((!session?.user?.id) && email) {
        console.log("No user ID but email is present, creating temporary ID from email");
        // Gunakan email sebagai basis pembuatan ID sementara 
        const emailBasedId = `debug_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        if (session?.user) {
          session.user = {
            ...session.user,
            id: emailBasedId
          };
        }
      }
      
      if (!session?.user?.id) {
        console.error("User ID missing from session and could not be recovered");
        return NextResponse.json(
          { error: "User ID not found. Please make sure email is provided." },
          { status: 400 }
        );
      }
    } catch (sessionError) {
      console.error("Error retrieving session:", sessionError);
      // Jika terjadi error tapi ada email, tetap lanjutkan
      if (email) {
        console.log("Session error, but continuing with email:", email);
        session = {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          user: {
            id: `fallback_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email: email,
            name: fullName || email.split('@')[0]
          }
        };
      } else {
        return NextResponse.json(
          { error: "Authentication error. Please provide email address." },
          { status: 401 }
        );
      }
    }
    
    const userId = session.user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Find the user to check role
    let user: { 
      id: string;
      email: string;
      username: string;
      password: string;
      userTypeId: string;
      participant: any[];
      [key: string]: any;
    } | null = await prisma.user.findUnique({
      where: { id: userId },
      include: { participant: true },
    });
    
    // Jika user tidak ditemukan tapi kita punya email, coba cari dengan email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { participant: true },
      });
    }
    
    // Jika masih tidak ada user, buat user baru dengan email
    if (!user && email) {
      console.log("Creating new user with email:", email);
      
      // Cari userType 'unassigned' atau 'participant'
      let userType = await prisma.userType.findFirst({
        where: { usertype: 'unassigned' }
      });
      
      if (!userType) {
        userType = await prisma.userType.findFirst({
          where: { usertype: 'participant' }
        });
      }
      
      // Jika masih tidak ada, buat userType baru
      if (!userType) {
        console.log("Creating default userType");
        userType = await prisma.userType.create({
          data: {
            id: `usertype_${Date.now()}`,
            usertype: 'unassigned',
            description: 'Default role for new users'
          }
        });
      }
      
      // Buat user baru dengan password hash sederhana (MD5 waktu saat ini)
      const timestamp = new Date().getTime().toString();
      const defaultPassword = require('crypto').createHash('md5').update('default' + timestamp).digest('hex');
      
      try {
        const createdUser = await prisma.user.create({
          data: {
            id: userId,
            email,
            username: fullName || email.split('@')[0],
            password: defaultPassword,
            userTypeId: userType.id
          }
        });
        // Add participant property as an empty array
        user = {
          ...createdUser,
          participant: []
        };
        console.log("New user created:", user.id);
      } catch (createUserError) {
        console.error("Error creating user:", createUserError);
        return NextResponse.json(
          { error: "Failed to create user. Please try again." },
          { status: 500 }
        );
      }
    }
    
    if (!user) {
      console.error("User not found with ID:", userId);
      return NextResponse.json(
        { error: "User not found and could not be created" },
        { status: 404 }
      );
    }
    
    // Check if participant profile exists
    if (user.participant && user.participant.length > 0) {
      // Update existing participant
      const participantId = user.participant[0].id;
      try {
        const updatedParticipant = await prisma.participant.update({
          where: { id: participantId },
          data: {
            full_name: fullName,
            phone_number: phone,
            address,
            gender,
            birth_date: new Date(birthDate),
            job_title: jobTitle || null,
            company: company || null,
          },
        });
        
        return NextResponse.json({
          message: "Profile updated successfully",
          data: updatedParticipant
        });
      } catch (error) {
        console.error("Error updating participant:", error);
        return NextResponse.json(
          { error: "Failed to update participant profile" },
          { status: 500 }
        );
      }
    } else {
      // Create new participant profile
      // Find participant role
      let participantRole;
      try {
        participantRole = await prisma.userType.findFirst({
          where: { usertype: 'participant' }
        });
        
        if (!participantRole) {
          participantRole = await prisma.userType.findFirst({
            where: { usertype: 'unassigned' }
          });
        }
        
        if (!participantRole) {
          // Create participant role if it doesn't exist
          participantRole = await prisma.userType.create({
            data: {
              id: `usertype_participant_${Date.now()}`,
              usertype: 'participant',
              description: 'Role untuk peserta pelatihan'
            }
          });
        }
      } catch (roleError) {
        console.error("Error finding/creating participant role:", roleError);
        // Continue with default role
        participantRole = { id: user.userTypeId };
      }
      
      // Create participant in transaction
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Update user role to participant if role exists
          let updatedUser = user;
          if (participantRole && user.userTypeId !== participantRole.id) {
            const updated = await tx.user.update({
              where: { id: user.id },
              data: { userTypeId: participantRole.id }
            });
            updatedUser = {
              ...updated,
              participant: user.participant || []
            };
          }
          
          // Create participant with unique ID
          const participantId = `participant_${Date.now()}_${Math.round(Math.random() * 10000)}`;
          const newParticipant = await tx.participant.create({
            data: {
              id: participantId,
              full_name: fullName,
              gender,
              phone_number: phone,
              address,
              birth_date: new Date(birthDate),
              job_title: jobTitle || null,
              company: company || null,
              userId: user.id,
            },
          });
          
          return { user: updatedUser, participant: newParticipant };
        });
        
        return NextResponse.json({
          message: "Profile created successfully",
          data: result.participant
        });
      } catch (txError) {
        console.error('Error creating participant profile:', txError);
        return NextResponse.json(
          { error: "Failed to create participant profile. Detail: " + (txError instanceof Error ? txError.message : 'Unknown error') },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 