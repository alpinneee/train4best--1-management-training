import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

// GET /api/user - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        userType: {
          select: {
            usertype: true,
          },
        },
        last_login: true,
      },
      orderBy: {
        username: 'asc',
      },
    })

    // Format response for frontend
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.userType.usertype,
      createdAt: user.last_login ? new Date(user.last_login).toISOString() : null,
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/user - Create a new user
export async function POST(request: Request) {
  try {
    const { username, password, jobTitle, email } = await request.json()

    if (!username || !password || !jobTitle || !email) {
      return NextResponse.json(
        { error: 'Username, password, email, and role are required' },
        { status: 400 }
      )
    }

    // Find the userType by name
    const userType = await prisma.userType.findFirst({
      where: {
        usertype: jobTitle,
      },
    })

    if (!userType) {
      return NextResponse.json(
        { error: `Role "${jobTitle}" not found` },
        { status: 404 }
      )
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Generate unique ID
    const userId = `user_${Date.now()}`

    // Berbeda perlakuan berdasarkan role
    const jobTitleLower = jobTitle.toLowerCase();
    
    if (jobTitleLower === 'instructor') {
      // Buat instructure terlebih dahulu
      const newInstructure = await prisma.instructure.create({
        data: {
          id: `inst_${Date.now()}`,
          full_name: username,
          phone_number: "-", // Default value
          address: "-", // Default value
          profiency: "-", // Default value
        }
      });
      
      // Kemudian buat user dengan referensi ke instructure
    const newUser = await prisma.user.create({
      data: {
          id: userId,
        username,
        email,
          password: hashedPassword,
        userTypeId: userType.id,
          instructureId: newInstructure.id,
        last_login: new Date(),
      },
      include: {
        userType: true,
      },
      });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.username,
      email: newUser.email,
      role: newUser.userType.usertype,
      createdAt: newUser.last_login ? new Date(newUser.last_login).toISOString() : null,
      }, { status: 201 });
    } else if (jobTitleLower === 'participant') {
      // Buat user terlebih dahulu
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          username,
          email,
          password: hashedPassword,
          userTypeId: userType.id,
          last_login: new Date(),
        },
        include: {
          userType: true,
        },
      });
      
      // Kemudian buat participant dengan referensi ke user
      await prisma.participant.create({
        data: {
          id: `participant_${Date.now()}`,
          full_name: username,
          phone_number: "-", // Default value
          address: "-", // Default value
          gender: "Unknown", // Default value
          birth_date: new Date(), // Default to current date
          userId: newUser.id,
        }
      });

      return NextResponse.json({
        id: newUser.id,
        name: newUser.username,
        email: newUser.email,
        role: newUser.userType.usertype,
        createdAt: newUser.last_login ? new Date(newUser.last_login).toISOString() : null,
      }, { status: 201 });
    } else {
      // Create new user without instructor/participant data (for admin or other roles)
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          username,
          email,
          password: hashedPassword,
          userTypeId: userType.id,
          last_login: new Date(),
        },
        include: {
          userType: true,
        },
      });

      return NextResponse.json({
        id: newUser.id,
        name: newUser.username,
        email: newUser.email,
        role: newUser.userType.usertype,
        createdAt: newUser.last_login ? new Date(newUser.last_login).toISOString() : null,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 