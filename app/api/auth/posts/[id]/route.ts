import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// สร้างตัวเชื่อมต่อ Database
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
})
const prisma = new PrismaClient({ adapter })

// GET — ดูกระทู้เดี่ยวโดยใช้ id
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // รับ id จาก URL เช่น /posts/1
) {
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) }, // แปลง id จาก string เป็น number
    include: {
      author: { select: { username: true } },  // ดึงชื่อคนโพสต์
      category: { select: { name: true } },    // ดึงชื่อหมวดหมู่
      tags: { include: { tag: true } },        // ดึงแท็ก
      comments: {
        include: {
          author: { select: { username: true } } // ดึงชื่อคนคอมเมนต์
        }
      },
    },
  })

  // ถ้าไม่พบกระทู้นี้ให้แจ้ง Error
  if (!post) {
    return NextResponse.json(
      { error: "ไม่พบกระทู้นี้" },
      { status: 404 }
    )
  }

  return NextResponse.json(post)
}

// PUT — แก้ไขกระทู้
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // รับข้อมูลที่ต้องการแก้ไข
  const { title, content } = await request.json()

  // แก้ไขกระทู้ใน Database
  const post = await prisma.post.update({
    where: { id: Number(params.id) },
    data: { title, content }, // อัพเดทเฉพาะ title และ content
  })

  return NextResponse.json({ message: "แก้ไขกระทู้สำเร็จ", post })
}

// DELETE — ลบกระทู้
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ลบกระทู้จาก Database โดยใช้ id
  await prisma.post.delete({
    where: { id: Number(params.id) },
  })

  return NextResponse.json({ message: "ลบกระทู้สำเร็จ" })
}