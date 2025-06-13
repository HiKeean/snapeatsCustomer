"use client"

import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, ArrowLeft, X, TrendingUp, Filter, Star } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { searchService } from "@/services/foodService"
import { foodResponseSearch, ResponseSearchResotran, restoranResponseSearch } from "@/services/dto/restaurant"
import { API_FOTOS, formatRupiah, getImageUrl } from "@/services/api"
import Swal from "sweetalert2"
import { error } from "console"

// Interfaces for API data
interface Restaurant {
  id: string
  name: string
  image: string
  rating: number
  deliveryTime: string
  categories: string[]
  priceRange: string
}

interface Dish {
  id: string
  name: string
  restaurant: string
  restaurantId: string
  image: string
  price: number
  rating: number
}

// Sample data for popular searches
const popularSearches = ["Nasi Goreng", "Pizza", "Burger", "Sushi", "Fried Chicken", "Bubble Tea", "Bakso", "Martabak"]

const cuisineCategories = [
  { id: 1, name: "Indonesian", count: 156 },
  { id: 2, name: "Japanese", count: 87 },
  { id: 3, name: "Fast Food", count: 112 },
  { id: 4, name: "Chinese", count: 94 },
  { id: 5, name: "Italian", count: 63 },
  { id: 6, name: "Korean", count: 42 },
  { id: 7, name: "Thai", count: 38 },
  { id: 8, name: "Indian", count: 29 },
]

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<restoranResponseSearch[]>([])
  const [dishes, setDishes] = useState<foodResponseSearch[]>([])

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Effect for handling search with debounced query
  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 0) {
      setShowResults(true)
      fetchSearchResults(debouncedSearchQuery)
    } else {
      setShowResults(false)
      setRestaurants([])
      setDishes([])
    }
  }, [debouncedSearchQuery])

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      // In a real app, you would call your API here
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Simulate API response with sample data
      // In a real app, replace this with actual API calls
      // const restaurantsResponse = await fetch(`/api/search/restaurants?q=${encodeURIComponent(query)}`)
      // const dishesResponse = await fetch(`/api/search/dishes?q=${encodeURIComponent(query)}`)
      const temp = localStorage.getItem("userLocation")
      if(temp === null){
        router.push("/")
        return
      }
      const location = JSON.parse(temp);
      const lat = location.latitude;
      const lon = location.longitude;
      const res: ResponseSearchResotran | undefined = await searchService(query, lat, lon);

      if (res === undefined) {
        // Tangani kondisi jika res undefined
        Swal.fire('Error', 'Data tidak ditemukan', 'error')
      } else {
        // Pastikan setRestaurants hanya dipanggil jika res tidak undefined
        setRestaurants(res.restoran || []);  // Menggunakan default array jika res.food undefined
        setDishes(res.food || []);
      }

    } catch (error) {
      console.error("Error fetching search results:", error)
      Swal.fire('Error', "Error Internal Server", 'question')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    setRestaurants([])
    setDishes([])
  }


  return (
    <div className="pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-2 p-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search for restaurants or dishes"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Content */}
      <div className="p-4">
        {!showResults ? (
          <>
            {/* Popular Searches */}
            <div className="mb-6">
              <h2 className="font-semibold text-lg flex items-center mb-3">
                <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                Popular Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => handleSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cuisine Categories */}
            <div>
              <h2 className="font-semibold text-lg mb-3">Browse by Cuisine</h2>
              <div className="grid grid-cols-2 gap-3">
                {cuisineCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-accent"
                    onClick={() => handleSearch(category.name)}
                  >
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} restaurants</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Search Results */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Searching...</span>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="restaurants" className="flex-1">
                    Restaurants
                  </TabsTrigger>
                  <TabsTrigger value="dishes" className="flex-1">
                    Dishes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0 space-y-6">
                  {/* Restaurants Section */}
                  {restaurants.length > 0 && (
                    <div>
                      <h2 className="font-semibold text-lg mb-3">Restaurants</h2>
                      <div className="space-y-4">
                        {restaurants.slice(0, 3).map((restaurant) => (
                          <Link href={`/pembeli/restaurant/${restaurant.id}`} key={restaurant.id}>
                            <div className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                <Image
                                  src={getImageUrl(restaurant.fotoToko) || "/placeholder.svg"}
                                  alt={restaurant.name_toko}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{restaurant.name_toko}</h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                  <span className="mr-2">{restaurant.rating_toko}</span>
                                  <span className="mr-2">•</span>
                                  <span>{restaurant.estDel}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {restaurant.categoryPenjual}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}

                        {restaurants.length > 3 && (
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="#" onClick={() => setActiveTab("restaurants")}>
                              View all {restaurants.length} restaurants
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dishes Section */}
                  {dishes.length > 0 && (
                    <div>
                      <h2 className="font-semibold text-lg mb-3">Dishes</h2>
                      <div className="space-y-4">
                        {dishes.slice(0, 3).map((dish) => (
                          <Link href={`/pembeli/restaurant/${dish.resto.id}`} key={dish.id}>
                            <div key={dish.id} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                <Image
                                  src={getImageUrl(dish.pict) || "/placeholder.svg"}
                                  alt={dish.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{dish.name}</h3>
                                <p className="text-sm text-muted-foreground">{dish.resto.name_toko}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-medium text-sm">{formatRupiah(dish.price)}</span>
                                  <div className="flex items-center text-sm">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                    <span>{dish.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                          
                        ))}

                        {dishes.length > 3 && (
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="#" onClick={() => setActiveTab("dishes")}>
                              View all {dishes.length} dishes
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {restaurants.length === 0 && dishes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No results found for "{debouncedSearchQuery}"</p>
                      <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="restaurants" className="mt-0">
                  <div className="space-y-4">
                    {restaurants.length > 0 ? (
                      restaurants.map((restaurant) => (
                        <Link href={`/pembeli/restaurant/${restaurant.id}`} key={restaurant.id}>
                          <div className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden">
                              <Image
                                src={getImageUrl(restaurant.fotoToko) || "/placeholder.svg"}
                                alt={restaurant.name_toko}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{restaurant.name_toko}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                <span className="mr-2">{restaurant.rating_toko}</span>
                                <span className="mr-2">•</span>
                                <span>{restaurant.estDel}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {restaurant.categoryPenjual}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No restaurants found for "{debouncedSearchQuery}"</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="dishes" className="mt-0">
                  <div className="space-y-4">
                    {dishes.length > 0 ? (
                      dishes.map((dish) => (
                        <div key={dish.id} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={getImageUrl(dish.pict) || "/placeholder.svg"}
                              alt={dish.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{dish.name}</h3>
                            <p className="text-sm text-muted-foreground">{dish.resto.name_toko}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-medium text-sm">{formatRupiah(dish.price)}</span>
                              <div className="flex items-center text-sm">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                <span>{dish.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No dishes found for "{debouncedSearchQuery}"</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
