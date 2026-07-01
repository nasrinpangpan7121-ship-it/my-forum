// app/api/profile/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import jwt from "jsonwebtoken"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET — ดูข้อมูลโปรไฟล์ตัวเอง
export async function GET(request: Request) {
  try {
    // เช็คว่า login มาไหม
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // ถอดรหัส token เพื่อรู้ว่าใครเป็นคนเรียก
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // ดึงข้อมูล user จาก database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,    // ชื่อที่แสดง
        profileImage: true,   // รูปโปรไฟล์
        createdAt: true,
        _count: {
          select: {
            posts: true,      // จำนวนกระทู้
            comments: true,   // จำนวนคอมเมนต์
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้นี้" }, { status: 404 })
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error("GET /api/profile error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// PUT — แก้ไขโปรไฟล์
export async function PUT(request: Request) {
  try {
    // เช็คว่า login มาไหม
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // ถอดรหัส token
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // รับข้อมูลที่ส่งมา
    const { displayName, profileImage } = await request.json()

    // อัปเดตข้อมูลใน database
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        displayName: displayName || null,   // ถ้าส่งมาว่างให้เซ็ตเป็น null
        profileImage: profileImage || null, // ถ้าส่งมาว่างให้เซ็ตเป็น null
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        profileImage: true,
      }
    })

    return NextResponse.json({ message: "อัปเดตโปรไฟล์สำเร็จ", user })

  } catch (error) {
    console.error("PUT /api/profile error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}