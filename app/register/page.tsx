// app/register/page.tsx
// หน้าสมัครสมาชิก — ผู้ใช้กรอก username, email และ password
// เมื่อสมัครสำเร็จจะพาไปหน้า Login

"use client" // รันบน Browser เพราะใช้ useState และ useRouter

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  // เก็บค่าที่ผู้ใช้กรอกในฟอร์ม
  const [username, setUsername] = useState("")  // ชื่อผู้ใช้
  const [email, setEmail] = useState("")        // อีเมล
  const [password, setPassword] = useState("")  // รหัสผ่าน
  const [confirm, setConfirm] = useState("")    // ยืนยันรหัสผ่าน

  // เก็บสถานะต่างๆ
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false) // สมัครสำเร็จหรือเปล่า

  const router = useRouter()

  // ฟังก์ชันที่รันเมื่อกดปุ่ม "สมัครสมาชิก"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // หยุดไม่ให้หน้า refresh

    // เช็คว่ารหัสผ่านกับยืนยันรหัสผ่านตรงกันไหม
    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    // เช็คความยาวรหัสผ่าน
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // ส่งข้อมูลไปที่ API POST /api/auth/register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      // ถ้าไม่สำเร็จ แสดง error
      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ")
        return
      }

      // ถ้าสำเร็จ — แสดงข้อความสำเร็จแล้วพาไปหน้า Login
      setSuccess(true)
      setTimeout(() => {
        router.push("/login") // พาไปหน้า login หลังจาก 2 วินาที
      }, 2000)

    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">

      {/* กล่องฟอร์ม */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* หัวข้อ */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">สมัครสมาชิก</h1>
        <p className="text-gray-400 text-sm mb-6">สร้างบัญชีใหม่ได้เลยครับ</p>

        {/* แสดง error ถ้ามี */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* แสดงข้อความสำเร็จ */}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            ✅ สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ...
          </div>
        )}

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ช่องกรอกชื่อผู้ใช้ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น johndoe"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* ช่องกรอกอีเมล */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* ช่องกรอกรหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* ช่องยืนยันรหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* ปุ่มสมัครสมาชิก */}
          <button
            type="submit"
            disabled={loading || success} // ปิดปุ่มระหว่างโหลดหรือสำเร็จแล้ว
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

        </form>

        {/* ลิงก์ไปหน้า Login */}
        <p className="text-center text-sm text-gray-400 mt-6">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>

      </div>
    </div>
  )
}
