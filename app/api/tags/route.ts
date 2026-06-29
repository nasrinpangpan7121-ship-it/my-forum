import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// สร้างตัวเชื่อมต่อ Database
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
})
const prisma = new PrismaClient({ adapter })

// GET — ดูแท็กทั้งหมด
export async function GET() {
  // ดึงแท็กทั้งหมดจาก Database
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" }, // เรียงตามชื่อ ก-ฮ
  })

  return NextResponse.json(tags)
}

// POST — สร้างแท็กใหม่
export async function POST(request: Request) {
  // รับชื่อแท็กที่ส่งมา
  const { name } = await request.json()

  // เช็คว่ากรอกชื่อมาไหม
  if (!name) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อแท็ก" },
      { status: 400 }
    )
  }

  // สร้างแท็กใหม่ใน Database
  const tag = await prisma.tag.create({
    data: { name } // บันทึกชื่อแท็ก
  })

  return NextResponse.json(
    { message: "สร้างแท็กสำเร็จ", tag },
    { status: 201 }
  )
}