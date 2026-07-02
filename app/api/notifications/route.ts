// app/api/notifications/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import jwt from "jsonwebtoken"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET — ดูการแจ้งเตือนทั้งหมดของตัวเอง
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // ดึงการแจ้งเตือนทั้งหมดของ user นี้ เรียงจากใหม่ไปเก่า
    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    })

    // นับจำนวนที่ยังไม่ได้อ่าน
    const unreadCount = await prisma.notification.count({
      where: { userId: decoded.userId, isRead: false },
    })

    return NextResponse.json({ notifications, unreadCount })

  } catch (error) {
    console.error("GET /api/notifications error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// PUT — อ่านการแจ้งเตือนทั้งหมด (mark all as read)
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // อัปเดตทุก notification ของ user นี้ให้เป็น isRead: true
    await prisma.notification.updateMany({
      where: { userId: decoded.userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ message: "อ่านการแจ้งเตือนทั้งหมดแล้ว" })

  } catch (error) {
    console.error("PUT /api/notifications error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}