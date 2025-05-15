const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Create UserType
  const adminType = await prisma.userType.create({
    data: {
      usertype: 'admin'
    }
  })

  const instructorType = await prisma.userType.create({
    data: {
      usertype: 'instructor'
    }
  })

  const participantType = await prisma.userType.create({
    data: {
      usertype: 'participant'
    }
  })

  // Create Admin User
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@train4best.com',
      password: adminPassword,
      userTypeId: adminType.id
    }
  })

  // Create Sample Instructor
  const instructor = await prisma.instructure.create({
    data: {
      full_name: 'John Doe',
      phone_number: '081234567890',
      address: 'Jakarta, Indonesia',
      profiency: 'Web Development',
      users: {
        create: {
          username: 'johndoe',
          email: 'john@train4best.com',
          password: await hash('instructor123', 10),
          userTypeId: instructorType.id
        }
      }
    }
  })

  // Create Sample Course Type
  const courseType = await prisma.courseType.create({
    data: {
      course_type: 'Technology'
    }
  })

  // Create Sample Course
  const course = await prisma.course.create({
    data: {
      course_name: 'Web Development Fundamentals',
      courseTypeId: courseType.id
    }
  })

  // Create Sample Class
  const class1 = await prisma.class.create({
    data: {
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