"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Users, Star, DollarSign, TrendingUp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample data for dashboard
const dashboardData = {
  stats: {
    totalOrders: 156,
    totalOrdersChange: 12.5,
    totalSales: 4250000,
    totalSalesChange: 8.2,
    totalCustomers: 89,
    totalCustomersChange: 5.7,
    averageRating: 4.7,
    averageRatingChange: 0.2,
  },
  recentOrders: [
    {
      id: "ORD-001",
      customer: "John Doe",
      items: [
        { name: "Beef Rendang", quantity: 1 },
        { name: "Ayam Pop", quantity: 2 },
      ],
      total: 115000,
      status: "preparing",
      time: "10 minutes ago",
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
      time: "25 minutes ago",
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
      time: "1 hour ago",
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
      time: "2 hours ago",
    },
  ],
  popularItems: [
    {
      name: "Beef Rendang",
      orders: 42,
      revenue: 1890000,
      rating: 4.9,
    },
    {
      name: "Ayam Pop",
      orders: 38,
      revenue: 1330000,
      rating: 4.8,
    },
    {
      name: "Sate Padang",
      orders: 35,
      revenue: 1225000,
      rating: 4.7,
    },
    {
      name: "Gulai Ikan",
      orders: 28,
      revenue: 1120000,
      rating: 4.6,
    },
  ],
}

export default function SellerDashboard() {
  const [timeRange, setTimeRange] = useState("today")

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

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dashboardData.stats.totalOrdersChange > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{dashboardData.stats.totalOrdersChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(dashboardData.stats.totalOrdersChange)}%</span>
                </>
              )}
              <span className="ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {dashboardData.stats.totalSales.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dashboardData.stats.totalSalesChange > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{dashboardData.stats.totalSalesChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(dashboardData.stats.totalSalesChange)}%</span>
                </>
              )}
              <span className="ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dashboardData.stats.totalCustomersChange > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{dashboardData.stats.totalCustomersChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(dashboardData.stats.totalCustomersChange)}%</span>
                </>
              )}
              <span className="ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.averageRating}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dashboardData.stats.averageRatingChange > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{dashboardData.stats.averageRatingChange}</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(dashboardData.stats.averageRatingChange)}</span>
                </>
              )}
              <span className="ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent orders */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {dashboardData.recentOrders.length} recent orders</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/seller/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-start justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">#{order.id}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.items.map((item, index) => (
                        <span key={index}>
                          {item.quantity}x {item.name}
                          {index < order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{order.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="font-medium">Rp {order.total.toLocaleString()}</div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular items */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Popular Items</CardTitle>
              <CardDescription>Your top selling menu items</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/seller/menu">View Menu</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.popularItems.map((item, index) => (
                <div key={index} className="flex items-start justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShoppingBag className="h-3 w-3" />
                      <span>{item.orders} orders</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">Rp {item.revenue.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Popular</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
