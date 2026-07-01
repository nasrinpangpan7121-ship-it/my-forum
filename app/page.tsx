// app/page.tsx
// หน้าแรกของเว็บ — แสดงกระทู้ทั้งหมด
// เมื่อเปิดเว็บที่ localhost:3000 จะเห็นหน้านี้

"use client" // รันบน Browser เพราะใช้ useState และ useEffect

import { useState, useEffect } from "react"
import Link from "next/link"

// กำหนดชนิดข้อมูลของกระทู้ — ต้องตรงกับที่ API ส่งมา
type Post = {
  id: number           // รหัสกระทู้
  title: string        // ชื่อกระทู้
  content: string      // เนื้อหากระทู้
  createdAt: string    // วันที่สร้าง
  author: {            // ข้อมูลผู้โพสต์
    username: string
  }
  category: {          // หมวดหมู่ (อาจเป็น null ถ้าไม่ได้เลือก)
    name: string
  } | null
  _count: {            // จำนวนคอมเมนต์
    comments: number
  }
}

export default function HomePage() {
  // posts เก็บรายการกระทู้ทั้งหมด — เริ่มต้นเป็น array ว่าง
  const [posts, setPosts] = useState<Post[]>([])

  // loading เก็บสถานะการโหลด — true = กำลังโหลด, false = โหลดเสร็จ
  const [loading, setLoading] = useState(true)

  // error เก็บข้อความ error ถ้าดึงข้อมูลไม่สำเร็จ
 const [error, setError] = useState<string | null>(null)

  // เก็บคำที่พิมพ์ในช่องค้นหา
  const [search, setSearch] = useState("")

  // useEffect รันเมื่อหน้าโหลด — ดึงข้อมูลกระทู้จาก API
  useEffect(() => {
    fetchPosts() // เรียกฟังก์ชันดึงกระทู้
  }, [])

  // ฟังก์ชันดึงกระทู้จาก API
  const fetchPosts = async (searchText = "") => {
    try {
      setLoading(true)
      // ถ้ามีคำค้นหา ให้แนบไปกับ URL
      const res = await fetch(`/api/posts${searchText ? `?search=${searchText}` : ""}`)

      // ถ้า API ตอบกลับไม่สำเร็จ ให้ throw error
      if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ")

      // แปลง response เป็น JSON
      const data = await res.json()

      // บันทึกกระทู้ลงใน state
      setPosts(data)

    } catch (err) {
      // ถ้าเกิด error ให้เก็บข้อความ error ไว้แสดง
      setError("ไม่สามารถโหลดกระทู้ได้ กรุณาลองใหม่")
    } finally {
      setLoading(false) // โหลดเสร็จแล้ว ไม่ว่าจะสำเร็จหรือไม่
    }
  }

  // ฟังก์ชันแปลงวันที่จาก ISO format เป็นภาษาไทย
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // ถ้ากำลังโหลด — แสดง Skeleton loading
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        {/* แสดงการ์ดโหลดปลอม 4 อัน */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 mb-4 shadow-sm animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  // ถ้าเกิด error — แสดงข้อความ error
  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-red-500 text-lg">{error}</p>
        {/* ปุ่มลองใหม่ */}
        <button
         onClick={() => fetchPosts()}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          ลองใหม่
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* หัวข้อหน้า + ปุ่มสร้างกระทู้ */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">กระทู้ล่าสุด</h1>
        <Link
          href="/posts/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          + สร้างกระทู้
        </Link>
      </div>

      {/* ช่องค้นหากระทู้ */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchPosts(search)}
          placeholder="ค้นหากระทู้..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={() => fetchPosts(search)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          ค้นหา
        </button>
        {/* ปุ่มล้างคำค้นหา — โชว์เฉพาะตอนมีคำค้น */}
        {search && (
          <button
            onClick={() => { setSearch(""); fetchPosts("") }}
            className="text-gray-400 px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* ถ้าไม่มีกระทู้เลย */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg">ยังไม่มีกระทู้ เป็นคนแรกที่โพสต์เลย!</p>
          <Link
            href="/posts/create"
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            สร้างกระทู้แรก
          </Link>
        </div>
      ) : (
        // ถ้ามีกระทู้ — แสดงเป็นลิสต์การ์ด
        <div className="space-y-4"> {/* space-y-4 = ระยะห่างระหว่างการ์ด */}
          {posts.map((post) => (
            // การ์ดกระทู้แต่ละอัน — กดแล้วไปหน้าอ่านกระทู้
            <Link key={post.id} href={`/posts/${post.id}`}>
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">

                {/* บน: หมวดหมู่ */}
                {post.category && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                    {post.category.name}
                  </span>
                )}

                {/* ชื่อกระทู้ */}
                <h2 className="text-lg font-semibold text-gray-800 mt-2 mb-1">
                  {post.title}
                </h2>

                {/* เนื้อหาย่อ — ตัดให้เหลือแค่ 100 ตัวอักษร */}
                <p className="text-gray-500 text-sm line-clamp-2">
                  {post.content.length > 100
                    ? post.content.slice(0, 100) + "..."
                    : post.content}
                </p>

                {/* ล่าง: ผู้โพสต์, วันที่, จำนวนคอมเมนต์ */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>👤 {post.author.username}</span>
                  <span>📅 {formatDate(post.createdAt)}</span>
                  <span>💬 {post._count.comments} คอมเมนต์</span>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
