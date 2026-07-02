// app/register/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
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
      <div className="theme-card rounded-2xl shadow-sm border p-8 w-full max-w-md">

        {/* ปุ่มสลับธีม */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              const current = document.documentElement.className as "light" | "dark"
              const next = current === "dark" ? "light" : "dark"
              document.documentElement.className = next
              localStorage.setItem("theme", next)
            }}
            className="text-sm hover:opacity-70"
            style={{color: "var(--muted)"}}
          >
            {document.documentElement.className === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* หัวข้อ */}
        <h1 className="text-2xl font-bold mb-2" style={{color: "var(--foreground)"}}>สมัครสมาชิก</h1>
        <p className="text-sm mb-6" style={{color: "var(--muted)"}}>สร้างบัญชีใหม่ได้เลยครับ</p>

        {/* แสดง error */}
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

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ชื่อผู้ใช้ */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{color: "var(--muted)"}}>
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น johndoe"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 theme-input"
            />
          </div>

          {/* อีเมล */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{color: "var(--muted)"}}>
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 theme-input"
            />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{color: "var(--muted)"}}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 theme-input"
            />
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{color: "var(--muted)"}}>
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 theme-input"
            />
          </div>

          {/* ปุ่มสมัคร */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

        </form>

        {/* ลิงก์ไปหน้า Login */}
        <p className="text-center text-sm mt-6" style={{color: "var(--muted)"}}>
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="text-indigo-500 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>

      </div>
    </div>
  )
}