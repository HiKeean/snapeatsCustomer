"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Store,
  Mail,
  Lock,
  ChevronRight,
  MapPin,
  CreditCard,
  FileText,
  Upload,
  ArrowRight,
  Search,
  Phone,
} from "lucide-react"
import { checkEmail, registerPenjual, uploadFoto } from "@/services/authService"
import Swal from "sweetalert2"

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyBT04DBevaxBwh5OgG4yJ9roE909mnkT7E"

// Type for Google Maps
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 data
  const [nameToko, setNameToko] = useState("")
  const [noHp, setnoHp] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeError, setAgreeError] = useState(false)

  // Step 2 data
  const [alamat, setAlamat] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [ktp, setKtp] = useState("")
  const [noRek, setNoRek] = useState("")
  const [npwp, setNpwp] = useState("")

  // Step 3 data
  const [bukuTabungan, setBukuTabungan] = useState<File | null>(null)
  const [fotoKtp, setFotoKtp] = useState<File | null>(null)
  const [fotoNpwp, setFotoNpwp] = useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapDialogOpen, setMapDialogOpen] = useState(false)

  const [pathFotoKtp, setPathFotoKtp] = useState("");
  const [pathFotoNpwp, setPathFotoNpwp] = useState("");
  const [pathFotoBukuTabungan, setPathFotoBukuTabungan] = useState("");

  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const router = useRouter()

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true)
      return
    }

    // Create script element if not already present
    if (!document.getElementById("google-maps-script")) {
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true

      // Set up callback for when script loads
      script.onload = () => {
        console.log("Google Maps API loaded successfully")
        setMapLoaded(true)
      }

      script.onerror = () => {
        console.error("Failed to load Google Maps API")
      }

      document.head.appendChild(script)
    }
  }, [])

  // Initialize map when dialog opens
  useEffect(() => {
    if (!mapDialogOpen || !mapLoaded) return
  
    const initMapTimer = setTimeout(() => {
      if (mapRef.current && window.google?.maps) {
        console.log("Initializing map...")
  
        const initializeMap = (lat: number, lng: number) => {
          const center = { lat, lng }
  
          const mapOptions = {
            center,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }
  
          const map = new window.google.maps.Map(mapRef.current, mapOptions)
          console.log("Map created:", map)
          mapInstanceRef.current = map
  
          const marker = new window.google.maps.Marker({
            position: center,
            map,
            draggable: true,
          })
          markerRef.current = marker
  
          marker.addListener("dragend", () => {
            const position = marker.getPosition()
            updateLocationDetails(position.lat(), position.lng())
          })
  
          if (searchInputRef.current) {
            const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current)
  
            map.addListener("bounds_changed", () => {
              searchBox.setBounds(map.getBounds())
            })
  
            searchBox.addListener("places_changed", () => {
              const places = searchBox.getPlaces()
              if (places.length === 0) return
              const place = places[0]
              if (!place.geometry || !place.geometry.location) return
  
              map.setCenter(place.geometry.location)
  
              if (markerRef.current) {
                markerRef.current.setPosition(place.geometry.location)
              } else {
                const marker = new window.google.maps.Marker({
                  position: place.geometry.location,
                  map,
                  draggable: true,
                })
                markerRef.current = marker
  
                marker.addListener("dragend", () => {
                  const position = marker.getPosition()
                  updateLocationDetails(position.lat(), position.lng())
                })
              }
  
              updateLocationDetails(
                place.geometry.location.lat(),
                place.geometry.location.lng(),
                place.formatted_address,
              )
            })
          }
  
          map.addListener("click", (e: { latLng: { lat: () => any; lng: () => any } }) => {
            const clickedLat = e.latLng.lat()
            const clickedLng = e.latLng.lng()
  
            if (markerRef.current) {
              markerRef.current.setPosition(e.latLng)
            } else {
              const marker = new window.google.maps.Marker({
                position: e.latLng,
                map,
                draggable: true,
              })
              markerRef.current = marker
  
              marker.addListener("dragend", () => {
                const position = marker.getPosition()
                updateLocationDetails(position.lat(), position.lng())
              })
            }
  
            updateLocationDetails(clickedLat, clickedLng)
          })
        }
  
        // Cek apakah kita sudah punya koordinat
        if (latitude && longitude) {
          initializeMap(latitude, longitude)
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude
              const lng = position.coords.longitude
              updateLocationDetails(lat, lng)
              initializeMap(lat, lng)
            },
            (error) => {
              console.warn("Gagal ambil lokasi, fallback ke Jakarta:", error)
              initializeMap(-6.2088, 106.8456)
            }
          )
        }
      } else {
        console.error("Map container or Google Maps not available")
      }
    }, 500)
  
    return () => clearTimeout(initMapTimer)
  }, [mapDialogOpen, mapLoaded, latitude, longitude])
  
  const updateLocationDetails = async (lat: number, lng: number, formattedAddress?: string) => {
    setLatitude(lat)
    setLongitude(lng)

    if (formattedAddress) {
      setAlamat(formattedAddress)
    } else {
      // Reverse geocode to get address
      try {
        const geocoder = new window.google.maps.Geocoder()
        const response = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === "OK") {
              resolve(results)
            } else {
              reject(status)
            }
          })
        })

        if (response && response[0]) {
          setAlamat(response[0].formatted_address)
        }
      } catch (error) {
        console.error("Geocoding error:", error)
      }
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!nameToko || !noHp || !email || !password) {
        toast.error("Please fill in all fields")
        return
      }

      const maIIl = await checkEmail(email, "PENJUAL");
      if(maIIl){
        toast.error("Email are used");
        return;
      }
      console.log(maIIl);
    }

    if (currentStep === 2) {
      if (!alamat || !latitude || !longitude || !ktp || !noRek || !npwp) {
        toast.error("Please fill in all fields")
        return
      }
    }

    setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }  

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!bukuTabungan || !fotoKtp || !fotoNpwp) {
      toast.error("Please upload all required documents")
      return
    }
  
    if(ktp.length < 16){
      toast.error("KTP Min 16 char");
      return
    }
  
    if (!agreeTerms) {
      setAgreeError(true)
      toast.error("Please agree to the terms and conditions")
      return
    }
  
    const [ktpBase64, npwpBase64, tabunganBase64] = await Promise.all([
      toBase64(fotoKtp),
      toBase64(fotoNpwp),
      toBase64(bukuTabungan),
    ])
  
    if (!ktpBase64 || !npwpBase64 || !tabunganBase64) {
      toast.error("Please upload all required documents")
      return
    }
  
    let responseKTP = ""
    let responseNPWP = ""
    let responseBukuTabungan = ""
  
    // Gabungin semua upload dalam satu try-catch
    try {
      responseKTP = await uploadFoto(ktpBase64, `penjual-${nameToko}`);
      console.log(`ktp: ${responseKTP}`)
      setPathFotoKtp(responseKTP);
  
      responseNPWP = await uploadFoto(npwpBase64, `penjual-${nameToko}`)
      console.log(`npwp: ${responseNPWP}`)
      setPathFotoNpwp(responseNPWP);
  
      responseBukuTabungan = await uploadFoto(tabunganBase64, `penjual-${nameToko}`)
      console.log(`bukutabung : ${responseBukuTabungan}`)
      setPathFotoBukuTabungan(responseBukuTabungan);
      
    } catch (error: any) {
      Swal.fire({
        title: "Upload Error",
        text: error.message || "Gagal upload salah satu dokumen.",
        icon: "error",
        draggable: false
      });
      return;
    }
  
    // Kalau semua sukses
    setIsLoading(true);
  
    const response = await registerPenjual(
      email,
      password,
      alamat,
      latitude!.toString(),
      longitude!.toString(),
      nameToko,
      ktp,
      noRek, 
      npwp, 
      responseBukuTabungan, 
      responseKTP, 
      responseNPWP,
      noHp
    )
  
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Your account has been created")
      router.push("/auth/penjual/login")
    }, 1500)
  }
  
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  currentStep === step
                    ? "bg-pink-600 text-white"
                    : currentStep > step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step ? "✓" : step}
              </div>
              {step < 3 && <div className={`h-1 w-8 ${currentStep > step ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Toko</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Nama Toko"
              className="pl-10"
              value={nameToko}
              onChange={(e) => setNameToko(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="noHp">No HP</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="noHp"
              type="text"
              placeholder="No HP"
              className="pl-10"
              value={noHp}
              onChange={(e) => setnoHp(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="••••••••"
              className="pl-10"
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

        <Button type="button" className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={handleNextStep}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="alamat"
              type="text"
              placeholder="Pilih lokasi di peta"
              className="pl-10 pr-10"
              value={alamat}
              readOnly
            />
            <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                >
                  <MapPin className="h-4 w-4 text-pink-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Pilih Lokasi</DialogTitle>
                </DialogHeader>
                {!mapLoaded && (
                  <div className="flex flex-col items-center justify-center h-[400px] border rounded-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
                    <p className="text-muted-foreground">Loading map...</p>
                  </div>
                )}

                {mapLoaded && (
                  <div className="relative">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input ref={searchInputRef} placeholder="Cari lokasi..." className="pl-10" />
                    </div>
                    <div className="relative">
                      <div ref={mapRef} className="w-full h-[400px] rounded-md border" id="google-map-container"></div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 bottom-4 h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100"
                        onClick={() => {
                          if (navigator.geolocation && mapInstanceRef.current) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const userLocation = {
                                  lat: position.coords.latitude,
                                  lng: position.coords.longitude,
                                }

                                // Center map on user location
                                mapInstanceRef.current.setCenter(userLocation)
                                mapInstanceRef.current.setZoom(17)

                                // Add or update marker
                                if (markerRef.current) {
                                  markerRef.current.setPosition(userLocation)
                                } else {
                                  const marker = new window.google.maps.Marker({
                                    position: userLocation,
                                    map: mapInstanceRef.current,
                                    draggable: true,
                                  })
                                  markerRef.current = marker

                                  // Update coordinates when marker is dragged
                                  marker.addListener("dragend", () => {
                                    const position = marker.getPosition()
                                    updateLocationDetails(position.lat(), position.lng())
                                  })
                                }

                                // Update location details
                                updateLocationDetails(userLocation.lat, userLocation.lng)
                              },
                              (error) => {
                                console.error("Error getting location:", error)
                                toast.error("Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan.")
                              },
                              { enableHighAccuracy: true },
                            )
                          } else {
                            toast.error("Geolocation tidak didukung oleh browser Anda.")
                          }
                        }}
                      >
                        <div className="flex items-center justify-center h-full w-full">
                          <div className="h-5 w-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                            <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                      </Button>
                    </div>
                    {latitude && longitude && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMapDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                    onClick={() => {
                      setMapDialogOpen(false)
                    }}
                  >
                    Simpan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ktp">No. KTP</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="ktp"
              type="text"
              inputMode="numeric"
              placeholder="No. KTP"
              className="pl-10"
              value={ktp}
              maxLength={16}
              onChange={(e) => setKtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="noRek">No. Rekening</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="noRek"
              type="number"
              placeholder="No. Rekening"
              className="pl-10"
              value={noRek}
              onChange={(e) => setNoRek(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="npwp">No. NPWP</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="npwp"
              type="text"
              inputMode="numeric"
              placeholder="No. NPWP"
              className="pl-10"
              maxLength={16}
              value={npwp}
              onChange={(e) => setNpwp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePrevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="button" className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleNextStep}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderStep3 = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bukuTabungan">Foto Buku Tabungan</Label>
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {bukuTabungan ? bukuTabungan.name : "Upload foto buku tabungan"}
              </p>
              <Input
                id="bukuTabungan"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, setBukuTabungan)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("bukuTabungan")?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fotoKtp">Foto KTP</Label>
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{fotoKtp ? fotoKtp.name : "Upload foto KTP"}</p>
              <Input
                id="fotoKtp"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, setFotoKtp)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fotoKtp")?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fotoNpwp">Foto NPWP</Label>
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{fotoNpwp ? fotoNpwp.name : "Upload foto NPWP"}</p>
              <Input
                id="fotoNpwp"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, setFotoNpwp)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fotoNpwp")?.click()}
              >
                Browse Files
              </Button>
            </div>
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
            className={`mt-1 ${agreeError ? "border-red-500" : ""}`}
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

        <div className="flex space-x-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handlePrevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
            disabled={isLoading}
            onClick={handleRegister}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </div>
      </div>
    )
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
              <div className="text-3xl">
                <Image
                  src="/assets/images/penjual/bike-delivery.png"
                  alt="delivery bike"
                  width={200}
                  height={200}
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Sign up to start selling delicious food</p>
        </div>

        {renderStepIndicator()}

        <form className="space-y-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/penjual/login" className="text-pink-600 hover:text-pink-700 font-medium">
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

