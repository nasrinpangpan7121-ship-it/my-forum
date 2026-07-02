// app/login/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("username", data.user.username)
      window.location.href = "/"
      router.refresh()

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
        <h1 className="text-2xl font-bold mb-2" style={{color: "var(--foreground)"}}>เข้าสู่ระบบ</h1>
        <p className="text-sm mb-6" style={{color: "var(--muted)"}}>ยินดีต้อนรับกลับมาครับ</p>

        {/* แสดง error ถ้ามี */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ช่องอีเมล */}
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

          {/* ช่องรหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{color: "var(--muted)"}}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 theme-input"
            />
          </div>

          {/* ปุ่มเข้าสู่ระบบ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

        </form>

        {/* ลิงก์ไปหน้า Register */}
        <p className="text-center text-sm mt-6" style={{color: "var(--muted)"}}>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-indigo-500 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>

      </div>
    </div>
  )
}