"use client"

import Link from "next/link";

export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold">404 - Not Found</h1>
        <p className="text-lg text-gray-500">Oops! Halaman yang kamu cari tidak ditemukan.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-[#e31902] text-white rounded">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }
  