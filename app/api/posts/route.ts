// app/api/posts/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import jwt from "jsonwebtoken"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET — ดูกระทู้ทั้งหมด
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true } },
      category: { select: { name: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
  })
  return NextResponse.json(posts)
}

// POST — สร้างกระทู้ใหม่
export async function POST(request: Request) {
  try {
    const { title, content, categoryId } = await request.json()

    // เช็ค token
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    if (!title || !content) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })
    }

    // สร้างกระทู้ใน Database
   const post = await prisma.post.create({
  data: {
    title: String(title),
    content: String(content),
    authorId: Number(decoded.userId),
    ...(categoryId && { categoryId: Number(categoryId) }),
  },
})

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error("POST /api/posts error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
