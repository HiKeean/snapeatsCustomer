"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Star, Clock, ChevronLeft, Heart, Share2, ShoppingCart, Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { foodCategoryRestoranPage, restoranPage } from "@/services/dto/restaurant"
import router from "next/router"
import { getRestoById } from "@/services/foodService"
import { formatRupiah, getImageUrl } from "@/services/api"
import { ExtrasModal } from "@/components/extras-modal"

// Define the cart structure based on the provided JSON
interface CartItem {
  id: string
  name: string
  extraGroups?: Array<Record<string, number>> // Array of objects with string keys and number values
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
  // delFee:number
  items: CartItem[]
}

export default function RestaurantPage({ params }: { params: Promise<{ id?: string }> }) {
  const { id = "default-restaurant" } = use(params)
  const [restaurant, setRestaurant] = useState<restoranPage>()
  const [foodCategories, setFoodCategories] = useState<foodCategoryRestoranPage[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [showExtrasModal, setShowExtrasModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false) // Flag to prevent double adds

  useEffect(() => {
    // Fetch restaurant data
    const fetchData = async () => {
      const temp = localStorage.getItem("userLocation")
      if (temp === null) {
        router.push("/")
        return
      }
      const location = JSON.parse(temp)
      const lat = location.latitude
      const lon = location.longitude
      const res: restoranPage | undefined = await getRestoById(id, lat, lon)
      console.log(res)
      setRestaurant(res)
      setFoodCategories(res?.food || [])
    }
    fetchData()
  }, [id])

  useEffect(() => {
    // Load cart from localStorage if it exists and matches current restaurant
    const savedCart = localStorage.getItem("restaurantCart")
    if (savedCart && restaurant) {
      try {
        const cartData: CartData = JSON.parse(savedCart)
        if (cartData.restaurantId === restaurant.id) {
          setCart(cartData.items || [])

          // Rebuild item quantities from cart items
          const quantities: Record<string, number> = {}
          cartData.items.forEach((item: CartItem) => {
            quantities[item.id] = item.quantity
          })
          setItemQuantities(quantities)
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [restaurant])

  // Calculate total price for an item including extras
  const calculateItemTotalPrice = (item: any, selectedExtras?: Record<number, number | number[]>): number => {
    let basePrice = Number(item.price || 0)

    // Add extras price if available
    if (selectedExtras) {
      Object.entries(selectedExtras).forEach(([groupId, selection]) => {
        // Find the extra group
        const group = item.extraGroups?.find((g: any) => g.id === Number(groupId))

        if (group) {
          if (Array.isArray(selection)) {
            // Multiple selections
            selection.forEach((detailId) => {
              const detail = group.details?.find((d: any) => d.id === detailId)
              if (detail) {
                basePrice += Number(detail.price || 0)
              }
            })
          } else {
            // Single selection
            const detail = group.details?.find((d: any) => d.id === selection)
            if (detail) {
              basePrice += Number(detail.price || 0)
            }
          }
        }
      })
    }

    return basePrice
  }

  // const deliveryFee = (distance:number) => {
  //   if(distance < 5)return 15000;
  //   else if(distance > 5 && distance < 10)return 30000;
  //   else return 50000;
  // }

  const addToCart = (item: any) => {
    console.log("addToCart called for item:", item.id)

    // Prevent double adds
    if (isAddingToCart) {
      console.log("Already adding to cart, ignoring")
      return
    }

    setIsAddingToCart(true)

    // Check if there's an existing cart from a different restaurant
    const existingCart = localStorage.getItem("restaurantCart")

    if (existingCart) {
      const cartData: CartData = JSON.parse(existingCart)

      // If the cart is from a different restaurant, show confirmation
      if (cartData.restaurantId && cartData.restaurantId !== restaurant!.id) {
        toast.custom(
          (t) => (
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
              <h3 className="font-bold mb-2">Replace Cart?</h3>
              <p className="mb-4">
                You already have items in your cart from <b>{cartData.restaurantName}</b>. Would you like to replace
                your cart with items from <b>{restaurant!.name}</b>?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.dismiss(t)
                    setIsAddingToCart(false)
                  }}
                >
                  Keep Current Cart
                </Button>
                <Button
                  onClick={() => {
                    // Clear existing cart
                    setCart([])
                    setItemQuantities({})

                    // Check if the item has extra groups
                    if (item.extraGroups && item.extraGroups.length > 0) {
                      setSelectedItem(item)
                      setShowExtrasModal(true)
                    } else {
                      // If no extras, add directly to cart
                      addItemToCart(item)
                    }
                    toast.dismiss(t)
                  }}
                >
                  Replace Cart
                </Button>
              </div>
            </div>
          ),
          { duration: 10000 },
        )
        return
      }
    }

    // If no cart conflict, proceed normally
    if (item.extraGroups && item.extraGroups.length > 0) {
      setSelectedItem(item)
      setShowExtrasModal(true)
    } else {
      // If no extras, add directly to cart
      addItemToCart(item)
    }
  }

  // Helper function to convert extras format from number keys to string keys
  const convertExtrasFormat = (extras: Record<number, number | number[]>): Record<string, number> => {
    const result: Record<string, number> = {}

    Object.entries(extras).forEach(([key, value]) => {
      // If the value is an array, we need to handle it differently
      // For this example, we'll just use the first value if it's an array
      // You may need to adjust this based on your specific requirements
      if (Array.isArray(value)) {
        if (value.length > 0) {
          result[key] = value[0]
        }
      } else {
        result[key] = value
      }
    })

    return result
  }

  const addItemToCart = (item: any, selectedExtras?: Record<number, number | number[]>, itemTotalPrice?:number) => {
    console.log("addItemToCart called for item:", item.id)

    // Format the extras in the required structure if provided
    const formattedExtras = selectedExtras
      ? [convertExtrasFormat(selectedExtras)] // Convert and wrap in array as per the required format
      : undefined

    // Calculate the total price for this item
    const itemPrice = Number(item.price || 0)
    // const itemTotalPrice = calculateItemTotalPrice(item, selectedExtras)

    // Create the cart item with the required structure
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      extraGroups: formattedExtras,
      quantity: 1,
      price: itemPrice,
      totalPrice: itemTotalPrice, // Store the calculated total price
      image: item.image,
      description: item.description,
      notes: "", // Initialize with empty notes
    }

    // Get existing cart data if it exists
    const existingCartData = localStorage.getItem("restaurantCart")
    let parsedCart: CartData | null = null

    if (existingCartData) {
      try {
        parsedCart = JSON.parse(existingCartData)
      } catch (error) {
        console.error("Error parsing cart data:", error)
      }
    }

    // If we have a valid cart and it's from the same restaurant
    if (parsedCart && parsedCart.restaurantId === restaurant!.id) {
      const existingItemIndex = parsedCart.items.findIndex((i) => i.id === item.id)

      if (existingItemIndex >= 0) {
        // Item exists, update its quantity and total price
        parsedCart.items[existingItemIndex].quantity += 1
        // Update total price based on the new quantity
        if (parsedCart.items[existingItemIndex].totalPrice) {
          parsedCart.items[existingItemIndex].totalPrice = itemTotalPrice! * parsedCart.items[existingItemIndex].quantity
        }
      } else {
        // Item doesn't exist, add it
        parsedCart.items.push(cartItem)
      }

      // Save back to localStorage
      localStorage.setItem("restaurantCart", JSON.stringify(parsedCart))

      // Update state from localStorage
      setCart(parsedCart.items)

      // Update quantities
      const quantities: Record<string, number> = {}
      parsedCart.items.forEach((item: CartItem) => {
        quantities[item.id] = item.quantity
      })
      setItemQuantities(quantities)
    } else {
      // Create new cart
      const newCartData: CartData = {
        restaurantId: restaurant!.id,
        restaurantName: restaurant!.name,
        // delFee: deliveryFee(restaurant?.distance),
        items: [cartItem],
      }

      // Save to localStorage
      localStorage.setItem("restaurantCart", JSON.stringify(newCartData))

      // Update state
      setCart([cartItem])
      setItemQuantities({ [item.id]: 1 })
    }

    toast(`${item.name} added to your cart`)
    setIsAddingToCart(false) // Reset flag
    setShowExtrasModal(false) // Close modal if open
  }

  // Tambahkan console.log untuk debugging
  const increaseQuantity = (item: any) => {
    console.log("increaseQuantity called for item:", item.id)

    // Dapatkan nilai quantity saat ini dari localStorage
    const existingCartData = localStorage.getItem("restaurantCart")
    if (existingCartData) {
      const parsedCart: CartData = JSON.parse(existingCartData)
      if (parsedCart.restaurantId === restaurant!.id) {
        const cartItemIndex = parsedCart.items.findIndex((i) => i.id === item.id)
        if (cartItemIndex >= 0) {
          // Tambah quantity langsung di localStorage
          parsedCart.items[cartItemIndex].quantity += 1

          // Update total price based on the new quantity
          if (parsedCart.items[cartItemIndex].totalPrice !== undefined) {
            const singleItemPrice =
              parsedCart.items[cartItemIndex].totalPrice / (parsedCart.items[cartItemIndex].quantity - 1)
            parsedCart.items[cartItemIndex].totalPrice = singleItemPrice * parsedCart.items[cartItemIndex].quantity
          } else {
            // If totalPrice doesn't exist yet, calculate it
            parsedCart.items[cartItemIndex].totalPrice =
              (parsedCart.items[cartItemIndex].price || 0) * parsedCart.items[cartItemIndex].quantity
          }

          // Update localStorage
          localStorage.setItem("restaurantCart", JSON.stringify(parsedCart))

          // Update state dari localStorage yang sudah diupdate
          setCart(parsedCart.items)

          // Update itemQuantities state
          const quantities: Record<string, number> = {}
          parsedCart.items.forEach((item: CartItem) => {
            quantities[item.id] = item.quantity
          })
          setItemQuantities(quantities)

          return
        }
      }
    }

    // Jika item tidak ditemukan di localStorage, gunakan pendekatan lama
    setItemQuantities((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }))

    setCart((prev) => {
      const existingItemIndex = prev.findIndex((i) => i.id === item.id)

      if (existingItemIndex >= 0) {
        const newCart = [...prev]
        newCart[existingItemIndex].quantity += 1

        // Update total price
        if (newCart[existingItemIndex].totalPrice !== undefined) {
          const singleItemPrice = newCart[existingItemIndex].totalPrice / (newCart[existingItemIndex].quantity - 1)
          newCart[existingItemIndex].totalPrice = singleItemPrice * newCart[existingItemIndex].quantity
        } else {
          newCart[existingItemIndex].totalPrice =
            (newCart[existingItemIndex].price || 0) * newCart[existingItemIndex].quantity
        }

        // Update localStorage
        const newCartData: CartData = {
          restaurantId: restaurant!.id,
          restaurantName: restaurant!.name,
          items: newCart,
        }
        localStorage.setItem("restaurantCart", JSON.stringify(newCartData))

        return newCart
      } else {
        const cartItem: CartItem = {
          id: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          totalPrice: item.price, // Initial total price is the same as price
          image: item.image,
          description: item.description,
          notes: "",
        }

        const newCart = [...prev, cartItem]

        // Update localStorage
        const newCartData: CartData = {
          restaurantId: restaurant!.id,
          restaurantName: restaurant!.name,
          items: newCart,
        }
        localStorage.setItem("restaurantCart", JSON.stringify(newCartData))

        return newCart
      }
    })
  }

  // Perbarui juga fungsi decreaseQuantity dengan pendekatan yang sama
  const decreaseQuantity = (item: any) => {
    console.log("decreaseQuantity called for item:", item.id)

    // Dapatkan nilai quantity saat ini dari localStorage
    const existingCartData = localStorage.getItem("restaurantCart")
    if (existingCartData) {
      const parsedCart: CartData = JSON.parse(existingCartData)
      if (parsedCart.restaurantId === restaurant!.id) {
        const cartItemIndex = parsedCart.items.findIndex((i) => i.id === item.id)
        if (cartItemIndex >= 0) {
          if (parsedCart.items[cartItemIndex].quantity <= 1) {
            // Hapus item jika quantity akan menjadi 0
            parsedCart.items = parsedCart.items.filter((i) => i.id !== item.id)

            // Hapus cart jika tidak ada item tersisa
            if (parsedCart.items.length === 0) {
              localStorage.removeItem("restaurantCart")
              setCart([])
              setItemQuantities({})
              return
            }
          } else {
            // Kurangi quantity
            parsedCart.items[cartItemIndex].quantity -= 1

            // Update total price based on the new quantity
            if (parsedCart.items[cartItemIndex].totalPrice !== undefined) {
              const singleItemPrice =
                parsedCart.items[cartItemIndex].totalPrice / (parsedCart.items[cartItemIndex].quantity + 1)
              parsedCart.items[cartItemIndex].totalPrice = singleItemPrice * parsedCart.items[cartItemIndex].quantity
            } else {
              parsedCart.items[cartItemIndex].totalPrice =
                (parsedCart.items[cartItemIndex].price || 0) * parsedCart.items[cartItemIndex].quantity
            }
          }

          // Update localStorage
          localStorage.setItem("restaurantCart", JSON.stringify(parsedCart))

          // Update state dari localStorage yang sudah diupdate
          setCart(parsedCart.items)

          // Update itemQuantities state
          const quantities: Record<string, number> = {}
          parsedCart.items.forEach((item: CartItem) => {
            quantities[item.id] = item.quantity
          })
          setItemQuantities(quantities)

          return
        }
      }
    }

    // Jika item tidak ditemukan di localStorage, gunakan pendekatan lama
    const currentQty = itemQuantities[item.id] || 0

    if (currentQty <= 1) {
      // Remove from quantities
      const newQuantities = { ...itemQuantities }
      delete newQuantities[item.id]
      setItemQuantities(newQuantities)

      // Remove from cart
      setCart((prev) => {
        const newCart = prev.filter((i) => i.id !== item.id)

        // Update localStorage
        if (newCart.length === 0) {
          localStorage.removeItem("restaurantCart")
        } else {
          const newCartData: CartData = {
            restaurantId: restaurant!.id,
            restaurantName: restaurant!.name,
            items: newCart,
          }
          localStorage.setItem("restaurantCart", JSON.stringify(newCartData))
        }

        return newCart
      })
    } else {
      // Decrease quantity
      setItemQuantities((prev) => ({
        ...prev,
        [item.id]: prev[item.id] - 1,
      }))

      setCart((prev) => {
        const existingItemIndex = prev.findIndex((i) => i.id === item.id)

        if (existingItemIndex >= 0) {
          const newCart = [...prev]
          newCart[existingItemIndex].quantity -= 1

          // Update total price
          if (newCart[existingItemIndex].totalPrice !== undefined) {
            const singleItemPrice = newCart[existingItemIndex].totalPrice / (newCart[existingItemIndex].quantity + 1)
            newCart[existingItemIndex].totalPrice = singleItemPrice * newCart[existingItemIndex].quantity
          } else {
            newCart[existingItemIndex].totalPrice =
              (newCart[existingItemIndex].price || 0) * newCart[existingItemIndex].quantity
          }

          // Update localStorage
          const newCartData: CartData = {
            restaurantId: restaurant!.id,
            restaurantName: restaurant!.name,
            items: newCart,
          }
          localStorage.setItem("restaurantCart", JSON.stringify(newCartData))

          return newCart
        }

        return prev
      })
    }
  }

  if (!restaurant) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="pb-20">
      {/* Restaurant Header */}
      <div className="relative h-48 w-full">
        <Image
          src={getImageUrl(restaurant.image) || "/placeholder.svg"}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
          <Button size="icon" variant="secondary" className="rounded-full bg-white/80" asChild>
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button size="icon" variant="secondary" className="rounded-full bg-white/80">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full bg-white/80">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>

        <div className="flex items-center mt-1 text-sm">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          <span className="font-medium mr-1">{restaurant.rating}</span>
          <span className="text-muted-foreground mr-2">({restaurant.reviewCount} reviews)</span>
          <span className="text-muted-foreground mr-2">•</span>
          <span className="text-muted-foreground">{restaurant.distance}</span>
        </div>

        <div className="flex items-center mt-1 text-sm">
          <span className="text-muted-foreground mr-2">{restaurant.category}</span>
          <span className="text-muted-foreground mr-2">•</span>
          <span className="text-muted-foreground mr-2">{restaurant.priceRange}</span>
          <span className="text-muted-foreground mr-2">•</span>
          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-muted-foreground">{restaurant.estDel}</span>
        </div>

        <div className="mt-2">
          <Badge variant={restaurant.isOpen ? "outline" : "secondary"}>
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{restaurant.address}</p>
      </div>

      <Separator />

      {/* Menu */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>

        {foodCategories.map((category) => (
          <div key={category.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
            <div className="space-y-3">
              {category.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="flex-1 p-3">
                        <div className="flex items-center">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.popular && (
                            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="mt-2">
                          <p className="font-medium">{formatRupiah(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="relative h-32 w-32">
                          <Image
                            src={getImageUrl(item.image) || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {/* Quantity control */}
                        <div className="mt-1 w-32">
                          {itemQuantities[item.id] ? (
                            <div className="flex items-center justify-between">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-primary text-primary"
                                onClick={() => decreaseQuantity(item)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium mx-2">{itemQuantities[item.id]}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-primary text-primary"
                                onClick={() => increaseQuantity(item)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => addToCart(item)} className="w-full">
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 z-40">
          <Button className="w-full" size="lg" asChild>
            <Link href="/pembeli/cart">
              <ShoppingCart className="mr-2 h-5 w-5" />
              <span>View Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
            </Link>
          </Button>
        </div>
      )}

      {/* Extras Modal */}
      <ExtrasModal
        isOpen={showExtrasModal}
        onClose={() => {
          setShowExtrasModal(false)
          setIsAddingToCart(false) // Reset flag when modal is closed
        }}
        item={selectedItem}
        onAddToCart={addItemToCart}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
