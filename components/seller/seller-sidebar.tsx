"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut,
  Users,
  MessageSquare,
  Wallet,
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/penjual",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/penjual/orders",
    icon: ShoppingBag,
  },
  {
    title: "Menu",
    href: "/penjual/menu",
    icon: UtensilsCrossed,
  },
  {
    title: "Customers",
    href: "/penjual/customers",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/penjual/reviews",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/penjual/analytics",
    icon: BarChart3,
  },
  {
    title: "Earnings",
    href: "/penjual/earnings",
    icon: Wallet,
  },
  {
    title: "Settings",
    href: "/penjual/settings",
    icon: Settings,
  },
]

export function SellerSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/penjual" className="flex items-center gap-2">
          <div className="rounded-full bg-pink-100 p-1">
            <UtensilsCrossed className="h-6 w-6 text-pink-600" />
          </div>
          <span className="text-xl font-bold">FoodExpress</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  isActive ? "bg-pink-50 text-pink-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-pink-600")} />
                {link.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <Link
          href="/login"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </div>
  )
}
