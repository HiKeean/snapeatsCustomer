"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, ChevronRight, CalendarIcon } from "lucide-react"
import { registerPembeli } from "@/services/authService"
import Swal from "sweetalert2"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tanggalLahir, setTanggalLahir] = useState<Date | undefined>(undefined)
  const [noHp, setNoHp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeError, setAgreeError] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { [key: string]: boolean } = {}
    if (!name) newErrors.name = true
    if (!email) newErrors.email = true
    if (!password) newErrors.password = true
    if (!tanggalLahir) newErrors.tanggalLahir = true
    if (!noHp) newErrors.noHp = true
    if (!agreeTerms) {
      newErrors.aggree = true;
      toast.error("Please agree to the terms and conditions")
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields")
      return
    }

    

    setIsLoading(true)

    try {
      const formattedTanggalLahir = tanggalLahir
        ? tanggalLahir.toISOString().split("T")[0] // Ambil hanya bagian "yyyy-MM-dd"
        : "";
      const response = await registerPembeli(name, email, password, formattedTanggalLahir, noHp);
      if(response){
        Swal.fire({
          title: "Register Berhasil!",
          text: "Silahkan Cek Email Anda untuk Verifikasi Akun!",
          icon: "success",
          draggable: false
        });
        setTimeout(() => {
          setIsLoading(false)
          toast.success("Your account has been created")
          router.push("/login")
        }, 1500)
      }
    } catch (error:any) {
      Swal.fire({
        title: "Register Gagal!",
        text: error.message || "Terjadi kesalahan saat mendaftar",
        icon: "error",
        draggable: false
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="relative h-20 w-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-pink-100 rounded-full flex items-center justify-center">
              <div className="text-3xl">🍔</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Sign up to start ordering delicious food</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Full Name"
                className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="email@email.com"
                type="email"
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
              <DatePicker
                selected={tanggalLahir}
                onChange={(date) => setTanggalLahir(date!)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={`w-full border rounded-md p-2 ${errors.tanggalLahir ? "border-red-500" : "border-gray-300"}`}
                maxDate={new Date()} // Mencegah pemilihan tanggal di masa depan
                showYearDropdown
                yearDropdownItemNumber={100}
                scrollableYearDropdown
              />
            </div>

            <div className="space-y-3 w-full">
              <Label htmlFor="noHp">Phone Number</Label>
              <Input
                id="noHp"
                type="text"
                className={`w-full border rounded-md p-2 ${errors.noHp ? "border-red-500" : "border-gray-300"}`}
                placeholder="08123456789"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => {
                setAgreeTerms(checked as boolean)
                setAgreeError(false)
              }}
              className={`mt-1 ${errors.aggree ? "border-red-500" : ""}`}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link href="/terms" className="text-pink-600 hover:text-pink-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-pink-600 hover:text-pink-700">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-3xl mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-pink-800">New User Special</h3>
            <p className="text-sm text-pink-700 mt-1">Get 50% off on your first order!</p>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white" size="sm">
            Learn More <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

