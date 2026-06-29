import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// สร้าง adapter สำหรับเชื่อมต่อ PostgreSQL
// โดยบอก URL ของ Database จากไฟล์ .env
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
})

// สร้างตัวเชื่อมต่อ Database โดยใช้ adapter ที่สร้างไว้
const prisma = new PrismaClient({ adapter })

export async function POST(request: Request) {
  // รับข้อมูลที่ส่งมาจาก Frontend (username, email, password)
  const { username, email, password } = await request.json()

  // เช็คว่ากรอกข้อมูลครบไหม ถ้าไม่ครบให้แจ้ง Error กลับไป
  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 }
    )
  }

  // เช็คว่ามี email หรือ username นี้ในระบบอยู่แล้วไหม
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  // ถ้ามีอยู่แล้วให้แจ้ง Error กลับไป
  if (existingUser) {
    return NextResponse.json(
      { error: "อีเมลหรือชื่อผู้ใช้นี้มีอยู่แล้ว" },
      { status: 400 }
    )
  }

  // เข้ารหัส password ก่อนบันทึก ไม่เก็บ password จริงๆ ลง Database
  const hashedPassword = await bcrypt.hash(password, 10)

  // สร้าง User ใหม่ใน Database
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  })

  // ส่งผลลัพธ์กลับไปว่าสมัครสำเร็จ
  return NextResponse.json(
    { message: "สมัครสมาชิกสำเร็จ", userId: user.id },
    { status: 201 }
  )
}