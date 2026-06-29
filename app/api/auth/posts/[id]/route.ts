// app/api/auth/posts/[id]/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET — ดูกระทู้เดี่ยว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: { select: { username: true } },
      category: { select: { name: true } },
      tags: { include: { tag: true } },
      comments: {
        include: {
          author: { select: { username: true } }
        }
      },
    },
  })

  if (!post) {
    return NextResponse.json({ error: "ไม่พบกระทู้นี้" }, { status: 404 })
  }

  return NextResponse.json(post)
}

// PUT — แก้ไขกระทู้
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { title, content } = await request.json()

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { title, content },
  })

  return NextResponse.json({ message: "แก้ไขกระทู้สำเร็จ", post })
}

// DELETE — ลบกระทู้
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.post.delete({
    where: { id: Number(id) },
  })

  return NextResponse.json({ message: "ลบกระทู้สำเร็จ" })
}