"use client"

import { useEffect, useRef, useState } from "react"
import { LocationSelector } from "@/components/location-selector"
import { BottomNavigation } from "@/components/bottom-navigation"
import { RestaurantCard } from "@/components/restaurant-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_FOTOS, getImageUrl } from "@/services/api"
import { validateToken } from "@/services/authService"

// Interface for restaurant data from API
interface RestaurantData {
  id: string
  name: string
  foto: string
  rating: number
  estDel: string
  categoryPenjual: string
  recomended: boolean
}

// Interface for API response
interface ApiResponse {
  content: RestaurantData[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

// Categories for the food categories section
const foodCategories = [
  { id: "indonesian", name: "Indonesian", icon: "🍚" },
  { id: "japanese", name: "Japanese", icon: "🍣" },
  { id: "fast-food", name: "Fast Food", icon: "🍔" },
  { id: "chinese", name: "Chinese", icon: "🥡" },
  { id: "italian", name: "Italian", icon: "🍕" },
  { id: "dessert", name: "Dessert", icon: "🍰" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "healthy", name: "Healthy", icon: "🥗" },
]


export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [allRestaurants, setAllRestaurants] = useState<RestaurantData[]>([])
  const [recommendedRestaurants, setRecommendedRestaurants] = useState<RestaurantData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  
  // Function to fetch restaurants
  const fetchRestaurants = async (pageNum: number) => {
    if (!hasMore || loading) return

    setLoading(true)
    try {
      // Replace with your actual API endpoint
      await validateToken()
      const response = await fetch(`/api/restaurants?page=${pageNum}&size=10`)
      const data: ApiResponse = await response.json()
      if (data.content.length === 0) {
        setHasMore(false)
      } else {
        setAllRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r.id))
          const newRestaurants = data.content.filter((r) => !existingIds.has(r.id))
          return [...prev, ...newRestaurants]
        })
        
        setRecommendedRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r.id))
          const newRecommended = data.content
            .filter((r) => r.recomended && !existingIds.has(r.id))
          return [...prev, ...newRecommended]
        })
        
        setPage(pageNum + 1)
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRestaurants(0)
  }, [])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchRestaurants(page)
        }
      },
      { threshold: 1.0 },
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [page, hasMore, loading])

  // Map API data to RestaurantCard props
  const mapRestaurantData = (restaurant: RestaurantData) => ({
    id: restaurant.id,
    name: restaurant.name,
    image: getImageUrl(restaurant.foto), // Handle relative paths
    rating: restaurant.rating,
    deliveryTime: restaurant.estDel,
    categories: [restaurant.categoryPenjual.toLowerCase()],
    priceRange: "$$", // Default price range as it's not in the API
    isRecommended: restaurant.recomended,
  })

  return (
    <main className="pb-20 overflow-x-hidden">
      {/* Location Selector */}
      <LocationSelector />

      {/* Search Bar */}
      <div className="px-4 py-3 flex items-center">
        <Button
          variant="outline"
          className="flex-1 justify-start text-muted-foreground mr-2 max-w-[calc(100%)]"
          asChild
        >
          <Link href="/pembeli/search">
            <Search className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Search for restaurants or dishes</span>
          </Link>
        </Button>
      </div>

      {/* Food Categories */}
      <div className="px-4 py-3">
        <h2 className="font-bold text-lg mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-3 max-w-full">
          {foodCategories.map((category) => (
            <Link key={category.id} href={`/pembeli/category/${category.id}`}>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-1 max-w-full">
                  {category.icon}
                </div>
                <span className="text-xs text-center truncate w-full">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs for All and Recommended */}
      <div className="px-4 py-3 max-w-full">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Restaurants</h2>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {allRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {allRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} {...mapRestaurantData(restaurant)} />
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-8 text-muted-foreground">No restaurants found</div>
            ) : null}
          </TabsContent>

          <TabsContent value="recommended" className="mt-0">
            {recommendedRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {recommendedRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} {...mapRestaurantData(restaurant)} />
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-8 text-muted-foreground">No recommended restaurants found</div>
            ) : null}
          </TabsContent>
        </Tabs>

        {/* Loading indicator */}
        <div ref={loaderRef} className="py-4 flex justify-center">
          {loading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading more restaurants...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </main>
  )
}
