"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight, Clock, User, CreditCard } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

// Sample data for orders
const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    items: [
      { name: "Beef Rendang", quantity: 1 },
      { name: "Ayam Pop", quantity: 2 },
    ],
    total: 115000,
    status: "preparing",
    time: "2023-03-08T14:30:00",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    payment: "GoPay",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    items: [
      { name: "Nasi Padang Komplit", quantity: 1 },
      { name: "Es Teh Manis", quantity: 2 },
    ],
    total: 75000,
    status: "ready",
    time: "2023-03-08T14:15:00",
    address: "Jl. Gatot Subroto No. 45, Jakarta Selatan",
    payment: "OVO",
  },
  {
    id: "ORD-003",
    customer: "Robert Johnson",
    items: [
      { name: "Sate Padang", quantity: 2 },
      { name: "Gulai Ikan", quantity: 1 },
    ],
    total: 95000,
    status: "completed",
    time: "2023-03-08T13:45:00",
    address: "Jl. Kuningan No. 78, Jakarta Selatan",
    payment: "Cash",
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    items: [
      { name: "Ayam Bakar", quantity: 1 },
      { name: "Nasi Putih", quantity: 2 },
      { name: "Es Jeruk", quantity: 2 },
    ],
    total: 105000,
    status: "completed",
    time: "2023-03-08T13:30:00",
    address: "Jl. Thamrin No. 56, Jakarta Pusat",
    payment: "Bank Transfer",
  },
  {
    id: "ORD-005",
    customer: "Michael Wilson",
    items: [
      { name: "Rendang", quantity: 2 },
      { name: "Nasi Putih", quantity: 2 },
      { name: "Es Teh Manis", quantity: 2 },
    ],
    total: 130000,
    status: "cancelled",
    time: "2023-03-08T13:15:00",
    address: "Jl. Kebon Sirih No. 34, Jakarta Pusat",
    payment: "GoPay",
  },
  {
    id: "ORD-006",
    customer: "Sarah Brown",
    items: [
      { name: "Ayam Pop", quantity: 1 },
      { name: "Gulai Ikan", quantity: 1 },
      { name: "Es Jeruk", quantity: 1 },
    ],
    total: 85000,
    status: "completed",
    time: "2023-03-08T12:45:00",
    address: "Jl. Rasuna Said No. 67, Jakarta Selatan",
    payment: "OVO",
  },
  {
    id: "ORD-007",
    customer: "David Lee",
    items: [
      { name: "Nasi Padang Komplit", quantity: 2 },
      { name: "Sate Padang", quantity: 1 },
    ],
    total: 120000,
    status: "preparing",
    time: "2023-03-08T12:30:00",
    address: "Jl. Menteng Raya No. 21, Jakarta Pusat",
    payment: "Cash",
  },
  {
    id: "ORD-008",
    customer: "Lisa Taylor",
    items: [
      { name: "Gulai Ikan", quantity: 1 },
      { name: "Ayam Pop", quantity: 1 },
      { name: "Es Teh Manis", quantity: 2 },
    ],
    total: 95000,
    status: "ready",
    time: "2023-03-08T12:15:00",
    address: "Jl. Kemang Raya No. 89, Jakarta Selatan",
    payment: "Bank Transfer",
  },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useMobile()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-ID", {
      day: "numeric",
      month: "short",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "preparing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Preparing
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            Ready for pickup
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Completed
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

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (activeTab !== "all" && order.status !== activeTab) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query))
      )
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage your customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Date (Newest first)</DropdownMenuItem>
              <DropdownMenuItem>Date (Oldest first)</DropdownMenuItem>
              <DropdownMenuItem>Amount (High to Low)</DropdownMenuItem>
              <DropdownMenuItem>Amount (Low to High)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full grid grid-cols-5 min-w-[500px]">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={activeTab} className="mt-4">
          {isMobile ? (
            // Mobile card view
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{order.id}</div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {formatShortDate(order.time)} {formatTime(order.time)}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.customer}</span>
                      </div>

                      <div className="text-sm space-y-1 mb-3">
                        <div className="font-medium">Items:</div>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.payment}</span>
                        </div>
                        <div className="font-medium">Rp {order.total.toLocaleString()}</div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex justify-between gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Details
                        </Button>
                        {order.status === "preparing" && (
                          <Button size="sm" className="flex-1">
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button size="sm" className="flex-1">
                            Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders found.</p>
                </div>
              )}
            </div>
          ) : (
            // Desktop table view
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="max-w-[200px] truncate">
                                {order.items.map((item, index) => (
                                  <span key={index}>
                                    {item.quantity}x {item.name}
                                    {index < order.items.length - 1 ? ", " : ""}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>Rp {order.total.toLocaleString()}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(order.time)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="hidden md:table-cell">{order.payment}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  {order.status === "preparing" && <DropdownMenuItem>Mark as Ready</DropdownMenuItem>}
                                  {order.status === "ready" && <DropdownMenuItem>Mark as Completed</DropdownMenuItem>}
                                  {(order.status === "preparing" || order.status === "ready") && (
                                    <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
