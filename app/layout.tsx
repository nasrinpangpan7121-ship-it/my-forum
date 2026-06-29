// app/layout.tsx
// ไฟล์นี้คือ "กรอบ" ของทุกหน้าในเว็บ
// Next.js จะครอบทุกหน้าด้วย layout นี้โดยอัตโนมัติ

import type { Metadata } from "next"          // import ชนิดข้อมูลสำหรับ metadata (ชื่อเว็บ, คำอธิบาย)
import { Inter } from "next/font/google"       // import ฟอนต์ Inter จาก Google Fonts
import "./globals.css"                         // import CSS หลักของโปรเจกต์ (Tailwind)
import Navbar from "@/components/Navbar"       // import component Navbar ที่เราจะสร้างต่อไป

// ตั้งค่าฟอนต์ Inter — subsets: ["latin"] หมายถึงโหลดเฉพาะตัวอักษรภาษาอังกฤษ
const inter = Inter({ subsets: ["latin"] })

// Metadata คือข้อมูลที่แสดงบน Tab ของ Browser และ SEO
export const metadata: Metadata = {
  title: "กระทู้ชุมชน",          // ชื่อที่แสดงบน Tab
  description: "เว็บกระทู้ชุมชนทั่วไป", // คำอธิบายสำหรับ SEO
}

// RootLayout คือ Component หลัก
// children คือ "เนื้อหาของแต่ละหน้า" ที่จะถูกใส่เข้ามาแทนที่ตรงนี้
export default function RootLayout({
  children,
}: {
  children: React.ReactNode  // บอกว่า children เป็น React component ได้ทุกชนิด
}) {
  return (
    // html lang="th" บอก browser ว่าเว็บนี้เป็นภาษาไทย
    <html lang="th">
      {/* className ของ inter ทำให้ทั้งเว็บใช้ฟอนต์ Inter */}
      <body className={inter.className}>

        {/* Navbar จะแสดงอยู่ด้านบนของทุกหน้า */}
        <Navbar />

        {/* main คือพื้นที่เนื้อหาหลัก */}
        {/* container mx-auto = จัดกึ่งกลาง, px-4 = padding ซ้ายขวา, py-8 = padding บนล่าง */}
        <main className="container mx-auto px-4 py-8">
          {children} {/* เนื้อหาของแต่ละหน้าจะแสดงตรงนี้ */}
        </main>

      </body>
    </html>
  )
}
