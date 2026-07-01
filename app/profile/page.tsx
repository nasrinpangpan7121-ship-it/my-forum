// app/profile/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Profile = {
  id: number
  username: string
  email: string
  displayName: string | null
  profileImage: string | null
  createdAt: string
  _count: {
    posts: number
    comments: number
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // state สำหรับฟอร์มแก้ไข
  const [isEditing, setIsEditing] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState("")
  const [editProfileImage, setEditProfileImage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // ถ้าไม่ได้ login ให้ไปหน้า login
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchProfile()
  }, [])

  // ดึงข้อมูลโปรไฟล์
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // เริ่มโหมดแก้ไข
  const handleStartEdit = () => {
    if (!profile) return
    setEditDisplayName(profile.displayName || "")
    setEditProfileImage(profile.profileImage || "")
    setIsEditing(true)
  }

  // บันทึกโปรไฟล์
  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: editDisplayName,
          profileImage: editProfileImage,
        }),
      })

      if (res.ok) {
        setIsEditing(false)
        fetchProfile() // โหลดข้อมูลใหม่
      } else {
        const data = await res.json()
        alert(data.error || "บันทึกไม่สำเร็จ")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
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
      <div className="max-w-xl mx-auto animate-pulse">
        <div className="h-24 w-24 bg-gray-200 rounded-full mb-4" />
        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-32" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-xl mx-auto">

      {/* กล่องโปรไฟล์ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

        {isEditing ? (
          // ===== โหมดแก้ไข =====
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">แก้ไขโปรไฟล์</h2>

            {/* ช่องกรอก displayName */}
            <label className="block text-sm text-gray-600 mb-1">
              ชื่อที่แสดง (รองรับทุกภาษา/อิโมจิ)
            </label>
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              placeholder="เช่น สมชาย 😊 / John / 田中"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            {/* ช่องกรอก URL รูปโปรไฟล์ */}
            <label className="block text-sm text-gray-600 mb-1">
              URL รูปโปรไฟล์
            </label>
            <input
              type="text"
              value={editProfileImage}
              onChange={(e) => setEditProfileImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            {/* ปุ่ม */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        ) : (
          // ===== โหมดดูปกติ =====
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* รูปโปรไฟล์ */}
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="profile"
                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  // ถ้าไม่มีรูป แสดงตัวอักษรแรกของ username แทน
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}

                <div>
                  {/* ชื่อที่แสดง หรือ username ถ้ายังไม่ได้ตั้ง */}
                  <h1 className="text-xl font-bold text-gray-800">
                    {profile.displayName || profile.username}
                  </h1>
                  {/* username */}
                  <p className="text-sm text-gray-400">@{profile.username}</p>
                  {/* วันที่สมัคร */}
                  <p className="text-xs text-gray-400 mt-1">
                    สมาชิกตั้งแต่ {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>

              {/* ปุ่มแก้ไขโปรไฟล์ */}
              <button
                onClick={handleStartEdit}
                className="text-sm text-indigo-600 hover:underline"
              >
                แก้ไข
              </button>
            </div>

            {/* สถิติ */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{profile._count.posts}</p>
                <p className="text-xs text-gray-400">กระทู้</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{profile._count.comments}</p>
                <p className="text-xs text-gray-400">คอมเมนต์</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}