"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Bell,
  ChevronDown,
  Menu,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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

export function SellerHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Get current page title
  const currentPage = sidebarLinks.find((link) => link.href === pathname)?.title || "Dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-6">
            <SheetTitle asChild>
              <Link href="/penjual" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="rounded-full bg-pink-100 p-1">
                  <UtensilsCrossed className="h-6 w-6 text-pink-600" />
                </div>
                <span className="text-xl font-bold">FoodExpress</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="grid gap-2 p-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive ? "bg-pink-50 text-pink-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive && "text-pink-600"}`} />
                  {link.title}
                </Link>
              )
            })}
            <div className="mt-4 border-t pt-4">
              <Link
                href="/login"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{currentPage}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-pink-600 p-0 text-[10px]">3</Badge>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Warung Padang" />
                <AvatarFallback>WP</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">Warung Padang</p>
                <p className="text-xs text-muted-foreground">Seller</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/login" className="flex w-full items-center">
                Logout
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
