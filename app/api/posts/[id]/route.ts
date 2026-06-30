// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import jwt from "jsonwebtoken"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET — ดูกระทู้เดี่ยว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // ต้อง await params ก่อนใน Next.js 16

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: { select: { username: true } },
      category: { select: { name: true } },
      tags: { include: { tag: true } },
      comments: {
        include: {
          author: { select: { username: true } }
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!post) {
    return NextResponse.json({ error: "ไม่พบกระทู้นี้" }, { status: 404 })
  }

  return NextResponse.json(post)
}

// PUT — แก้ไขกระทู้ (ต้อง login และต้องเป็นเจ้าของกระทู้เท่านั้น)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, content } = await request.json()

    // เช็คว่า login มาไหม
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // ถอดรหัส token เพื่อรู้ว่าใครเป็นคนเรียก
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // หากระทู้จริงในฐานข้อมูลก่อนว่ามีอยู่จริงไหม
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "ไม่พบกระทู้นี้" }, { status: 404 })
    }

    // เช็คว่าคนที่ขอแก้ เป็นเจ้าของกระทู้จริงไหม
    if (existingPost.authorId !== decoded.userId) {
      return NextResponse.json({ error: "คุณไม่มีสิทธิ์แก้ไขกระทู้นี้" }, { status: 403 })
    }

    // แก้ไขได้แล้ว
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: { title, content },
    })

    return NextResponse.json({ message: "แก้ไขกระทู้สำเร็จ", post })

  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// DELETE — ลบกระทู้ (ต้อง login และต้องเป็นเจ้าของกระทู้เท่านั้น)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // เช็คว่า login มาไหม
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // ถอดรหัส token เพื่อรู้ว่าใครเป็นคนเรียก
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // หากระทู้จริงในฐานข้อมูลก่อนว่ามีอยู่จริงไหม
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "ไม่พบกระทู้นี้" }, { status: 404 })
    }

    // เช็คว่าคนที่ขอลบ เป็นเจ้าของกระทู้จริงไหม
    if (existingPost.authorId !== decoded.userId) {
      return NextResponse.json({ error: "คุณไม่มีสิทธิ์ลบกระทู้นี้" }, { status: 403 })
    }

    // ลบได้แล้ว
    await prisma.post.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: "ลบกระทู้สำเร็จ" })

  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
