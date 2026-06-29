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

    return NextResponse.json(comment, { status: 201 })

  } catch (error) {
    console.error("POST /api/comments error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// DELETE — ลบคอมเมนต์
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "กรุณาระบุ id" }, { status: 400 })
  }

  await prisma.comment.delete({
    where: { id: Number(id) }
  })

  return NextResponse.json({ message: "ลบคอมเมนต์สำเร็จ" })
}
