// app/login/page.tsx
// หน้าเข้าสู่ระบบ — ผู้ใช้กรอก email และ password
// เมื่อ login สำเร็จจะเก็บ token ไว้ใน localStorage แล้วพาไปหน้าแรก

"use client" // รันบน Browser เพราะใช้ useState และ useRouter

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  // เก็บค่าที่ผู้ใช้กรอกในฟอร์ม
  const [email, setEmail] = useState("")       // อีเมล
  const [password, setPassword] = useState("") // รหัสผ่าน

  // เก็บสถานะต่างๆ
  const [loading, setLoading] = useState(false)       // กำลังส่งข้อมูลอยู่หรือเปล่า
  const [error, setError] = useState<string | null>(null) // ข้อความ error

  const router = useRouter() // ใช้สำหรับเปลี่ยนหน้า

  // ฟังก์ชันที่รันเมื่อกดปุ่ม "เข้าสู่ระบบ"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // หยุดไม่ให้หน้า refresh เมื่อ submit form

    setLoading(true)  // เริ่มโหลด
    setError(null)    // ล้าง error เก่า

    try {
      // ส่งข้อมูลไปที่ API POST /api/auth/login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // บอกว่าส่งข้อมูลแบบ JSON
        },
        body: JSON.stringify({ email, password }), // แปลงข้อมูลเป็น JSON string
      })

      // แปลง response เป็น JSON
      const data = await res.json()

      // ถ้า API ตอบกลับไม่สำเร็จ ให้แสดง error
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ")
        return // หยุดทำงานต่อ
      }

      // ถ้าสำเร็จ — เก็บ token และ username ไว้ใน localStorage
      localStorage.setItem("token", data.token)       // เก็บ JWT token
      localStorage.setItem("username", data.user.username) // เก็บชื่อผู้ใช้

      // พาผู้ใช้ไปหน้าแรก พร้อม reload เพื่อให้ Navbar อัปเดต
     window.location.href = "/"

      // รีเฟรชหน้าเพื่อให้ Navbar อัปเดตชื่อผู้ใช้
      router.refresh()

    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false) // โหลดเสร็จแล้ว
    }
  }

  return (
    // จัดกึ่งกลางหน้าจอ ทั้งแนวนอนและแนวตั้ง
    <div className="min-h-[70vh] flex items-center justify-center">

      {/* กล่องฟอร์ม */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* หัวข้อ */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h1>
        <p className="text-gray-400 text-sm mb-6">ยินดีต้อนรับกลับมาครับ</p>

        {/* แสดง error ถ้ามี */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ช่องกรอกอีเมล */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"                          // บังคับให้กรอกรูปแบบอีเมล
              value={email}                         // ค่าที่แสดงในช่อง
              onChange={(e) => setEmail(e.target.value)} // อัปเดต state เมื่อพิมพ์
              placeholder="example@email.com"
              required                              // บังคับกรอก
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* ช่องกรอกรหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"                           // ซ่อนตัวอักษรเป็นจุด
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* ปุ่มเข้าสู่ระบบ */}
          <button
            type="submit"
            disabled={loading} // ปิดปุ่มระหว่างโหลด ป้องกันกดซ้ำ
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {/* เปลี่ยนข้อความระหว่างโหลด */}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

        </form>

        {/* ลิงก์ไปหน้า Register */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-indigo-600 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>

      </div>
    </div>
  )
}
