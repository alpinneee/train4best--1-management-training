const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.certification.deleteMany()
  await prisma.courseRegistration.deleteMany()
  await prisma.instructureClass.deleteMany()
  await prisma.class.deleteMany()
  await prisma.course.deleteMany()
  await prisma.courseType.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.instructure.deleteMany()
  await prisma.user.deleteMany()
  await prisma.userType.deleteMany()

  // Seed user types
  const userTypes = [
    { id: 'utype_1', usertype: 'admin' },
    { id: 'utype_2', usertype: 'participant' },
    { id: 'utype_3', usertype: 'instructor' }, // Pastikan ada role instructor
  ]
  
  for (const userType of userTypes) {
    await prisma.userType.upsert({
      where: { id: userType.id },
      update: {},
      create: userType,
    })
  }

  // Create Admin User
  const adminPassword = await hash('admin123', 10)
  await prisma.user.create({
    data: {
      id: '1',
      username: 'admin',
      email: 'admin@train4best.com',
      password: adminPassword,
      userTypeId: 'utype_1'
    }
  })

  // Create Sample Instructor
  await prisma.instructure.create({
    data: {
      id: '1',
      full_name: 'John Doe',
      phone_number: '081234567890',
      address: 'Jakarta, Indonesia',
      profiency: 'Web Development',
      user: {
        create: {
          id: '2',
          username: 'johndoe',
          email: 'john@train4best.com',
          password: await hash('instructor123', 10),
          userTypeId: 'utype_3'
        }
      }
    }
  })

  // Create Sample Course Type
  const courseType = await prisma.courseType.create({
    data: {
      id: '1',
      course_type: 'Technology'
    }
  })

  // Create Sample Course
  const course = await prisma.course.create({
    data: {
      id: '1',
      course_name: 'Web Development Fundamentals',
      courseTypeId: courseType.id
    }
  })

  // Create Sample Class
  await prisma.class.create({
    data: {
      id: '1',
      quota: 20,
      price: 1000000,
      status: 'open',
      start_reg_date: new Date(),
      end_reg_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      duration_day: 30,
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
      location: 'Online',
      room: 'Virtual Room 1',
      courseId: course.id
    }
  })

  // Create participant users with their participant profiles
  await prisma.user.create({
    data: {
      id: 'user_3',
      username: 'sarah',
      email: 'sarah@participant.com',
      password: await hash('participant123', 10),
      userTypeId: 'utype_2',
      participant: {
        create: {
          id: 'part_1',
          full_name: 'Sarah Johnson',
          address: '123 Main Street',
          phone_number: '555-123-4567',
          birth_date: new Date('1995-05-15'),
          job_title: 'Software Developer',
          company: 'Tech Solutions Inc',
          gender: 'Female',
        }
      }
    }
  })

  await prisma.user.create({
    data: {
      id: 'user_4',
      username: 'michael',
      email: 'michael@participant.com',
      password: await hash('participant123', 10),
      userTypeId: 'utype_2',
      participant: {
        create: {
          id: 'part_2',
          full_name: 'Michael Brown',
          address: '456 Oak Avenue',
          phone_number: '555-987-6543',
          birth_date: new Date('1990-11-22'),
          job_title: 'Marketing Manager',
          company: 'ABC Corporation',
          gender: 'Male',
        }
      }
    }
  })

  console.log('Database has been seeded! 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 