"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/pembeli", icon: Home },
  { name: "Search", href: "/pembeli/search", icon: Search },
  { name: "Orders", href: "/pembeli/orders", icon: ShoppingBag },
  { name: "Favorites", href: "/pembeli/favorites", icon: Heart },
  { name: "Profile", href: "/pembeli/profile", icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-secondary border-t">
      <nav className="flex justify-between items-center px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 min-w-[4rem]",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

