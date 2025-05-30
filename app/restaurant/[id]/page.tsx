"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Star, Clock, ChevronLeft, Heart, Share2, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner";


// This would normally come from an API
const getRestaurantData = (id: string) => {
  // For demo purposes, we're returning mock data
  return {
    id,
    name: "Warung Padang Sederhana",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.8,
    reviewCount: 243,
    deliveryTime: "15-25 min",
    categories: ["Indonesian", "Padang"],
    priceRange: "$$",
    description: "Authentic Padang cuisine with a variety of traditional dishes.",
    address: "Jl. Kemang Raya No. 10, Jakarta Selatan",
    isOpen: true,
    distance: "1.2 km",
  }
}

// Sample menu items
const menuCategories = [
  {
    id: "main",
    name: "Main Dishes",
    items: [
      {
        id: "m1",
        name: "Rendang",
        description: "Slow-cooked beef in coconut milk and spices",
        price: 45000,
        image: "/placeholder.svg?height=200&width=300",
        popular: true,
      },
      {
        id: "m2",
        name: "Ayam Pop",
        description: "Fried chicken with special Padang spices",
        price: 35000,
        image: "/placeholder.svg?height=200&width=300",
        popular: false,
      },
      {
        id: "m3",
        name: "Gulai Ikan",
        description: "Fish curry with traditional Padang spices",
        price: 40000,
        image: "/placeholder.svg?height=200&width=300",
        popular: true,
      },
    ],
  },
  {
    id: "sides",
    name: "Side Dishes",
    items: [
      {
        id: "s1",
        name: "Sayur Nangka",
        description: "Young jackfruit curry",
        price: 15000,
        image: "/placeholder.svg?height=200&width=300",
        popular: false,
      },
      {
        id: "s2",
        name: "Terong Balado",
        description: "Eggplant with chili sauce",
        price: 15000,
        image: "/placeholder.svg?height=200&width=300",
        popular: true,
      },
    ],
  },
  {
    id: "drinks",
    name: "Beverages",
    items: [
      {
        id: "d1",
        name: "Es Teh Manis",
        description: "Sweet iced tea",
        price: 8000,
        image: "/placeholder.svg?height=200&width=300",
        popular: false,
      },
      {
        id: "d2",
        name: "Es Jeruk",
        description: "Fresh orange juice",
        price: 10000,
        image: "/placeholder.svg?height=200&width=300",
        popular: false,
      },
    ],
  },
]

export default function RestaurantPage({ params }: { params: Promise<{ id?: string }> }) {
    const { id = "default-restaurant" } = use(params);
    const [restaurant, setRestaurant] = useState<any>(null)
    const [cart, setCart] = useState<any[]>([])
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
//   const { toast } = useToast()

  useEffect(() => {
    // Fetch restaurant data
    const data = getRestaurantData(id)
    setRestaurant(data)

    // Simulate order status updates with a timer
    // This replaces the WebSocket functionality
    const timer = setTimeout(() => {
      if (cart.length > 0) {
        const newStatus = "preparing"
        setOrderStatus(newStatus)
        toast(`Your order status: ${newStatus}`);
      }
    }, 10000) // 10 seconds after adding to cart

    return () => {
      clearTimeout(timer)
    }
  }, [id, cart, toast])

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id)

      if (existingItem) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      } else {
        return [...prev, { ...item, quantity: 1 }]
      }
    })

    toast(`${item.name} added to your cart`)
  }

  if (!restaurant) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="pb-20">
      {/* Restaurant Header */}
      <div className="relative h-48 w-full">
        <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
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
          <span className="text-muted-foreground mr-2">{restaurant.categories.join(", ")}</span>
          <span className="text-muted-foreground mr-2">•</span>
          <span className="text-muted-foreground mr-2">{restaurant.priceRange}</span>
          <span className="text-muted-foreground mr-2">•</span>
          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-muted-foreground">{restaurant.deliveryTime}</span>
        </div>

        <div className="mt-2">
          <Badge variant={restaurant.isOpen ? "outline" : "secondary"}>
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{restaurant.description}</p>
        <p className="mt-1 text-sm text-muted-foreground">{restaurant.address}</p>
      </div>

      <Separator />

      {/* Menu */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>

        {menuCategories.map((category) => (
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
                        <div className="flex justify-between items-center mt-2">
                          <p className="font-medium">Rp {item.price.toLocaleString()}</p>
                          <Button size="sm" onClick={() => addToCart(item)}>
                            Add
                          </Button>
                        </div>
                      </div>
                      <div className="relative h-24 w-24">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Status */}
      {orderStatus && (
        <div className="mx-4 mb-4 p-3 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium">
            Order Status: <span className="text-primary">{orderStatus}</span>
          </p>
        </div>
      )}

      {/* Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 z-40">
          <Button className="w-full" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span>View Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

