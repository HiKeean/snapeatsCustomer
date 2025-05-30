"use client"

import type { ReactNode } from "react"
import { SellerSidebar } from "@/components/seller/seller-sidebar"
import { SellerHeader } from "@/components/seller/seller-header"

// Daftar path yang tidak menggunakan layout seller
const authPaths = ["/seller/login", "/seller/register", "/seller/forgot-password"]

export default function SellerLayout({ children, params }: { children: ReactNode; params: any }) {
  // Dapatkan current path dari params atau window.location
  // Catatan: Ini adalah contoh, dalam implementasi sebenarnya Anda perlu
  // menggunakan usePathname() dari next/navigation dalam client component
  const currentPath = params?.path || ""

  // Jika path saat ini adalah salah satu dari path autentikasi, render children tanpa layout
  if (authPaths.includes(currentPath)) {
    return children
  }

  // Jika bukan path autentikasi, render dengan layout seller
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SellerSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <SellerHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
