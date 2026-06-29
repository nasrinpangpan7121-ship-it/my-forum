import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// สร้างตัวเชื่อมต่อ Database
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
})
const prisma = new PrismaClient({ adapter })

// GET — ดูหมวดหมู่ทั้งหมด
export async function GET() {
  // ดึงหมวดหมู่ทั้งหมดจาก Database
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }, // เรียงตามชื่อ ก-ฮ
  })

  return NextResponse.json(categories)
}

// POST — สร้างหมวดหมู่ใหม่
export async function POST(request: Request) {
  // รับชื่อหมวดหมู่ที่ส่งมา
  const { name } = await request.json()

  // เช็คว่ากรอกชื่อมาไหม
  if (!name) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อหมวดหมู่" },
      { status: 400 }
    )
  }

  // สร้างหมวดหมู่ใหม่ใน Database
  const category = await prisma.category.create({
    data: { name } // บันทึกชื่อหมวดหมู่
  })

  return NextResponse.json(
    { message: "สร้างหมวดหมู่สำเร็จ", category },
    { status: 201 }
  )
}