"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight, MapPin, Clock, CreditCard, Navigation, Map } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatRupiah, getImageUrl } from "@/services/api"
import { MapLocationSelector } from "@/components/map-location-selector"
import { checkout, getDelFeeCount } from "@/services/transactionService"
import { checkoutDto, delFeeCountDto, itemsCheckout, responseCheckoutDto } from "@/services/dto/restaurant"
import { StatusTransaksi, TransaksiType } from "@/services/dto/enuman"
import Swal from "sweetalert2"

// Define the cart structure based on the provided JSON
interface CartItem {
  id: string
  name: string
  extraGroups?: Array<Record<string, number>>
  quantity: number
  price?: number
  totalPrice?: number // Add totalPrice field
  image?: string
  description?: string
  notes?: string
}

interface CartData {
  restaurantId: string
  restaurantName: string
  items: CartItem[]
}

interface Address {
  id: string
  name: string
  address: string
  lat:number
  lon:number
  type?: typeAddress
  isDefault?: boolean
}

enum typeAddress{
    home,
    work,
    other,
    current
}

interface PaymentMethod {
  id: string
  type: TransaksiType
  name: string
  details?: string
  isDefault?: boolean
  isActive: boolean
}

// Map of extra IDs to their human-readable names
const EXTRA_NAMES: Record<string, string> = {
  "1": "Ice Level",
  "2": "Sugar Level",
  "3": "No Sugar",
  "4": "Ice Level",
  "5": "Less Ice",
  "6": "Normal Sugar",
  "7": "Extra Sugar",
  "8": "No Ice",
  "9": "Normal Ice",
  "10": "Extra Ice",
  "11": "Regular Size",
  "12": "Large Size",
  // Add more mappings as needed
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProceed, setIsProceed] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [currentItemForNotes, setCurrentItemForNotes] = useState<CartItem | null>(null)
  const [noteText, setNoteText] = useState("")

  // Address and payment states
  const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false)
  const [isPaymentSelectorOpen, setIsPaymentSelectorOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [fetchGetDelFee, setFetchGetDelFee] = useState<delFeeCountDto | null>(null);


  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
        id: "cash",
        type: TransaksiType.COD,
        name: "Cash on Delivery",
        details: "Pay when your order arrives",
    //   isDefault: true,
        isActive:true
    },
    {
      id: "card",
      type: TransaksiType.CREDITCARD,
      name: "Credit/Debit Card",
      details: "Pay securely with your card",
      isActive: false
    },
    {
      id: "ewallet",
      type: TransaksiType.EWALLET,
      name: "E-Wallet",
      details: "Pay with your e-wallet balance",
      isActive: false
    },
    {
      id: "QRIS",
      type: TransaksiType.QRIS,
      name: "QRiS",
      details: "Pay with QRiS",
      isDefault: true,
      isActive: true
    },
  ])

  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("restaurantCart")
    const savedAddress = localStorage.getItem("selectedAddress")
    const savedPayment = localStorage.getItem("selectedPayment")

    if (savedCart) {
      try {
        const cartData: CartData = JSON.parse(savedCart)
        setCart(cartData)

        // Add notes field to each item if it doesn't exist
        if (cartData.items) {
          const updatedItems = cartData.items.map((item) => ({
            ...item,
            notes: item.notes || "",
          }))

          setCart({
            ...cartData,
            items: updatedItems,
          })
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
        toast.error("Error loading your cart")
      }
    }

    // Load saved address
    if (savedAddress) {
      try {
        setSelectedAddress(JSON.parse(savedAddress))
      } catch (error) {
        console.error("Error loading address:", error)
        // setSelectedAddress(addresses[0])
      }
    } else {
    //   setSelectedAddress(addresses[0])
    }

    // Load saved payment method
    if (savedPayment) {
      try {
        setSelectedPaymentMethod(JSON.parse(savedPayment))
      } catch (error) {
        console.error("Error loading payment method:", error)
        setSelectedPaymentMethod(paymentMethods[0])
      }
    } else {
      setSelectedPaymentMethod(paymentMethods[0])
    }

    setIsLoading(false)
  }, [])
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      if (selectedAddress) {
        const res = await getDelFeeCount(
          cart!.restaurantId||"",
          selectedAddress.lat,
          selectedAddress.lon
        );
        setFetchGetDelFee(res||null);
      }
    };

    fetchDeliveryFee();
  }, [selectedAddress]);

  // Format extras for display
  const formatExtras = (extraGroups?: Array<Record<string, number>>) => {
    if (!extraGroups || extraGroups.length === 0) return null

    return (
      <div className="mt-1 text-xs text-muted-foreground">
        {extraGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {Object.entries(group).map(([key, value]) => (
              <div key={key}>
                <span>{EXTRA_NAMES[key] || key}: </span>
                <span>{EXTRA_NAMES[value.toString()] || value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Use the stored totalPrice if available, otherwise calculate it
  const getItemTotalPrice = (item: CartItem) => {
    if (item.totalPrice !== undefined) {
      return item.totalPrice
    }

    let basePrice = item.price || 0

    // Add extras price if available (fallback calculation)
    if (item.extraGroups && item.extraGroups.length > 0) {
      // For now, we'll just add a fixed amount per extra
      // In a real app, you would calculate based on actual extra prices
      basePrice += 5000
    }

    return basePrice * item.quantity
  }

  const getDeliveryEstimated = () =>{
    const timeEstimated = fetchGetDelFee?.estimasiPengiriman||30;
    return `${timeEstimated-5}-${timeEstimated+5} min`
  }

  const calculateSubtotal = () => {
    if (!cart) return 0
    return cart.items.reduce((total, item) => total + getItemTotalPrice(item), 0)
  }

  const calculateDeliveryFee = () => {
    return fetchGetDelFee?.fee || 15000;
  }

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.1) // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee() + calculateTax()
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {

    if (!cart) return

    if (newQuantity <= 0) {
      // Remove the item
      const updatedItems = cart.items.filter((item) => item.id !== itemId)

      if (updatedItems.length === 0) {
        // If cart becomes empty, remove it from localStorage
        localStorage.removeItem("restaurantCart")
        setCart(null)
        toast.success("Cart is now empty")
        return
      }

      const updatedCart = {
        ...cart,
        items: updatedItems,
      }

      // Update state and localStorage
      setCart(updatedCart)
      localStorage.setItem("restaurantCart", JSON.stringify(updatedCart))

      toast.success("Item removed from cart")
    } else {
      // Update quantity directly in localStorage first
      const existingCartData = localStorage.getItem("restaurantCart")
      if (existingCartData) {
        const parsedCart: CartData = JSON.parse(existingCartData)
        const itemIndex = parsedCart.items.findIndex((item) => item.id === itemId)

        if (itemIndex >= 0) {
          const oldQuantity = parsedCart.items[itemIndex].quantity

          // Update quantity
          parsedCart.items[itemIndex].quantity = newQuantity

          // Update total price based on the new quantity
          if (parsedCart.items[itemIndex].totalPrice !== undefined) {
            // Calculate single item price and then multiply by new quantity
            const singleItemPrice = parsedCart.items[itemIndex].totalPrice / oldQuantity
            parsedCart.items[itemIndex].totalPrice = singleItemPrice * newQuantity
          }

          // Save back to localStorage
          localStorage.setItem("restaurantCart", JSON.stringify(parsedCart))

          // Update state from updated localStorage
          setCart(parsedCart)
          return
        }
      }

      // Fallback if localStorage update fails
      const updatedItems = cart.items.map((item) => {
        if (item.id === itemId) {
          const oldQuantity = item.quantity
          const newItem = { ...item, quantity: newQuantity }

          // Update total price if it exists
          if (item.totalPrice !== undefined) {
            const singleItemPrice = item.totalPrice / oldQuantity
            newItem.totalPrice = singleItemPrice * newQuantity
          }

          return newItem
        }
        return item
      })

      const updatedCart = {
        ...cart,
        items: updatedItems,
      }

      // Update state and localStorage
      setCart(updatedCart)
      localStorage.setItem("restaurantCart", JSON.stringify(updatedCart))
    }
  }

  const removeItem = (itemId: string) => {
    if (!cart) return

    const updatedItems = cart.items.filter((item) => item.id !== itemId)

    if (updatedItems.length === 0) {
      // If cart becomes empty, remove it from localStorage
      localStorage.removeItem("restaurantCart")
      setCart(null)
      toast.success("Cart is now empty")
      return
    }

    const updatedCart = {
      ...cart,
      items: updatedItems,
    }

    // Update state and localStorage
    setCart(updatedCart)
    localStorage.setItem("restaurantCart", JSON.stringify(updatedCart))

    toast.success("Item removed from cart")
  }

  const openNotesDialog = (item: CartItem) => {
    setCurrentItemForNotes(item)
    setNoteText(item.notes || "")
    setIsNotesDialogOpen(true)
  }

  const saveNotes = () => {
    if (!currentItemForNotes || !cart) return

    const updatedItems = cart.items.map((item) =>
      item.id === currentItemForNotes.id ? { ...item, notes: noteText } : item,
    )

    const updatedCart = {
      ...cart,
      items: updatedItems,
    }

    // Update state and localStorage
    setCart(updatedCart)
    localStorage.setItem("restaurantCart", JSON.stringify(updatedCart))

    setIsNotesDialogOpen(false)
    toast.success("Notes saved")
  }

  const clearCart = () => {
    localStorage.removeItem("restaurantCart")
    setCart(null)
    toast.success("Cart cleared")
  }

  const handleCheckout = async () => {
    setIsProceed(true)
    if (!selectedAddress) {
      toast.error("Please select a delivery address")
      setIsProceed(false)
      return
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method")
      setIsProceed(false)
      return
    }
    console.log(cart);
    if(cart===null){
      router.push("/pembeli")
    }
    toast.success("Processing your order...")
    const mappedItems: itemsCheckout[] = cart!.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      notes: item.notes || "",
      extraGroups: item.extraGroups ||[]
    }));
    const entity:checkoutDto = {
      restaurantId:cart!.restaurantId,
      transaksiType: selectedPaymentMethod.type,
      statusTransaksi:StatusTransaksi.BELUMBAYAR,
      alamatPengiriman:selectedAddress.address,
      ongkir:fetchGetDelFee?.fee||0,
      latitude:selectedAddress.lat,
      longitude:selectedAddress.lon,
      items:mappedItems
    }
    // console.log(entity)
    const res:responseCheckoutDto|null = await checkout(entity) || null;
    if(res==null){
      // router.push('/pembeli/cart')
      Swal.fire("Error", "Error Internal Server", "error")
      return
    }
    const idTrans = res?.idTransaction;
    localStorage.setItem("totalPrice",  calculateTotal().toString())
    // In a real app, this would navigate to checkout or process the order
    if(selectedPaymentMethod.type == TransaksiType.QRIS){
      toast.success("Order placed successfully!")
      // clearCart()
      router.push(`/pembeli/payment/qris/${idTrans}`);
    }
      setIsProceed(false)
  }

  const selectAddress = (address: Address) => {
    setSelectedAddress(address)
    localStorage.setItem("selectedAddress", JSON.stringify(address))
    setIsAddressSelectorOpen(false)
    toast.success(`Delivery address set to ${address.name}`)
  }

  const selectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
    localStorage.setItem("selectedPayment", JSON.stringify(method))
    setIsPaymentSelectorOpen(false)
    toast.success(`Payment method set to ${method.name}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add items from a restaurant to get started</p>
          <Button asChild>
            <Link href="/">Browse Restaurants</Link>
          </Button>
        </div>
        <BottomNavigation />
      </div>
    )
  }
  
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Your Cart</h1>
          <Button variant="ghost" size="sm" className="ml-auto text-red-500" onClick={clearCart}>
            Clear
          </Button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className="ml-3 flex-1">
            <h2 className="font-medium">{cart.restaurantName}</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getDeliveryEstimated()}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/pembeli/restaurant/${cart.restaurantId}`}>
              Add Items <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium">Delivery Address</h3>
            <p className="text-sm text-muted-foreground">{selectedAddress?.address || "Select an address"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsAddressSelectorOpen(true)}>
            Change
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-3">Order Items</h2>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {item.image && (
                    <div className="relative h-20 w-20 rounded-md overflow-hidden">
                      <Image
                        src={getImageUrl(item.image) || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="font-medium">{formatRupiah(getItemTotalPrice(item))}</p>
                    </div>

                    {/* Extras */}
                    {formatExtras(item.extraGroups)}

                    {/* Notes */}
                    {item.notes && <div className="mt-1 text-xs italic text-muted-foreground">Note: {item.notes}</div>}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => openNotesDialog(item)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-4 border-t border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Payment Method</h3>
              <p className="text-sm text-muted-foreground">{selectedPaymentMethod?.name || "Select payment method"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsPaymentSelectorOpen(true)}>
            Change
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4 mb-20">
        <h2 className="font-semibold text-lg mb-3">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatRupiah(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>{formatRupiah(calculateDeliveryFee())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span>{formatRupiah(calculateTax())}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatRupiah(calculateTotal())}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t z-40">
        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProceed}>
          {isProceed ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Special Instructions</DialogTitle>
            <DialogDescription>Add any special requests for this item</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="E.g., No onions, extra spicy, etc."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNotes}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Selector Dialog */}
      <Dialog open={isAddressSelectorOpen} onOpenChange={setIsAddressSelectorOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Delivery Address</DialogTitle>
            <DialogDescription>Choose where you want your order delivered</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {/* Your current location option */}
              <div
                className="p-3 border rounded-lg cursor-pointer hover:border-primary"
                onClick={() => {
                  // Get user location from localStorage
                  const storedLocation = localStorage.getItem("userLocation")
                  if (storedLocation) {
                    try {
                      const userLocation = JSON.parse(storedLocation)
                      selectAddress({
                        id: "current",
                        name: userLocation.name,
                        address: userLocation.address,
                        type: typeAddress.current,
                        lat: parseFloat(userLocation.latitude),
                        lon: parseFloat(userLocation.longitude)
                      })
                    } catch (error) {
                      console.error("Error parsing user location:", error)
                      toast.error("Could not load your location")
                    }
                  } else {
                    toast.error("No saved location found")
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Your current location</h3>
                    <p className="text-sm text-muted-foreground">Use your saved location</p>
                  </div>
                </div>
              </div>

              {/* Select on map option */}
              <div
                className="p-3 border rounded-lg cursor-pointer hover:border-primary"
                onClick={() => {
                  setIsAddressSelectorOpen(false)
                  setIsMapSelectorOpen(true)
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Map className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Select on map</h3>
                    <p className="text-sm text-muted-foreground">Choose a location on the map</p>
                  </div>
                </div>
              </div>

              {/* {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedAddress?.id === address.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => selectAddress(address)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{address.name}</h3>
                      <p className="text-sm text-muted-foreground">{address.address}</p>
                    </div>
                    {selectedAddress?.id === address.id && <div className="h-4 w-4 rounded-full bg-primary"></div>}
                  </div>
                </div>
              ))} */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressSelectorOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Location Selector */}
      <MapLocationSelector
        isOpen={isMapSelectorOpen}
        onClose={() => setIsMapSelectorOpen(false)}
        onSelectLocation={(location) => {
          const newAddress = {
            id: "map-" + Date.now(),
            name: location.name,
            address: location.address,
            type: typeAddress.other,
            lat: location.latitude,
            lon: location.longitude
          }
          selectAddress(newAddress)
        }}
        initialLocation={
          selectedAddress?.id === "current" && localStorage.getItem("userLocation")
            ? JSON.parse(localStorage.getItem("userLocation")!)
            : undefined
        }
      />

      {/* Payment Method Selector */}
      <Dialog open={isPaymentSelectorOpen} onOpenChange={setIsPaymentSelectorOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>Choose how you want to pay for your order</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                key={method.id}
                className={`
                    p-3 border rounded-lg
                    ${selectedPaymentMethod?.id === method.id  && method.isActive ? "border-primary bg-primary/5" : ""}
                    ${!method.isActive ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "cursor-pointer"}
                `}
                onClick={() => {
                    if (method.isActive) {
                    selectPaymentMethod(method);
                    }
                }}
                >
                <div className="flex justify-between items-center">
                    <div>
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.details}</p>
                    {!method.isActive && (
                        <p className="text-sm text-red-500 mt-1">
                        Sorry, this payment method is not available.
                        </p>
                    )}
                    </div>

                    {selectedPaymentMethod?.id === method.id  && method.isActive && (
                    <div className="h-4 w-4 rounded-full bg-primary"></div>
                    )}
                </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentSelectorOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
