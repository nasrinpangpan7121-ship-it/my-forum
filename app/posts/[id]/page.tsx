// app/posts/[id]/page.tsx
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
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    setUsername(localStorage.getItem("username"))
    fetchPost()
    fetchComments()
  }, [])

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
        setNewComment("")
        fetchComments()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("ต้องการลบคอมเมนต์นี้ใช่ไหม?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        fetchComments()
      } else {
        const data = await res.json()
        alert(data.error || "ลบไม่สำเร็จ")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleStartEdit = () => {
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setIsEditing(true)
  }

  const handleCancelEdit = () => setIsEditing(false)

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("กรุณากรอกชื่อกระทู้และเนื้อหาให้ครบ")
      return
    }
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      })
      if (res.ok) {
        setIsEditing(false)
        fetchPost()
      } else {
        const data = await res.json()
        alert(data.error || "แก้ไขไม่สำเร็จ")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm("ต้องการลบกระทู้นี้ใช่ไหม? ลบแล้วกู้คืนไม่ได้")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        router.push("/")
      } else {
        const data = await res.json()
        alert(data.error || "ลบไม่สำเร็จ")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-8 rounded w-3/4 mb-4" style={{background: "var(--border)"}} />
        <div className="h-4 rounded w-1/2 mb-8" style={{background: "var(--border)"}} />
        <div className="h-40 rounded" style={{background: "var(--border)"}} />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20" style={{color: "var(--muted)"}}>
        <p className="text-5xl mb-4">😕</p>
        <p>ไม่พบกระทู้นี้</p>
        <Link href="/" className="mt-4 inline-block text-indigo-500 hover:underline">
          กลับหน้าแรก
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      <Link href="/" className="text-indigo-500 text-sm hover:underline mb-4 inline-block">
        ← กลับหน้าแรก
      </Link>

      {/* กล่องกระทู้ */}
      <div className="theme-card rounded-2xl shadow-sm border p-6 mb-6">
        {isEditing ? (
          <div>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="ชื่อกระทู้"
              className="w-full border rounded-lg px-4 py-2.5 text-lg font-bold mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 theme-input"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="เนื้อหา"
              rows={6}
              className="w-full border rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none theme-input"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-lg text-sm hover:opacity-70"
                style={{color: "var(--muted)"}}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                บันทึก
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              {post.category && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                  {post.category.name}
                </span>
              )}
              {username === post.author.username && (
                <div className="flex gap-3 text-xs">
                  <button onClick={handleStartEdit} className="text-indigo-500 hover:underline">แก้ไข</button>
                  <button onClick={handleDeletePost} className="text-red-400 hover:text-red-600 hover:underline">ลบ</button>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold mt-3 mb-2" style={{color: "var(--foreground)"}}>
              {post.title}
            </h1>
            <div className="flex gap-4 text-xs mb-4" style={{color: "var(--muted)"}}>
              <span>👤 {post.author.username}</span>
              <span>📅 {formatDate(post.createdAt)}</span>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap" style={{color: "var(--foreground)"}}>
              {post.content}
            </p>
          </div>
        )}
      </div>

      {/* หัวข้อคอมเมนต์ */}
      <h2 className="text-lg font-bold mb-4" style={{color: "var(--foreground)"}}>
        💬 คอมเมนต์ ({comments.length})
      </h2>

      {/* กล่องพิมพ์คอมเมนต์ */}
      {username ? (
        <form onSubmit={handleComment} className="theme-card rounded-2xl border p-4 mb-4 shadow-sm">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="เขียนคอมเมนต์..."
            rows={3}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none theme-input"
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
        <div className="theme-card rounded-xl border p-4 mb-4 text-center text-sm" style={{color: "var(--muted)"}}>
          <Link href="/login" className="text-indigo-500 hover:underline">เข้าสู่ระบบ</Link> เพื่อแสดงความคิดเห็น
        </div>
      )}

      {/* รายการคอมเมนต์ */}
      {comments.length === 0 ? (
        <p className="text-center py-8" style={{color: "var(--muted)"}}>ยังไม่มีคอมเมนต์ เป็นคนแรกเลย!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="theme-card rounded-xl border p-4 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 text-xs mb-2" style={{color: "var(--muted)"}}>
                  <span>👤 {comment.author.username}</span>
                  <span>📅 {formatDate(comment.createdAt)}</span>
                </div>
                {username === comment.author.username && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-400 hover:text-red-600 hover:underline"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <p className="text-sm" style={{color: "var(--foreground)"}}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}