"use client"

import { CheckCircle2 } from "lucide-react"

export function OrderStatus() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg">Rute Perjalanan</h3>
          <p className="text-gray-600 text-sm">Dari Jl. Sudirman menuju Jl. Thamrin</p>
        </div>
      </div>
    </div>
  )
}

