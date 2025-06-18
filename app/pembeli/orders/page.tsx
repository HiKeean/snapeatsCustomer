"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { orderService, type OrderDtoPembeli, type PageableResponse } from "@/services/order-service"

import {
  MoreVertical,
  ShoppingBag,
  CheckCircle2,
  Bike,
  Package,
  AlertCircle,
  RotateCw,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [allOrders, setAllOrders] = useState<OrderDtoPembeli[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalElements, setTotalElements] = useState(0)

  // Filter orders based on active tab
  const activeOrders = allOrders.filter((order) => {
    const status = mapStatus(order.statusTransaksi)
    return status === "preparing" || status === "on_the_way"
  })

  const pastOrders = allOrders.filter((order) => {
    const status = mapStatus(order.statusTransaksi)
    return status === "delivered" || status === "cancelled"
  })

  // Load orders with pagination
  const loadOrders = useCallback(async (page = 0, append = false) => {
    try {
      if (page === 0) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      const response: PageableResponse<OrderDtoPembeli> = await orderService.getAllOrders(page, 10)

      if (append) {
        setAllOrders((prev) => [...prev, ...response.content])
      } else {
        setAllOrders(response.content)
      }

      setCurrentPage(response.number)
      setHasMore(!response.last)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Failed to load orders:", error)
      setError("Failed to load orders")
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadOrders(0, false)
  }, [loadOrders])

  // Load more orders
  const loadMoreOrders = () => {
    if (hasMore && !isLoadingMore) {
      loadOrders(currentPage + 1, true)
    }
  }

  // Refresh orders
  const refreshOrders = () => {
    setCurrentPage(0)
    loadOrders(0, false)
  }

  // Map API status to display status
  const mapStatus = (statusTransaksi: string) => {
    switch (statusTransaksi.toLowerCase()) {
      case "pending":
      case "confirmed":
        return "preparing"
      case "preparing":
        return "preparing"
      case "on_the_way":
      case "picked_up":
        return "on_the_way"
      case "delivered":
      case "completed":
        return "delivered"
      case "cancelled":
        return "cancelled"
      default:
        return "preparing"
    }
  }

  const getStatusBadge = (status: string) => {
    const mappedStatus = mapStatus(status)
    switch (mappedStatus) {
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
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    const mappedStatus = mapStatus(status)
    switch (mappedStatus) {
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
      hour12: false,
    })
  }

  // Generate tracking steps based on status
  const generateTrackingSteps = (status: string) => {
    const mappedStatus = mapStatus(status)
    const steps = [
      { id: 1, title: "Order Confirmed", completed: false, time: "" },
      { id: 2, title: "Preparing Food", completed: false, time: "" },
      { id: 3, title: "On The Way", completed: false, time: "" },
      { id: 4, title: "Delivered", completed: false, time: "" },
    ]

    switch (mappedStatus) {
      case "preparing":
        steps[0].completed = true
        steps[1].completed = true
        break
      case "on_the_way":
        steps[0].completed = true
        steps[1].completed = true
        steps[2].completed = true
        break
      case "delivered":
        steps.forEach((step) => (step.completed = true))
        break
    }

    return steps
  }

  const calculateProgress = (status: string) => {
    const steps = generateTrackingSteps(status)
    const completedSteps = steps.filter((step) => step.completed).length
    return (completedSteps / steps.length) * 100
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const success = await orderService.cancelOrder(orderId, "Cancelled by user")
      if (success) {
        toast.success("Order cancelled successfully")
        // Refresh orders
        refreshOrders()
      } else {
        toast.error("Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Failed to cancel order")
    }
  }

  const renderOrderCard = (order: OrderDtoPembeli, showTracking = false) => {
    const trackingSteps = generateTrackingSteps(order.statusTransaksi)
    const mappedStatus = mapStatus(order.statusTransaksi)

    return (
      <Card key={order.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{order.penjual.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-2">{order.id}</span>
                    <span className="mr-2">•</span>
                    <span>{formatDate(order.orderTime)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.statusTransaksi)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Contact Support</DropdownMenuItem>
                    {mappedStatus !== "cancelled" && mappedStatus !== "delivered" && (
                      <DropdownMenuItem className="text-red-600" onClick={() => handleCancelOrder(order.id)}>
                        Cancel Order
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {showTracking && (mappedStatus === "preparing" || mappedStatus === "on_the_way") && (
              <>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Order Progress</span>
                    <span className="font-medium">{Math.round(calculateProgress(order.statusTransaksi))}%</span>
                  </div>
                  <Progress value={calculateProgress(order.statusTransaksi)} className="h-2" />
                </div>

                <div className="mt-3 space-y-1">
                  {trackingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border ${index === trackingSteps.findIndex((s) => !s.completed) ? "border-primary" : "border-muted"}`}
                        />
                      )}
                      <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>{step.title}</span>
                      {step.time && <span className="text-muted-foreground ml-auto">{step.time}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {showTracking && mappedStatus === "on_the_way" && order.driver && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                  <div className="w-full h-full flex items-center justify-center">
                    <Bike className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{order.driver.name}</h4>
                  <p className="text-sm text-muted-foreground">{order.driver.vehicleNumber}</p>
                </div>
                <Button variant="outline" size="sm">
                  <a href={`tel:${order.driver.noHp}`}>Contact</a>
                </Button>
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">Seller Contact</h4>
                <p className="text-sm text-muted-foreground">{order.penjual.noHp}</p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Order Summary</h4>
                <span className="text-sm text-muted-foreground">
                  {order.detailItems.reduce((acc:any, item:any) => acc + item.quantity, 0)} items
                </span>
              </div>

              {order.detailItems.slice(0, 2).map((item:any, index:any) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>Rp {item.price.toLocaleString()}</span>
                </div>
              ))}

              {order.detailItems.length > 2 && (
                <div className="text-sm text-muted-foreground">+{order.detailItems.length - 2} more items</div>
              )}

              <div className="flex justify-between font-medium mt-2">
                <span>Total</span>
                <span>Rp {order.totalHarga.toLocaleString()}</span>
              </div>
            </div>

            {!showTracking && (
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  Contact Seller
                </Button>
                {mappedStatus === "delivered" && (
                  <Button className="flex-1">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Order Again
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderActiveOrders = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
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

    return <div className="space-y-4">{activeOrders.map((order) => renderOrderCard(order, true))}</div>
  }

  const renderPastOrders = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
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
        {pastOrders.map((order) => renderOrderCard(order, false))}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={loadMoreOrders} disabled={isLoadingMore} className="w-full">
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                "Load More Orders"
              )}
            </Button>
          </div>
        )}

        {/* Total count */}
        <div className="text-center text-sm text-muted-foreground py-2">
          Showing {allOrders.length} of {totalElements} orders
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <Button variant="ghost" size="icon" onClick={refreshOrders} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshOrders} className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      )}

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
