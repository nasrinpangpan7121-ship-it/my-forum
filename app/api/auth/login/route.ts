import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// สร้าง adapter สำหรับเชื่อมต่อ PostgreSQL
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
})

// สร้างตัวเชื่อมต่อ Database โดยใช้ adapter ที่สร้างไว้
const prisma = new PrismaClient({ adapter })

export async function POST(request: Request) {
  // รับข้อมูลที่ส่งมาจาก Frontend (email, password)
  const { email, password } = await request.json()

  // เช็คว่ากรอกข้อมูลครบไหม
  if (!email || !password) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 }
    )
  }

  // หา User จาก email ที่กรอกมา
  const user = await prisma.user.findUnique({
    where: { email },
  })

  // ถ้าไม่พบ email นี้ในระบบให้แจ้ง Error
  if (!user) {
    return NextResponse.json(
      { error: "ไม่พบอีเมลนี้ในระบบ" },
      { status: 401 }
    )
  }

  // เช็คว่า password ที่กรอกมาตรงกับที่เข้ารหัสไว้ใน Database ไหม
  const isPasswordValid = await bcrypt.compare(password, user.password)

  // ถ้า password ไม่ถูกต้องให้แจ้ง Error
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: "รหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    )
  }

  // สร้าง Token สำหรับใช้เป็นบัตรผ่านหลัง Login สำเร็จ
  // Token จะหมดอายุใน 7 วัน
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  )

  // ส่งผลลัพธ์กลับไปพร้อม Token และข้อมูล User
  return NextResponse.json({
    message: "เข้าสู่ระบบสำเร็จ",
    token, // บัตรผ่านสำหรับใช้งาน API อื่นๆ
    user: { id: user.id, username: user.username, email: user.email },
  })
}