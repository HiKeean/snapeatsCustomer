"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Filter, Search, Loader2, MapPin } from "lucide-react"
import { RestaurantCard } from "@/components/restaurant-card"
// import { useToast } from "@/hooks/use-toast"

// Sample food categories with their IDs matching the ones in the home page
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

// Interface for location data
interface Location {
  name: string
  address: string
  latitude: number
  longitude: number
}

// Interface for restaurant data
interface Restaurant {
  id: string
  name: string
  image: string
  rating: number
  deliveryTime: string
  categories: string[]
  priceRange: string
  description: string
  distance: string
  // Add coordinates for distance calculation
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export default function CategoryPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
//   const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("distance") // Default to distance sorting
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)

  // Find the category from our list
  const category = foodCategories.find((cat) => cat.id === id)

  // Get user location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation))
    }
    setLocationLoading(false)
  }, [])

  // Fetch restaurants when user location is available
  useEffect(() => {
    if (!locationLoading) {
      fetchRestaurants()
    }
  }, [locationLoading, id])

  // Function to fetch restaurants with location data
  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      // Build query parameters including location if available
      let url = `/api/category/${id}`

      if (userLocation) {
        url += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch restaurants")
      }

      let data = await response.json()

      // If we have user location, calculate actual distances
      if (userLocation) {
        data = data.map((restaurant: Restaurant) => {
          // In a real app, this would be done on the backend
          // Here we're just using the distance string that's already in the data
          return restaurant
        })
      }

      setRestaurants(data)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    //   toast({
    //     title: "Error",
    //     description: "Failed to load restaurants. Please try again.",
    //     variant: "destructive",
    //   })
    } finally {
      setLoading(false)
    }
  }

  // Sort restaurants based on selected sort option
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortBy === "popular") return b.rating - a.rating
    if (sortBy === "price-low") {
      const priceA = a.priceRange.length
      const priceB = b.priceRange.length
      return priceA - priceB
    }
    if (sortBy === "price-high") {
      const priceA = a.priceRange.length
      const priceB = b.priceRange.length
      return priceB - priceA
    }
    if (sortBy === "distance") {
      const distA = Number.parseFloat(a.distance.split(" ")[0])
      const distB = Number.parseFloat(b.distance.split(" ")[0])
      return distA - distB
    }
    return 0
  })

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-2">Category not found</h1>
        <p className="mb-6 text-muted-foreground">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/pembeli">Back to Home</Link>
        </Button>
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
          <div className="flex items-center">
            <span className="text-2xl mr-2">{category.icon}</span>
            <h1 className="text-xl font-bold">{category.name} Restaurants</h1>
          </div>
        </div>
      </div>

      {/* Location Info */}
      {userLocation && (
        <div className="px-4 py-2 flex items-center text-sm text-muted-foreground border-b">
          <MapPin className="h-4 w-4 mr-1 text-primary" />
          <span className="truncate">Delivering to: {userLocation.name}</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="px-4 py-3 flex items-center">
        <Button
          variant="outline"
          className="flex-1 justify-start text-muted-foreground mr-2 max-w-[calc(100%-3.5rem)]"
          asChild
        >
          <Link href="/search">
            <Search className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Search {category.name} restaurants</span>
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="flex-shrink-0 w-10 h-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-2 flex overflow-x-auto gap-2 border-b">
        <Button
          variant={sortBy === "distance" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("distance")}
          className="whitespace-nowrap"
        >
          Nearest
        </Button>
        <Button
          variant={sortBy === "popular" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("popular")}
          className="whitespace-nowrap"
        >
          Most Popular
        </Button>
        <Button
          variant={sortBy === "price-low" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("price-low")}
          className="whitespace-nowrap"
        >
          Price: Low to High
        </Button>
        <Button
          variant={sortBy === "price-high" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("price-high")}
          className="whitespace-nowrap"
        >
          Price: High to Low
        </Button>
      </div>

      {/* Restaurant List */}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading {category.name} restaurants near you...</p>
          </div>
        ) : sortedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                image={restaurant.image}
                rating={restaurant.rating}
                deliveryTime={restaurant.deliveryTime}
                categories={restaurant.categories}
                priceRange={restaurant.priceRange}
                className="h-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No {category.name} restaurants found near you</p>
            <Button asChild className="mt-4">
              <Link href="/pembeli">Explore other categories</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
