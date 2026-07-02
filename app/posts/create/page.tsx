// app/posts/create/page.tsx
// หน้าสร้างกระทู้ใหม่ — ต้อง login ก่อนถึงจะเข้าได้
// ผู้ใช้กรอกชื่อกระทู้, เนื้อหา, เลือกหมวดหมู่

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// ชนิดข้อมูลของหมวดหมู่
type Category = {
  id: number
  name: string
}

export default function CreatePostPage() {
  // เก็บค่าที่ผู้ใช้กรอก
  const [title, setTitle] = useState("")           // ชื่อกระทู้
  const [content, setContent] = useState("")       // เนื้อหา
  const [categoryId, setCategoryId] = useState("") // หมวดหมู่ที่เลือก

  // เก็บรายการหมวดหมู่จาก API
  const [categories, setCategories] = useState<Category[]>([])

  // สถานะต่างๆ
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // useEffect รันเมื่อหน้าโหลด
  useEffect(() => {
    // เช็คว่า login อยู่หรือเปล่า
    const token = localStorage.getItem("token")
    if (!token) {
      // ถ้ายังไม่ login พาไปหน้า login ทันที
      router.push("/login")
      return
    }

    // ดึงรายการหมวดหมู่จาก API
    fetchCategories()
  }, [])

  // ฟังก์ชันดึงหมวดหมู่
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) return
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error("ดึงหมวดหมู่ไม่สำเร็จ", err)
    }
  }

  // ฟังก์ชันที่รันเมื่อกดปุ่ม "โพสต์กระทู้"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // เช็คว่ากรอกข้อมูลครบหรือเปล่า
    if (!title.trim() || !content.trim()) {
      setError("กรุณากรอกชื่อกระทู้และเนื้อหา")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // ดึง token จาก localStorage เพื่อส่งไปกับ API
      const token = localStorage.getItem("token")

      // ส่งข้อมูลไปที่ API POST /api/posts
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ส่ง token เพื่อยืนยันตัวตน
        },
        body: JSON.stringify({
          title,
          content,
          categoryId: categoryId ? Number(categoryId) : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "สร้างกระทู้ไม่สำเร็จ")
        return
      }

      // สำเร็จ — พาไปหน้าอ่านกระทู้ที่เพิ่งสร้าง
      router.push(`/posts/${data.id}`)

    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* หัวข้อหน้า */}
      <h1 className="text-2xl font-bold mb-6" style={{color: "var(--foreground)"}}>สร้างกระทู้ใหม่</h1>

      {/* กล่องฟอร์ม */}
      <div className="theme-card rounded-2xl shadow-sm border p-6">

        {/* แสดง error ถ้ามี */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ช่องกรอกชื่อกระทู้ */}
          <div>
            <label className="block text-sm font-medium mb-1 theme-muted">
              ชื่อกระทู้ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="กรอกชื่อกระทู้..."
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm theme-input focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* เลือกหมวดหมู่ */}
          <div>
            <label className="block text-sm font-medium mb-1 theme-muted">
              หมวดหมู่ (ไม่บังคับ)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 text-sm theme-input focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">-- ไม่ระบุหมวดหมู่ --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ช่องกรอกเนื้อหา */}
          <div>
            <label className="block text-sm font-medium mb-1 theme-muted">
              เนื้อหา <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนเนื้อหากระทู้ที่นี่..."
              required
              rows={8}
              className="w-full border rounded-lg px-4 py-2.5 text-sm theme-input focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {/* ปุ่มด้านล่าง */}
          <div className="flex gap-3 pt-2">

            {/* ปุ่มยกเลิก */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 border rounded-lg py-2.5 text-sm theme-input hover:opacity-80"
            >
              ยกเลิก
            </button>

            {/* ปุ่มโพสต์กระทู้ */}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังโพสต์..." : "โพสต์กระทู้"}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}
