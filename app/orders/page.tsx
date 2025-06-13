"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import WebSocketService from "@/lib/websocket-service"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
// import { useToast } from "@/hooks/use-toast"
import OrderService, { type Order, type OrderStatus } from "@/services/OrderService"
import {
  MapPin,
  MoreVertical,
  ShoppingBag,
  Bike,
  Package,
  AlertCircle,
  RotateCw,
  Phone,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Swal from "sweetalert2"

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [pastOrders, setPastOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  // const { toast } = useToast()

  const orderService = OrderService.getInstance()

  // WebSocket connection
  useEffect(() => {
    const wsService = WebSocketService.getInstance()

    const connectWebSocket = async () => {
      setWsStatus("connecting")
      try {
        await wsService.connect()
        setWsStatus("connected")

        // toast({
        //   title: "Connected",
        //   description: "Real-time order updates enabled",
        // })

        // Subscribe to all order-related events
        const subscriptions = [
          wsService.subscribe("order_status_update", handleOrderStatusUpdate),
          wsService.subscribe("driver_assigned", handleDriverAssigned),
          wsService.subscribe("order_cancelled", handleOrderCancelled),
          wsService.subscribe("order_completed", handleOrderCompleted),
        ]

        // Store subscriptions for cleanup
        return () => {
          subscriptions.forEach(async (sub) => (await sub).unsubscribe())
        }
      } catch (error) {
        console.error("WebSocket connection failed:", error)
        setWsStatus("disconnected")
        // toast({
        //   title: "Connection Failed",
        //   description: "Real-time updates unavailable. Retrying...",
        //   variant: "destructive",
        // })
      }
    }

    const cleanup = connectWebSocket()

    return () => {
      if (cleanup) cleanup.then((fn) => fn && fn())
    }
  }, [])

  // Load orders data
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const [active, past] = await Promise.all([orderService.getActiveOrders(), orderService.getPastOrders()])

      setActiveOrders(active)
      setPastOrders(past)
    } catch (error) {
      console.error("Error loading orders:", error)
      Swal.fire(
        "Error",
        "Failed to load orders. Please try again.",
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOrderStatusUpdate = (data: any) => {
    const { orderId, status, estimatedDelivery } = data

    // Update active orders
    setActiveOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: status as OrderStatus, estimatedDelivery } : order,
      ),
    )

    // Show toast notification
    const statusDisplay = orderService.getStatusDisplay(status)
    Swal.fire(
      "Order Update",
      `Order ${orderId}: ${statusDisplay.label}`,
      "success"
    )

    // If order is completed, move to past orders
    if (status === "DITERIMA" || status === "DICANCEL") {
      setTimeout(() => {
        loadOrders() // Refresh to move completed orders
      }, 1000)
    }
  }

  const handleDriverAssigned = (data: any) => {
    const { orderId, driver } = data

    setActiveOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, driver, status: "DRIVERASSIGNED" as OrderStatus } : order,
      ),
    )

    Swal.fire(
      "Driver Assigned",
      `${driver.name} will deliver your order`,
      'success'
    )
  }

  const handleCancelOrder = async (orderId: string) => {
    const success = await orderService.cancelOrder(orderId, "Customer cancelled")

    if (success) {
      Swal.fire(
        "Order Cancelled",
        "Your order has been cancelled successfully", 'success'
      )
      loadOrders()
    } else {
      Swal.fire(
        "Error",
        "Failed to cancel order. Please try again.",
        "error"
      )
    }
  }

  const handleReorder = async (orderId: string) => {
    const newOrderId = await orderService.reorder(orderId)

    if (newOrderId) {
      // toast({
      //   title: "Order Placed",
      //   description: `New order ${newOrderId} has been placed`,
      // })
      Swal.fire("Order Placed", `New order ${newOrderId} has been placed`, 'success')
      loadOrders()
    } else {
      // toast({
      //   title: "Error",
      //   description: "Failed to place order. Please try again.",
      //   variant: "destructive",
      // })
      Swal.fire(
        "Error", "Failed to place order. Please try again.", 'error'
      )
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusDisplay = orderService.getStatusDisplay(status)
    return (
      <Badge variant="outline" className={`${statusDisplay.color} ${statusDisplay.bgColor}`}>
        {statusDisplay.label}
      </Badge>
    )
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "BELUMBAYAR":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "DIPROSES":
        return <Package className="h-5 w-5 text-blue-600" />
      case "MENCARI":
        return <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />
      case "DRIVERASSIGNED":
        return <Bike className="h-5 w-5 text-green-600" />
      case "DIKIRIM":
        return <Bike className="h-5 w-5 text-indigo-600" />
      case "DITERIMA":
        return <Package className="h-5 w-5 text-green-600" />
      case "DICANCEL":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <ShoppingBag className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleOrderCancelled = (data: any) => {
    const { orderId, reason } = data

    setActiveOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "DICANCEL" as OrderStatus, cancelReason: reason } : order,
      ),
    )

    // toast({
    //   title: "Order Cancelled",
    //   description: `Order ${orderId} has been cancelled`,
    //   variant: "destructive",
    // })

    // Move to past orders after delay
    setTimeout(() => loadOrders(), 1000)
  }

  const handleOrderCompleted = (data: any) => {
    const { orderId } = data

    setActiveOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: "DITERIMA" as OrderStatus } : order)),
    )

    // toast({
    //   title: "Order Completed",
    //   description: `Order ${orderId} has been delivered successfully!`,
    // })

    // Move to past orders after delay
    setTimeout(() => loadOrders(), 2000)
  }

  const renderActiveOrders = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

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
                        {orderService.canTrackOrder(order.status) && (
                          <DropdownMenuItem asChild>
                            <Link href={`/pembeli/tracking/${order.id}`}>Track Order</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Contact Support</DropdownMenuItem>
                        {orderService.canCancelOrder(order.status) && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleCancelOrder(order.id)}>
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Order Progress</span>
                    {order.status !== "DICANCEL" ? (
                      <span className="font-medium">
                        Step {orderService.getActiveStep(order.status)} of {orderService.getTotalSteps()}
                      </span>
                    ) : (
                      <span className="font-medium text-red-600">Cancelled</span>
                    )}
                  </div>
                  <Progress value={orderService.getStatusProgress(order.status)} className="h-2" />
                </div>

                {order.status !== "DICANCEL" && (
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <div
                      className={`flex flex-col items-center ${["BELUMBAYAR", "DIPROSES", "MENCARI", "DRIVERASSIGNED", "DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "text-primary font-medium" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${["BELUMBAYAR", "DIPROSES", "MENCARI", "DRIVERASSIGNED", "DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "bg-primary" : "bg-muted"}`}
                      ></div>
                      <span>Order</span>
                    </div>
                    <div
                      className={`flex flex-col items-center ${["DIPROSES", "MENCARI", "DRIVERASSIGNED", "DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "text-primary font-medium" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${["DIPROSES", "MENCARI", "DRIVERASSIGNED", "DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "bg-primary" : "bg-muted"}`}
                      ></div>
                      <span>Prepare</span>
                    </div>
                    <div
                      className={`flex flex-col items-center ${["MENCARI", "DRIVERASSIGNED", "DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "text-primary font-medium" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${["MENCARI", "DRIVERASSIGNED", "DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "bg-primary" : "bg-muted"}`}
                      ></div>
                      <span>Driver</span>
                    </div>
                    <div
                      className={`flex flex-col items-center ${["DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "text-primary font-medium" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${["DIKIRIM", "DITERIMA"].indexOf(order.status) >= 0 ? "bg-primary" : "bg-muted"}`}
                      ></div>
                      <span>Delivery</span>
                    </div>
                    <div
                      className={`flex flex-col items-center ${order.status === "DITERIMA" ? "text-primary font-medium" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${order.status === "DITERIMA" ? "bg-primary" : "bg-muted"}`}
                      ></div>
                      <span>Complete</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium">{orderService.getStatusDisplay(order.status).label}</span>
                </div>
              </div>

              {order.driver && (order.status === "DRIVERASSIGNED" || order.status === "DIKIRIM") && (
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
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${order.driver.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <h4 className="font-medium">Order Summary</h4>
                  {order.items.map((item:any, index:any) => (
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
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

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
                      {order.items.reduce((acc:any, item:any) => acc + item.quantity, 0)} items
                    </span>
                  </div>

                  {order.items.slice(0, 2).map((item:any, index:any) => (
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

                {order.status === "DICANCEL" && order.cancelReason && (
                  <div className="mt-3 p-2 bg-red-50 text-red-600 rounded-md text-sm">
                    <span className="font-medium">Cancelled:</span> {order.cancelReason}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/restaurant/${order.restaurantId}`}>View Restaurant</Link>
                  </Button>
                  {order.status === "DITERIMA" && (
                    <Button className="flex-1" onClick={() => handleReorder(order.id)}>
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <div className="flex items-center gap-2">
              {wsStatus === "connected" && <Wifi className="h-5 w-5 text-green-600" />}
              {wsStatus === "disconnected" && <WifiOff className="h-5 w-5 text-red-600" />}
              {wsStatus === "connecting" && <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />}
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="w-full rounded-none bg-transparent p-0">
            <TabsTrigger
              value="active"
              className="flex-1 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              History ({pastOrders.length})
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
