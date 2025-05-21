const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  try {
    // Clean up existing data (optional, comment out if you don't want to clear the DB)
    console.log('Cleaning up existing data...');
    await cleanDatabase();
    
    // 1. Create UserTypes
    console.log('Creating user types...');
    const adminType = await prisma.userType.create({
      data: {
        id: 'usertype_1',
        usertype: 'Admin',
        description: 'Administrator with full access to the system',
        status: 'Active',
      },
    });

    const participantType = await prisma.userType.create({
      data: {
        id: 'usertype_2',
        usertype: 'Participant',
        description: 'Training participant/student',
        status: 'Active',
      },
    });

    const instructureType = await prisma.userType.create({
      data: {
        id: 'usertype_3',
        usertype: 'Instructure',
        description: 'Training instructor',
        status: 'Active',
      },
    });

    // 2. Create Course Types
    console.log('Creating course types...');
    const technicalType = await prisma.courseType.create({
      data: {
        id: 'coursetype_1',
        course_type: 'Technical',
      },
    });

    const nonTechnicalType = await prisma.courseType.create({
      data: {
        id: 'coursetype_2',
        course_type: 'Non-Technical',
      },
    });

    const certificationType = await prisma.courseType.create({
      data: {
        id: 'coursetype_3',
        course_type: 'Certification',
      },
    });

    // 3. Create Instructors
    console.log('Creating instructors...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const instructor1 = await prisma.instructure.create({
      data: {
        id: 'instructor_1',
        full_name: 'Dr. Ahmad Rahman',
        photo: '/instructors/ahmad.jpg',
        phone_number: '08111222333',
        address: 'Jl. Pendidikan No. 45, Jakarta',
        profiency: 'Computer Science',
      },
    });

    const instructor2 = await prisma.instructure.create({
      data: {
        id: 'instructor_2',
        full_name: 'Ir. Siti Widodo',
        photo: '/instructors/siti.jpg',
        phone_number: '08222333444',
        address: 'Jl. Teknik No. 67, Bandung',
        profiency: 'IoT',
      },
    });

    const instructor3 = await prisma.instructure.create({
      data: {
        id: 'instructor_3',
        full_name: 'Prof. Budi Santoso',
        photo: '/instructors/budi.jpg',
        phone_number: '08333444555',
        address: 'Jl. Penelitian No. 89, Surabaya',
        profiency: 'Leadership',
      },
    });

    // 4. Create Users for Instructors
    console.log('Creating users for instructors...');
    const user1 = await prisma.user.create({
      data: {
        id: 'user_1',
        email: 'ahmad@train4best.com',
        password: hashedPassword,
        username: 'ahmad',
        instructureId: instructor1.id,
        userTypeId: instructureType.id,
        last_login: new Date(),
      },
    });

    const user2 = await prisma.user.create({
      data: {
        id: 'user_2',
        email: 'siti@train4best.com',
        password: hashedPassword,
        username: 'siti',
        instructureId: instructor2.id,
        userTypeId: instructureType.id,
        last_login: new Date(),
      },
    });

    const user3 = await prisma.user.create({
      data: {
        id: 'user_3',
        email: 'budi@train4best.com',
        password: hashedPassword,
        username: 'budi',
        instructureId: instructor3.id,
        userTypeId: instructureType.id,
        last_login: new Date(),
      },
    });

    // 5. Create Admin user
    console.log('Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        id: 'user_admin',
        email: 'admin@train4best.com',
        password: hashedPassword,
        username: 'admin',
        userTypeId: adminType.id,
        last_login: new Date(),
      },
    });

    // 6. Create Participants
    console.log('Creating participants...');
    // Function to create a random date of birth (25-45 years old)
    const getRandomBirthDate = (): Date => {
      const today = new Date();
      const age = Math.floor(Math.random() * 20) + 25; // 25-45
      const birthYear = today.getFullYear() - age;
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = Math.floor(Math.random() * 28) + 1;
      return new Date(birthYear, birthMonth, birthDay);
    };

    // Create 10 participants
    const participants = [];
    const participantJobTitles = ['Software Engineer', 'Web Developer', 'Project Manager', 'UI/UX Designer', 'System Administrator', 'Data Analyst', 'Product Manager', 'QA Engineer', 'DevOps Engineer', 'Business Analyst'];
    const participantCompanies = ['PT Teknologi Maju', 'Digisolutions Indonesia', 'Inovasi Digital', 'CreativeWorks', 'Data Systems Indonesia', 'PT Sistem Informasi', 'Global Technology', 'Startup Hub', 'PT Aplikasi Andalan', 'Tech Solutions'];
    
    for (let i = 1; i <= 10; i++) {
      // Create user for participant
      const participantUser = await prisma.user.create({
        data: {
          id: `user_p${i}`,
          email: `participant${i}@example.com`,
          password: hashedPassword,
          username: `participant${i}`,
          userTypeId: participantType.id,
          last_login: i < 8 ? new Date() : null, // Some have logged in, some haven't
        },
      });

      // Create participant
      const participant = await prisma.participant.create({
        data: {
          id: `participant_${i}`,
          full_name: `Participant ${i}`,
          photo: i % 3 === 0 ? `/participants/p${i}.jpg` : null, // Some have photos, some don't
          address: `Jl. Example No. ${i * 10}, Jakarta`,
          phone_number: `081${i}${i}${i}${i}${i}${i}${i}${i}`,
          birth_date: getRandomBirthDate(),
          job_title: participantJobTitles[i - 1],
          company: participantCompanies[i - 1],
          gender: i % 2 === 0 ? 'Male' : 'Female',
          userId: participantUser.id,
        },
      });
      
      participants.push(participant);
    }

    // 7. Create Courses
    console.log('Creating courses...');
    const course1 = await prisma.course.create({
      data: {
        id: 'course_1',
        course_name: 'AIoT (Artificial Intelligence of Things)',
        courseTypeId: technicalType.id,
      },
    });

    const course2 = await prisma.course.create({
      data: {
        id: 'course_2',
        course_name: 'Full Stack Web Development',
        courseTypeId: technicalType.id,
      },
    });

    const course3 = await prisma.course.create({
      data: {
        id: 'course_3',
        course_name: 'Leadership and Management',
        courseTypeId: nonTechnicalType.id,
      },
    });

    const course4 = await prisma.course.create({
      data: {
        id: 'course_4',
        course_name: 'AWS Cloud Practitioner',
        courseTypeId: certificationType.id,
      },
    });

    const course5 = await prisma.course.create({
      data: {
        id: 'course_5',
        course_name: 'Data Science Fundamentals',
        courseTypeId: technicalType.id,
      },
    });

    // 8. Create Classes
    console.log('Creating classes...');
    const today = new Date();
    
    // Helper function to add days to date
    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // Classes for Course 1 (AIoT)
    const class1 = await prisma.class.create({
      data: {
        id: 'class_1',
        quota: 20,
        price: 1500000,
        status: 'Active',
        start_reg_date: new Date(today),
        end_reg_date: addDays(today, 30),
        duration_day: 7,
        start_date: addDays(today, 45),
        end_date: addDays(today, 52),
        location: 'Jakarta',
        room: 'Room A101',
        courseId: course1.id,
      },
    });

    const class2 = await prisma.class.create({
      data: {
        id: 'class_2',
        quota: 15,
        price: 1200000,
        status: 'Active',
        start_reg_date: new Date(today),
        end_reg_date: addDays(today, 60),
        duration_day: 5,
        start_date: addDays(today, 75),
        end_date: addDays(today, 80),
        location: 'Bandung',
        room: 'Room B202',
        courseId: course2.id,
      },
    });

    const class3 = await prisma.class.create({
      data: {
        id: 'class_3',
        quota: 30,
        price: 2000000,
        status: 'Active',
        start_reg_date: new Date(today),
        end_reg_date: addDays(today, 45),
        duration_day: 14,
        start_date: addDays(today, 60),
        end_date: addDays(today, 74),
        location: 'Online',
        room: 'Zoom Meeting',
        courseId: course3.id,
      },
    });

    const class4 = await prisma.class.create({
      data: {
        id: 'class_4',
        quota: 25,
        price: 2500000,
        status: 'Active',
        start_reg_date: new Date(today),
        end_reg_date: addDays(today, 30),
        duration_day: 10,
        start_date: addDays(today, 40),
        end_date: addDays(today, 50),
        location: 'Jakarta',
        room: 'Room C303',
        courseId: course4.id,
      },
    });

    const class5 = await prisma.class.create({
      data: {
        id: 'class_5',
        quota: 20,
        price: 1800000,
        status: 'Active',
        start_reg_date: new Date(today),
        end_reg_date: addDays(today, 50),
        duration_day: 8,
        start_date: addDays(today, 65),
        end_date: addDays(today, 73),
        location: 'Surabaya',
        room: 'Room D404',
        courseId: course5.id,
      },
    });

    // Past class (already completed)
    const pastClass = await prisma.class.create({
      data: {
        id: 'class_past_1',
        quota: 20,
        price: 1500000,
        status: 'Completed',
        start_reg_date: addDays(today, -90),
        end_reg_date: addDays(today, -60),
        duration_day: 7,
        start_date: addDays(today, -45),
        end_date: addDays(today, -38),
        location: 'Jakarta',
        room: 'Room A101',
        courseId: course1.id,
      },
    });

    // 9. Create Instructor-Class Assignments
    console.log('Assigning instructors to classes...');
    await prisma.instructureClass.create({
      data: {
        id: 'instr_class_1',
        instructureId: instructor2.id, // Siti teaches AIoT
        classId: class1.id,
      },
    });

    await prisma.instructureClass.create({
      data: {
        id: 'instr_class_2',
        instructureId: instructor1.id, // Ahmad teaches Web Development
        classId: class2.id,
      },
    });

    await prisma.instructureClass.create({
      data: {
        id: 'instr_class_3',
        instructureId: instructor3.id, // Budi teaches Leadership
        classId: class3.id,
      },
    });

    await prisma.instructureClass.create({
      data: {
        id: 'instr_class_4',
        instructureId: instructor1.id, // Ahmad teaches AWS
        classId: class4.id,
      },
    });

    await prisma.instructureClass.create({
      data: {
        id: 'instr_class_5',
        instructureId: instructor2.id, // Siti teaches Data Science
        classId: class5.id,
      },
    });

    await prisma.instructureClass.create({
      data: {
        id: 'instr_class_past_1',
        instructureId: instructor2.id, // Siti taught past AIoT class
        classId: pastClass.id,
      },
    });

    // 10. Create Course Registrations and Payments
    console.log('Creating course registrations and payments...');
    
    // Helper function to generate random reference numbers
    const generateRefNumber = (): string => {
      return `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    };

    // Register some participants to classes
    const registrations = [];
    
    // Participant 1 registered for Class 1 (AIoT) - Paid
    const reg1 = await prisma.courseRegistration.create({
      data: {
        id: 'reg_1',
        reg_date: addDays(today, -10),
        reg_status: 'Confirmed',
        payment: class1.price,
        payment_status: 'Paid',
        payment_method: 'Transfer Bank',
        present_day: 0,
        classId: class1.id,
        participantId: participants[0].id,
      },
    });
    
    await prisma.payment.create({
      data: {
        id: 'payment_1',
        paymentDate: addDays(today, -8),
        amount: class1.price,
        paymentMethod: 'Transfer Bank',
        referenceNumber: generateRefNumber(),
        status: 'Paid',
        registrationId: reg1.id,
      },
    });

    // Participant 2 registered for Class 2 (Web Dev) - Unpaid
    const reg2 = await prisma.courseRegistration.create({
      data: {
        id: 'reg_2',
        reg_date: addDays(today, -5),
        reg_status: 'Pending',
        payment: class2.price,
        payment_status: 'Unpaid',
        payment_method: 'E-Wallet',
        present_day: 0,
        classId: class2.id,
        participantId: participants[1].id,
      },
    });
    
    await prisma.payment.create({
      data: {
        id: 'payment_2',
        paymentDate: addDays(today, -5),
        amount: class2.price,
        paymentMethod: 'E-Wallet',
        referenceNumber: generateRefNumber(),
        status: 'Unpaid',
        registrationId: reg2.id,
      },
    });

    // Participant 3 registered for Class 3 (Leadership) - Paid
    const reg3 = await prisma.courseRegistration.create({
      data: {
        id: 'reg_3',
        reg_date: addDays(today, -15),
        reg_status: 'Confirmed',
        payment: class3.price,
        payment_status: 'Paid',
        payment_method: 'Kartu Kredit',
        present_day: 0,
        classId: class3.id,
        participantId: participants[2].id,
      },
    });
    
    await prisma.payment.create({
      data: {
        id: 'payment_3',
        paymentDate: addDays(today, -14),
        amount: class3.price,
        paymentMethod: 'Kartu Kredit',
        referenceNumber: generateRefNumber(),
        status: 'Paid',
        registrationId: reg3.id,
      },
    });

    // Multiple participants for past class (with certificates)
    for (let i = 0; i < 5; i++) {
      const regPast = await prisma.courseRegistration.create({
        data: {
          id: `reg_past_${i+1}`,
          reg_date: addDays(today, -85),
          reg_status: 'Completed',
          payment: pastClass.price,
          payment_status: 'Paid',
          payment_method: 'Transfer Bank',
          present_day: 7, // Full attendance
          classId: pastClass.id,
          participantId: participants[i].id,
        },
      });
      
      await prisma.payment.create({
        data: {
          id: `payment_past_${i+1}`,
          paymentDate: addDays(today, -84),
          amount: pastClass.price,
          paymentMethod: 'Transfer Bank',
          referenceNumber: generateRefNumber(),
          status: 'Paid',
          registrationId: regPast.id,
        },
      });
      
      // Create certificates for completed course
      await prisma.certification.create({
        data: {
          id: `cert_${i+1}`,
          certificate_number: `CERT-AIOT-${2023}-${1000+i}`,
          issue_date: addDays(today, -37), // Day after course ended
          valid_date: addDays(today, -37 + 365), // Valid for 1 year
          file_pdf: `/certificates/aiot-${i+1}.pdf`,
          registrationId: regPast.id,
        },
      });
      
      // Create certificate in new Certificate model
      await prisma.certificate.create({
        data: {
          id: `certificate_${i+1}`,
          certificateNumber: `CERT-AIOT-${2023}-${1000+i}`,
          name: participants[i].full_name,
          issueDate: addDays(today, -37),
          expiryDate: addDays(today, -37 + 365),
          status: 'Valid',
          participantId: participants[i].id,
          courseId: course1.id,
        },
      });
    }

    // 11. Create Value Reports (grades/assessments)
    console.log('Creating value reports...');
    for (let i = 0; i < 5; i++) {
      // Create technical skill assessment
      await prisma.valueReport.create({
        data: {
          id: `value_${i+1}_tech`,
          value: 75 + Math.floor(Math.random() * 20), // 75-95
          value_type: 'Technical Skill',
          remark: 'Good understanding of core concepts',
          registrationId: `reg_past_${i+1}`,
          instructureId: instructor2.id,
        },
      });
      
      // Create soft skill assessment
      await prisma.valueReport.create({
        data: {
          id: `value_${i+1}_soft`,
          value: 70 + Math.floor(Math.random() * 25), // 70-95
          value_type: 'Soft Skill',
          remark: 'Active participation in discussions',
          registrationId: `reg_past_${i+1}`,
          instructureId: instructor2.id,
        },
      });
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Function to clean up all data from the database
async function cleanDatabase() {
  try {
    // Delete in reverse order of dependencies
    await prisma.certification.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.valueReport.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.courseRegistration.deleteMany();
    await prisma.instructureClass.deleteMany();
    await prisma.class.deleteMany();
    await prisma.course.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.user.deleteMany();
    await prisma.instructure.deleteMany();
    await prisma.courseType.deleteMany();
    await prisma.userType.deleteMany();
    
    console.log('Database cleaned');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 