"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")
  const [chartType, setChartType] = useState("sales")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">View your restaurant performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Select defaultValue={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select chart" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        <TabsContent value={timeRange} className="space-y-4">
          {/* Chart Card */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>
                {chartType === "sales"
                  ? "Sales Overview"
                  : chartType === "orders"
                    ? "Orders Overview"
                    : "Customer Overview"}
              </CardTitle>
              <CardDescription>
                {timeRange === "day"
                  ? "Today's"
                  : timeRange === "week"
                    ? "This week's"
                    : timeRange === "month"
                      ? "This month's"
                      : "This year's"}{" "}
                {chartType}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full rounded-md bg-pink-50 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-pink-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Showing {chartType} data for the selected {timeRange}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 4,250,000</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">8.2%</span>
                  <span className="ml-1">from last {timeRange}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">12.5%</span>
                  <span className="ml-1">from last {timeRange}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 27,243</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">3.1%</span>
                  <span className="ml-1">from last {timeRange}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">5.7%</span>
                  <span className="ml-1">from last {timeRange}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Your best performing menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Beef Rendang", orders: 42, revenue: 1890000 },
                    { name: "Ayam Pop", orders: 38, revenue: 1330000 },
                    { name: "Sate Padang", orders: 35, revenue: 1225000 },
                    { name: "Gulai Ikan", orders: 28, revenue: 1120000 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                      </div>
                      <div className="font-medium">Rp {item.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Busiest times for your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "12:00 - 13:00", orders: 32, percentage: 20 },
                    { time: "18:00 - 19:00", orders: 28, percentage: 18 },
                    { time: "19:00 - 20:00", orders: 25, percentage: 16 },
                    { time: "13:00 - 14:00", orders: 22, percentage: 14 },
                  ].map((slot, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-sm">{slot.orders} orders</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-pink-600" style={{ width: `${slot.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline">Export Report</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
