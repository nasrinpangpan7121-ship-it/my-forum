// app/posts/[id]/page.tsx
// หน้าอ่านกระทู้และคอมเมนต์

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

type Post = {
  id: number
  title: string
  content: string
  createdAt: string
  author: { username: string }
  category: { name: string } | null
}

type Comment = {
  id: number
  content: string
  createdAt: string
  author: { username: string }
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // เช็คว่า login อยู่ไหม
    setUsername(localStorage.getItem("username"))
    fetchPost()
    fetchComments()
  }, [])

  // ดึงข้อมูลกระทู้
  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      if (!res.ok) return
      const data = await res.json()
      setPost(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ดึงคอมเมนต์
  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      if (!res.ok) return
      const data = await res.json()
      setComments(data)
    } catch (err) {
      console.error(err)
    }
  }

  // ส่งคอมเมนต์ใหม่
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, postId: Number(postId) }),
      })

      if (res.ok) {
        setNewComment("") // ล้างช่องคอมเมนต์
        fetchComments()   // โหลดคอมเมนต์ใหม่
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // แปลงวันที่เป็นภาษาไทย
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">😕</p>
        <p>ไม่พบกระทู้นี้</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          กลับหน้าแรก
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* ปุ่มกลับ */}
      <Link href="/" className="text-indigo-600 text-sm hover:underline mb-4 inline-block">
        ← กลับหน้าแรก
      </Link>

      {/* กล่องกระทู้ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

        {/* หมวดหมู่ */}
        {post.category && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
            {post.category.name}
          </span>
        )}

        {/* ชื่อกระทู้ */}
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-2">{post.title}</h1>

        {/* ผู้โพสต์และวันที่ */}
        <div className="flex gap-4 text-xs text-gray-400 mb-4">
          <span>👤 {post.author.username}</span>
          <span>📅 {formatDate(post.createdAt)}</span>
        </div>

        {/* เนื้อหา */}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      </div>

      {/* ส่วนคอมเมนต์ */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        💬 คอมเมนต์ ({comments.length})
      </h2>

      {/* กล่องพิมพ์คอมเมนต์ — แสดงเฉพาะตอน login */}
      {username ? (
        <form onSubmit={handleComment} className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="เขียนคอมเมนต์..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "กำลังส่ง..." : "ส่งคอมเมนต์"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center text-sm text-gray-400">
          <Link href="/login" className="text-indigo-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อแสดงความคิดเห็น
        </div>
      )}

      {/* รายการคอมเมนต์ */}
      {comments.length === 0 ? (
        <p className="text-center text-gray-400 py-8">ยังไม่มีคอมเมนต์ เป็นคนแรกเลย!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex gap-3 text-xs text-gray-400 mb-2">
                <span>👤 {comment.author.username}</span>
                <span>📅 {formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
