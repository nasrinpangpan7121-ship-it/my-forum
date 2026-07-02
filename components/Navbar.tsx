// components/Navbar.tsx
// Component นี้คือแถบ Navigation ด้านบนของทุกหน้า
// มีการเช็คว่า login อยู่หรือเปล่า เพื่อแสดงปุ่มที่ต่างกัน

"use client" // บอก Next.js ว่า Component นี้รันบน Browser (ไม่ใช่ Server)
             // จำเป็นต้องใส่เพราะเราใช้ useState และ useEffect

import { useState, useEffect } from "react"  // useState = เก็บค่า, useEffect = รันโค้ดเมื่อหน้าโหลด
import Link from "next/link"                  // Link ของ Next.js ใช้แทน <a> เพื่อเปลี่ยนหน้าแบบเร็ว
import { useRouter } from "next/navigation"   // useRouter ใช้สำหรับเปลี่ยนหน้าด้วยโค้ด

export default function Navbar() {
  // username เก็บชื่อผู้ใช้ที่ login อยู่ — ถ้าเป็น null = ยังไม่ได้ login
 const [username, setUsername] = useState<string | null>(null)

  // state สำหรับการแจ้งเตือน
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<{id: number, message: string, isRead: boolean, postId: number | null}[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  // router ใช้สำหรับพาผู้ใช้ไปหน้าอื่นด้วยโค้ด เช่น router.push("/login")
  const router = useRouter()

  // useEffect รันครั้งเดียวเมื่อ Component โหลดขึ้นมา
  // [] ด้านหลัง หมายถึง "รันแค่ครั้งแรก"
  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
    if (savedUsername) {
      setUsername(savedUsername)
      fetchNotifications() // ดึงการแจ้งเตือนตอนโหลด Navbar
    }
  }, [])

  // ฟังก์ชันดึงการแจ้งเตือน
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) return

      const data = await res.json()
      setNotifications(data.notifications)   // เก็บรายการแจ้งเตือน
      setUnreadCount(data.unreadCount)        // เก็บจำนวนที่ยังไม่ได้อ่าน
    } catch (err) {
      console.error(err)
    }
  }

  // ฟังก์ชันกดอ่านการแจ้งเตือนทั้งหมด
  const handleReadAll = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      })
      setUnreadCount(0) // รีเซ็ตตัวเลขแจ้งเตือนเป็น 0
      fetchNotifications() // โหลดใหม่
    } catch (err) {
      console.error(err)
    }
  }

  // ฟังก์ชัน logout — ลบข้อมูลออกจาก localStorage แล้วพาไปหน้าแรก
  const handleLogout = () => {
    localStorage.removeItem("token")     // ลบ JWT token ออก
    localStorage.removeItem("username")  // ลบชื่อผู้ใช้ออก
    setUsername(null)                    // อัปเดต state ให้ Navbar รู้ว่า logout แล้ว
    router.push("/")                     // พาไปหน้าแรก
  }

  return (
    // nav = HTML tag สำหรับ navigation
    // bg-white = พื้นหลังขาว, shadow-sm = เงาเบาๆ ด้านล่าง
    // sticky top-0 = ติดอยู่ด้านบนแม้จะ scroll
    // z-50 = อยู่ด้านบนสุดเสมอ (ไม่โดนของอื่นทับ)
    <nav className="bg-white shadow-sm sticky top-0 z-50">

      {/* container mx-auto = จัดกึ่งกลาง, px-4 = padding ซ้ายขวา */}
      {/* flex = จัดเรียงแนวนอน, items-center = จัดกึ่งกลางแนวตั้ง */}
      {/* justify-between = กระจายซ้าย-ขวา, h-16 = ความสูง 64px */}
      <div className="container mx-auto px-4 flex items-center justify-between h-16">

        {/* ซ้าย: ชื่อเว็บ — กดแล้วไปหน้าแรก */}
        <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800">
          🗣️ ทดสอบยี๊นยีน
        </Link>

        {/* ขวา: ปุ่มต่างๆ */}
        {/* flex = จัดแนวนอน, items-center = กึ่งกลางแนวตั้ง, gap-4 = ระยะห่างระหว่างปุ่ม */}
        <div className="flex items-center gap-4">

          {/* ถ้า username มีค่า (login แล้ว) = แสดงชื่อ + ปุ่มสร้างกระทู้ + ปุ่ม Logout */}
          {/* ถ้า username เป็น null (ยังไม่ login) = แสดงปุ่ม Login + Register */}
          {username ? (
            // กรณี login แล้ว
            <>
              {/* ปุ่มสร้างกระทู้ */}
              <Link
                href="/posts/create"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                + สร้างกระทู้
              </Link>

              {/* ไอคอนกระดิ่งแจ้งเตือน */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-500 text-sm hover:text-indigo-600 relative"
                >
                  🔔
                  {/* ตัวเลขแจ้งเตือนที่ยังไม่ได้อ่าน */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* dropdown แสดงรายการแจ้งเตือน */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                      <span className="font-bold text-gray-800 text-sm">การแจ้งเตือน</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleReadAll}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-6">ไม่มีการแจ้งเตือน</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.postId) router.push(`/posts/${n.postId}`)
                              setShowNotifications(false)
                            }}
                            className={`px-4 py-3 text-sm border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.isRead ? "bg-indigo-50" : ""}`}
                          >
                            {n.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* แสดงชื่อผู้ใช้ — กดแล้วไปหน้าโปรไฟล์ */}
              <Link
                href="/profile"
                className="text-gray-600 text-sm hover:text-indigo-600"
              >
                👤 {username}
              </Link>

              {/* ปุ่ม Logout */}
              <button
                onClick={handleLogout}  // เมื่อกดปุ่มนี้ จะเรียกฟังก์ชัน handleLogout
                className="text-gray-500 text-sm hover:text-red-500"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            // กรณียังไม่ login
            <>
              {/* ปุ่ม Login */}
              <Link
                href="/login"
                className="text-gray-600 text-sm hover:text-indigo-600"
              >
                เข้าสู่ระบบ
              </Link>

              {/* ปุ่ม Register */}
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
