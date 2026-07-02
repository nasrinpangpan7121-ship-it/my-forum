// app/api/comments/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import jwt from "jsonwebtoken"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET — ดูคอมเมนต์ทั้งหมดของกระทู้นั้น
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")

  if (!postId) {
    return NextResponse.json({ error: "กรุณาระบุ postId" }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: { postId: Number(postId) },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { username: true } }
    }
  })

  return NextResponse.json(comments)
}

// POST — เพิ่มคอมเมนต์ใหม่
export async function POST(request: Request) {
  try {
    const { content, postId } = await request.json()

    // ดึง token จาก Header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    if (!content || !postId) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: Number(decoded.userId),
        postId: Number(postId),
      },
      include: {
        author: { select: { username: true } }
      }
    })

    // ดึงข้อมูลกระทู้เพื่อรู้ว่าเจ้าของกระทู้คือใคร
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      select: { authorId: true, title: true }
    })

    // สร้าง notification ให้เจ้าของกระทู้ ถ้าคนคอมเมนต์ไม่ใช่เจ้าของกระทู้เอง
    if (post && post.authorId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          message: `${comment.author.username} คอมเมนต์ในกระทู้ "${post.title}"`,
          userId: post.authorId,  // ส่งแจ้งเตือนไปให้เจ้าของกระทู้
          postId: Number(postId), // เก็บ postId ไว้ให้กดไปดูกระทู้ได้
        }
      })
    }

    return NextResponse.json(comment, { status: 201 })

  } catch (error) {
    console.error("POST /api/comments error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// DELETE — ลบคอมเมนต์ (ต้อง login และต้องเป็นเจ้าของคอมเมนต์เท่านั้น)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ id" }, { status: 400 })
    }

    // เช็คว่า login มาไหม
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    // ถอดรหัส token เพื่อรู้ว่าใครเป็นคนเรียก
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    // ไปหาคอมเมนต์ตัวจริงในฐานข้อมูลก่อนว่ามีอยู่จริงไหม
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) }
    })

    if (!comment) {
      return NextResponse.json({ error: "ไม่พบคอมเมนต์นี้" }, { status: 404 })
    }

    // เช็คว่าคนที่ขอลบ เป็นเจ้าของคอมเมนต์จริงไหม
    if (comment.authorId !== decoded.userId) {
      return NextResponse.json({ error: "คุณไม่มีสิทธิ์ลบคอมเมนต์นี้" }, { status: 403 })
    }

    // ลบได้แล้ว
    await prisma.comment.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ message: "ลบคอมเมนต์สำเร็จ" })

  } catch (error) {
    console.error("DELETE /api/comments error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
