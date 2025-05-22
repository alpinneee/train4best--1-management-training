import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

// Function untuk menambahkan hari ke tanggal
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Function untuk membuat nomor referensi acak
const generateRefNumber = (): string => {
  return `REF${Date.now()}${Math.floor(Math.random() * 1000)}`
}

// Function untuk membuat nomor sertifikat acak
const generateCertNumber = (): string => {
  return `CERT/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
}

export async function POST(req: Request) {
  try {
    // Cek apakah ada parameter yang dikirim untuk opsi
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') || 'minimal'
    const clean = searchParams.get('clean') === 'true'
    
    // Hapus data yang sudah ada jika diminta
    if (clean) {
      try {
        await prisma.payment.deleteMany({})
        await prisma.courseRegistration.deleteMany({})
        await prisma.certification.deleteMany({})
        await prisma.instructureClass.deleteMany({})
        await prisma.certificate.deleteMany({})
        await prisma.class.deleteMany({})
        await prisma.course.deleteMany({})
        await prisma.participant.deleteMany({})
        await prisma.user.deleteMany({})
        await prisma.instructure.deleteMany({})
        await prisma.courseType.deleteMany({})
        await prisma.userType.deleteMany({})
      } catch (cleanError) {
        console.error("Error cleaning database:", cleanError)
        return NextResponse.json({ error: "Failed to clean database" }, { status: 500 })
      }
    }
    
    // 1. Buat UserTypes
    const adminType = await prisma.userType.upsert({
      where: { id: 'usertype_1' },
      update: {},
      create: {
        id: 'usertype_1',
        usertype: 'admin',
        description: 'Administrator dengan akses penuh',
        status: 'Active',
      },
    })

    const participantType = await prisma.userType.upsert({
      where: { id: 'usertype_2' },
      update: {},
      create: {
        id: 'usertype_2',
        usertype: 'participant',
        description: 'Peserta pelatihan',
        status: 'Active',
      },
    })

    const instructureType = await prisma.userType.upsert({
      where: { id: 'usertype_3' },
      update: {},
      create: {
        id: 'usertype_3',
        usertype: 'instructure',
        description: 'Instruktur pelatihan',
        status: 'Active',
      },
    })

    // 2. Buat Course Types
    const technicalType = await prisma.courseType.upsert({
      where: { id: 'coursetype_1' },
      update: {},
      create: {
        id: 'coursetype_1',
        course_type: 'Technical',
      },
    })

    const nonTechnicalType = await prisma.courseType.upsert({
      where: { id: 'coursetype_2' },
      update: {},
      create: {
        id: 'coursetype_2',
        course_type: 'Non-Technical',
      },
    })

    // 3. Buat admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@train4best.com' },
      update: {},
      create: {
        id: 'user_admin',
        email: 'admin@train4best.com',
        password: hashedPassword,
        username: 'admin',
        userTypeId: adminType.id,
        last_login: new Date(),
      },
    })
    
    // Buat participant user untuk demo
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        id: 'user_demo',
        email: 'demo@example.com',
        password: hashedPassword,
        username: 'demo',
        userTypeId: participantType.id,
        last_login: new Date(),
      },
    })
    
    // Buat participant record untuk demo user
    const demoParticipant = await prisma.participant.upsert({
      where: { id: 'participant_demo' },
      update: {},
      create: {
        id: 'participant_demo',
        userId: demoUser.id,
        full_name: 'Demo User',
        gender: 'Male',
        address: 'Jakarta',
        birth_date: new Date(1990, 1, 1),
        job_title: 'Software Developer',
        phone_number: '08123456789',
      },
    })
    
    // 4. Buat Course
    const course1 = await prisma.course.upsert({
      where: { id: 'course_1' },
      update: {},
      create: {
        id: 'course_1',
        course_name: 'AIoT (Artificial Intelligence of Things)',
        courseTypeId: technicalType.id,
      },
    })

    const course2 = await prisma.course.upsert({
      where: { id: 'course_2' },
      update: {},
      create: {
        id: 'course_2',
        course_name: 'Full Stack Web Development',
        courseTypeId: technicalType.id,
      },
    })

    const course3 = await prisma.course.upsert({
      where: { id: 'course_3' },
      update: {},
      create: {
        id: 'course_3',
        course_name: 'Leadership and Management',
        courseTypeId: nonTechnicalType.id,
      },
    })
    
    // 5. Buat Kelas
    const today = new Date()
    
    const class1 = await prisma.class.upsert({
      where: { id: 'class_1' },
      update: {},
      create: {
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
    })

    const class2 = await prisma.class.upsert({
      where: { id: 'class_2' },
      update: {},
      create: {
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
    })
    
    // Buat kelas yang sudah selesai untuk sertifikat
    const completedClass1 = await prisma.class.upsert({
      where: { id: 'class_completed_1' },
      update: {},
      create: {
        id: 'class_completed_1',
        quota: 20,
        price: 1500000,
        status: 'Completed',
        start_reg_date: addDays(today, -90),
        end_reg_date: addDays(today, -75),
        duration_day: 7,
        start_date: addDays(today, -60),
        end_date: addDays(today, -53),
        location: 'Jakarta',
        room: 'Room A101',
        courseId: course1.id,
      },
    })
    
    const completedClass2 = await prisma.class.upsert({
      where: { id: 'class_completed_2' },
      update: {},
      create: {
        id: 'class_completed_2',
        quota: 15,
        price: 1200000,
        status: 'Completed',
        start_reg_date: addDays(today, -120),
        end_reg_date: addDays(today, -100),
        duration_day: 5,
        start_date: addDays(today, -90),
        end_date: addDays(today, -85),
        location: 'Bandung',
        room: 'Room B202',
        courseId: course2.id,
      },
    })
    
    // Buat registrasi course untuk demo user
    const registration1 = await prisma.courseRegistration.upsert({
      where: { id: 'reg_1' },
      update: {},
      create: {
        id: 'reg_1',
        reg_date: addDays(today, -85),
        reg_status: 'Completed',
        payment: completedClass1.price,
        payment_status: 'Paid',
        payment_method: 'Transfer Bank',
        present_day: 7,
        classId: completedClass1.id,
        participantId: demoParticipant.id,
      },
    })
    
    const registration2 = await prisma.courseRegistration.upsert({
      where: { id: 'reg_2' },
      update: {},
      create: {
        id: 'reg_2',
        reg_date: addDays(today, -110),
        reg_status: 'Completed',
        payment: completedClass2.price,
        payment_status: 'Paid',
        payment_method: 'Transfer Bank',
        present_day: 5,
        classId: completedClass2.id,
        participantId: demoParticipant.id,
      },
    })
    
    // Buat payment untuk registrasi
    const payment1 = await prisma.payment.upsert({
      where: { id: 'payment_1' },
      update: {},
      create: {
        id: 'payment_1',
        amount: completedClass1.price,
        paymentDate: addDays(today, -82),
        paymentMethod: 'Transfer Bank',
        referenceNumber: `REF-PMT1-${Date.now()}`,
        status: 'Paid',
        registrationId: registration1.id,
      },
    })
    
    const payment2 = await prisma.payment.upsert({
      where: { id: 'payment_2' },
      update: {},
      create: {
        id: 'payment_2',
        amount: completedClass2.price,
        paymentDate: addDays(today, -105),
        paymentMethod: 'Transfer Bank',
        referenceNumber: `REF-PMT2-${Date.now()}`,
        status: 'Paid',
        registrationId: registration2.id,
      },
    })
    
    // Buat sertifikat untuk kelas yang sudah selesai
    const certificate1 = await prisma.certificate.upsert({
      where: { id: 'cert_1' },
      update: {},
      create: {
        id: 'cert_1',
        certificateNumber: generateCertNumber(),
        name: `${demoParticipant.full_name} - ${course1.course_name}`,
        issueDate: addDays(today, -50),
        expiryDate: addDays(today, 315), // 1 tahun dari issueDate
        status: 'Valid',
        participantId: demoParticipant.id,
        courseId: course1.id,
      },
    })
    
    const certificate2 = await prisma.certificate.upsert({
      where: { id: 'cert_2' },
      update: {},
      create: {
        id: 'cert_2',
        certificateNumber: generateCertNumber(),
        name: `${demoParticipant.full_name} - ${course2.course_name}`,
        issueDate: addDays(today, -80),
        expiryDate: addDays(today, 285), // 1 tahun dari issueDate
        status: 'Valid',
        participantId: demoParticipant.id,
        courseId: course2.id,
      },
    })
    
    if (mode === 'full') {
      // Jika mode full, tambahkan instructure dan semua data lainnya
      // TODO: Tambahkan kode untuk membuat instructor dan data lainnya
    }

    return NextResponse.json({
      success: true,
      message: "Database seed completed",
      data: {
        userTypes: { admin: adminType.id, participant: participantType.id, instructure: instructureType.id },
        courseTypes: { technical: technicalType.id, nonTechnical: nonTechnicalType.id },
        users: { admin: adminUser.id, demo: demoUser.id },
        participants: { demo: demoParticipant.id },
        courses: { course1: course1.id, course2: course2.id, course3: course3.id },
        classes: { class1: class1.id, class2: class2.id, completedClass1: completedClass1.id, completedClass2: completedClass2.id },
        registrations: { reg1: registration1.id, reg2: registration2.id },
        payments: { payment1: payment1.id, payment2: payment2.id },
        certificates: { cert1: certificate1.id, cert2: certificate2.id }
      }
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({
      error: "Failed to seed database",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 