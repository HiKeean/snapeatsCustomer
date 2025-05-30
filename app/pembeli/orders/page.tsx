"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
// import { useWebSocket } from "@/lib/websocket-service"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner";

import {
  Clock,
  MapPin,
  MoreVertical,
  ShoppingBag,
  CheckCircle2,
  Bike,
  Package,
  AlertCircle,
  RotateCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Sample data for active orders
const activeOrders = [
  {
    id: "ORD-001",
    restaurantName: "Warung Padang Sederhana",
    restaurantImage: "/placeholder.svg?height=400&width=600",
    items: [
      { name: "Beef Rendang", quantity: 1, price: 45000 },
      { name: "Ayam Pop", quantity: 2, price: 35000 },
    ],
    total: 115000,
    status: "preparing", // preparing, on_the_way, delivered, cancelled
    orderTime: "2023-03-08T14:30:00",
    estimatedDelivery: "2023-03-08T15:15:00",
    deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
    trackingSteps: [
      { id: 1, title: "Order Confirmed", completed: true, time: "14:32" },
      { id: 2, title: "Preparing Food", completed: true, time: "14:40" },
      { id: 3, title: "On The Way", completed: false, time: "" },
      { id: 4, title: "Delivered", completed: false, time: "" },
    ],
    driver: {
      name: "Budi Santoso",
      phone: "+62812345678",
      photo: "/placeholder.svg?height=200&width=200",
      vehicleNumber: "B 1234 XYZ",
    },
  },
  {
    id: "ORD-002",
    restaurantName: "Pizza Hut",
    restaurantImage: "/placeholder.svg?height=400&width=600",
    items: [
      { name: "Pepperoni Pizza (Large)", quantity: 1, price: 129000 },
      { name: "Garlic Bread", quantity: 1, price: 35000 },
    ],
    total: 164000,
    status: "on_the_way", // preparing, on_the_way, delivered, cancelled
    orderTime: "2023-03-08T13:15:00",
    estimatedDelivery: "2023-03-08T14:00:00",
    deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
    trackingSteps: [
      { id: 1, title: "Order Confirmed", completed: true, time: "13:17" },
      { id: 2, title: "Preparing Food", completed: true, time: "13:25" },
      { id: 3, title: "On The Way", completed: true, time: "13:45" },
      { id: 4, title: "Delivered", completed: false, time: "" },
    ],
    driver: {
      name: "Ahmad Rizki",
      phone: "+62812345679",
      photo: "/placeholder.svg?height=200&width=200",
      vehicleNumber: "B 5678 ABC",
    },
  },
]

// Sample data for past orders
const pastOrders = [
  {
    id: "ORD-003",
    restaurantName: "KFC",
    restaurantImage: "/placeholder.svg?height=400&width=600",
    items: [
      { name: "Original Recipe Chicken (2 pcs)", quantity: 1, price: 40000 },
      { name: "French Fries (Regular)", quantity: 1, price: 15000 },
      { name: "Coca Cola (Medium)", quantity: 1, price: 10000 },
    ],
    total: 65000,
    status: "delivered", // preparing, on_the_way, delivered, cancelled
    orderTime: "2023-03-07T12:30:00",
    deliveryTime: "2023-03-07T13:05:00",
    deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
  },
  {
    id: "ORD-004",
    restaurantName: "Sushi Tei",
    restaurantImage: "/placeholder.svg?height=400&width=600",
    items: [
      { name: "Salmon Sushi (8 pcs)", quantity: 1, price: 85000 },
      { name: "Tempura Roll", quantity: 1, price: 65000 },
      { name: "Green Tea", quantity: 2, price: 15000 },
    ],
    total: 180000,
    status: "delivered", // preparing, on_the_way, delivered, cancelled
    orderTime: "2023-03-06T19:00:00",
    deliveryTime: "2023-03-06T19:45:00",
    deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
  },
  {
    id: "ORD-005",
    restaurantName: "Burger King",
    restaurantImage: "/placeholder.svg?height=400&width=600",
    items: [
      { name: "Whopper", quantity: 1, price: 50000 },
      { name: "Onion Rings", quantity: 1, price: 20000 },
      { name: "Coca Cola (Large)", quantity: 1, price: 15000 },
    ],
    total: 85000,
    status: "cancelled", // preparing, on_the_way, delivered, cancelled
    orderTime: "2023-03-05T20:15:00",
    cancelReason: "Restaurant is too busy",
    deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
  },
  {
    id: "ORD-006",
    restaurantName: "Bakmi GM",
    restaurantImage: "/placeholder.svg?height=400&width=600",
    items: [
      { name: "Bakmi Special", quantity: 2, price: 40000 },
      { name: "Pangsit Goreng", quantity: 1, price: 25000 },
      { name: "Es Jeruk", quantity: 2, price: 12000 },
    ],
    total: 129000,
    status: "delivered", // preparing, on_the_way, delivered, cancelled
    orderTime: "2023-03-04T18:30:00",
    deliveryTime: "2023-03-04T19:10:00",
    deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
  },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("active")

  // In a real app, this would connect to your WebSocket server
//   const { status, subscribe } = useWebSocket("wss://echo.websocket.org")

//   useEffect(() => {
//     // Subscribe to order updates
//     const unsubscribe = subscribe("order_update", (data) => {
//       toast({
//         title: "Order Update",
//         description: `Order ${data.orderId}: ${data.status}`,
//       })

//       // In a real app, you would update the order status here
//     })

//     return () => {
//       unsubscribe()
//     }
//   }, [subscribe, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "preparing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Preparing
          </Badge>
        )
      case "on_the_way":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            On the way
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Package className="h-5 w-5 text-blue-600" />
      case "on_the_way":
        return <Bike className="h-5 w-5 text-amber-600" />
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <ShoppingBag className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const calculateProgress = (order: any) => {
    const completedSteps = order.trackingSteps.filter((step: any) => step.completed).length
    return (completedSteps / order.trackingSteps.length) * 100
  }

  const renderActiveOrders = () => {
    if (activeOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No active orders</h3>
          <p className="text-muted-foreground mb-4">You don't have any active orders at the moment.</p>
          <Button asChild>
            <Link href="/">Order Now</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {activeOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={order.restaurantImage || "/placeholder.svg"}
                        alt={order.restaurantName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{order.restaurantName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">{order.id}</span>
                        <span className="mr-2">•</span>
                        <span>{formatDate(order.orderTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Support</DropdownMenuItem>
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Order Progress</span>
                    <span className="font-medium">{Math.round(calculateProgress(order))}%</span>
                  </div>
                  <Progress value={calculateProgress(order)} className="h-2" />
                </div>

                <div className="mt-3 space-y-1">
                  {order.trackingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border ${index === order.trackingSteps.findIndex((s) => !s.completed) ? "border-primary" : "border-muted"}`}
                        />
                      )}
                      <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>{step.title}</span>
                      {step.time && <span className="text-muted-foreground ml-auto">{step.time}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {order.status === "on_the_way" && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={order.driver.photo || "/placeholder.svg"}
                        alt={order.driver.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{order.driver.name}</h4>
                      <p className="text-sm text-muted-foreground">{order.driver.vehicleNumber}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Estimated Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(order.estimatedDelivery)} ({formatDate(order.estimatedDelivery)})
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <h4 className="font-medium">Order Summary</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>Rp {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>Rp {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderPastOrders = () => {
    if (pastOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No order history</h3>
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link href="/">Order Now</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {pastOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={order.restaurantImage || "/placeholder.svg"}
                        alt={order.restaurantName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{order.restaurantName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">{order.id}</span>
                        <span className="mr-2">•</span>
                        <span>{formatDate(order.orderTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(order.status)}</div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Order Summary</h4>
                    <span className="text-sm text-muted-foreground">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                    </span>
                  </div>

                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>Rp {item.price.toLocaleString()}</span>
                    </div>
                  ))}

                  {order.items.length > 2 && (
                    <div className="text-sm text-muted-foreground">+{order.items.length - 2} more items</div>
                  )}

                  <div className="flex justify-between font-medium mt-2">
                    <span>Total</span>
                    <span>Rp {order.total.toLocaleString()}</span>
                  </div>
                </div>

                {order.status === "cancelled" && (
                  <div className="mt-3 p-2 bg-red-50 text-red-600 rounded-md text-sm">
                    <span className="font-medium">Cancelled:</span> {order.cancelReason}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/restaurant/${order.id.split("-")[1]}`}>View Restaurant</Link>
                  </Button>
                  {order.status === "delivered" && (
                    <Button className="flex-1">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Order Again
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="w-full rounded-none bg-transparent p-0">
            <TabsTrigger
              value="active"
              className="flex-1 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="active" className="mt-0">
            {renderActiveOrders()}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {renderPastOrders()}
          </TabsContent>
        </div>
      </Tabs>

      <BottomNavigation />
    </div>
  )
}

