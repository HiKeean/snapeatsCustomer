"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit2,
  Clock,
  Award,
  Ticket,
  CreditCard,
  HelpCircle,
  Briefcase,
  Globe,
  MapPin,
  Shield,
  Users,
  Bell,
  Lock,
  UserPlus,
  FileText,
  Star,
  MessageCircle,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState({
    name: "Albert Ian",
    email: "puanhizkiapuhi@gmail.com",
    phone: "+6281213121526",
    initials: "AI",
  })

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4 flex items-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            {user.initials}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h2 className="text-lg font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        </div>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* Account Section */}
      <div className="px-4 py-2">
        <h3 className="text-base font-semibold mb-2">Account</h3>
        <div className="space-y-1">
          <ProfileMenuItem icon={<Clock className="h-5 w-5" />} label="My activity" href="/activity">
            <span className="text-sm text-muted-foreground">See ongoing & history</span>
          </ProfileMenuItem>

          <ProfileMenuItem icon={<Award className="h-5 w-5" />} label="FoodExpress PLUS" href="/plus" />

          <ProfileMenuItem icon={<Ticket className="h-5 w-5" />} label="Promos" href="/promos" />

          <ProfileMenuItem icon={<CreditCard className="h-5 w-5" />} label="Payment Methods" href="/payment" />

          <ProfileMenuItem icon={<HelpCircle className="h-5 w-5" />} label="Help center" href="/help" />

          <ProfileMenuItem icon={<Briefcase className="h-5 w-5" />} label="Business Profile" href="/business" />

          <ProfileMenuItem icon={<Globe className="h-5 w-5" />} label="Change language" href="/language" />

          <ProfileMenuItem icon={<MapPin className="h-5 w-5" />} label="Saved addresses" href="/addresses" />

          <ProfileMenuItem
            icon={<Shield className="h-5 w-5" />}
            label="MyInsurance"
            href="/insurance"
            badge={<Badge className="bg-primary text-white">New</Badge>}
          />

          <ProfileMenuItem
            icon={<MessageCircle className="h-5 w-5" />}
            label="Chat Support"
            href="/chat"
            badge={<Badge className="bg-primary text-white">New</Badge>}
          />

          <ProfileMenuItem icon={<Users className="h-5 w-5" />} label="App accessibility" href="/accessibility" />

          <ProfileMenuItem icon={<UserPlus className="h-5 w-5" />} label="Invite and Earn" href="/invite" />

          <ProfileMenuItem icon={<Bell className="h-5 w-5" />} label="Notifications" href="/notifications" />

          <ProfileMenuItem icon={<Lock className="h-5 w-5" />} label="Account Safety" href="/safety" />

          <ProfileMenuItem icon={<Users className="h-5 w-5" />} label="Manage accounts" href="/accounts" />
        </div>
      </div>

      <Separator className="my-2" />

      {/* General Section */}
      <div className="px-4 py-2">
        <h3 className="text-base font-semibold mb-2">General</h3>
        <div className="space-y-1">
          <ProfileMenuItem icon={<Shield className="h-5 w-5" />} label="Privacy Policy" href="/privacy" />

          <ProfileMenuItem icon={<FileText className="h-5 w-5" />} label="Terms of Service" href="/terms" />

          <ProfileMenuItem icon={<Users className="h-5 w-5" />} label="Data attribution" href="/data" />

          <ProfileMenuItem
            icon={<Star className="h-5 w-5" />}
            label="Rate FoodExpress app"
            href="/rate"
            rightText="v 1.0.0"
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

interface ProfileMenuItemProps {
  icon: React.ReactNode
  label: string
  href: string
  children?: React.ReactNode
  badge?: React.ReactNode
  rightText?: string
}

function ProfileMenuItem({ icon, label, href, children, badge, rightText }: ProfileMenuItemProps) {
  return (
    <Link href={href} className="flex items-center py-3 hover:bg-accent rounded-md px-2 -mx-2">
      <div className="text-muted-foreground mr-3">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium">{label}</span>
          {badge && <div className="ml-2">{badge}</div>}
        </div>
        {children}
      </div>
      <div className="flex items-center">
        {rightText && <span className="text-sm text-muted-foreground mr-2">{rightText}</span>}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  )
}
