"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, ArrowLeft, X, Clock, TrendingUp, Filter, Star } from "lucide-react"

// Sample data for search results
const restaurants = [
  {
    id: "1",
    name: "Warung Padang Sederhana",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.8,
    deliveryTime: "15-25 min",
    categories: ["Indonesian", "Padang"],
    priceRange: "$$",
  },
  {
    id: "2",
    name: "Sushi Tei",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.7,
    deliveryTime: "20-30 min",
    categories: ["Japanese", "Sushi"],
    priceRange: "$$$",
  },
  {
    id: "3",
    name: "Pizza Hut",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.5,
    deliveryTime: "25-35 min",
    categories: ["Italian", "Pizza"],
    priceRange: "$$",
  },
  {
    id: "4",
    name: "KFC",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.3,
    deliveryTime: "15-25 min",
    categories: ["Fast Food", "Chicken"],
    priceRange: "$",
  },
  {
    id: "5",
    name: "Burger King",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.2,
    deliveryTime: "20-30 min",
    categories: ["Fast Food", "Burger"],
    priceRange: "$",
  },
]

const dishes = [
  {
    id: "d1",
    name: "Beef Rendang",
    restaurant: "Warung Padang Sederhana",
    image: "/placeholder.svg?height=200&width=300",
    price: 45000,
    rating: 4.9,
  },
  {
    id: "d2",
    name: "Salmon Sushi",
    restaurant: "Sushi Tei",
    image: "/placeholder.svg?height=200&width=300",
    price: 55000,
    rating: 4.8,
  },
  {
    id: "d3",
    name: "Pepperoni Pizza",
    restaurant: "Pizza Hut",
    image: "/placeholder.svg?height=200&width=300",
    price: 89000,
    rating: 4.7,
  },
  {
    id: "d4",
    name: "Original Recipe Chicken",
    restaurant: "KFC",
    image: "/placeholder.svg?height=200&width=300",
    price: 40000,
    rating: 4.6,
  },
  {
    id: "d5",
    name: "Whopper Burger",
    restaurant: "Burger King",
    image: "/placeholder.svg?height=200&width=300",
    price: 50000,
    rating: 4.5,
  },
]

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
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  useEffect(() => {
    // Show results if search query is not empty
    if (searchQuery.trim().length > 0) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    // Save to recent searches if not already there
    if (query.trim() && !recentSearches.includes(query)) {
      const updatedSearches = [query, ...recentSearches.slice(0, 4)]
      setRecentSearches(updatedSearches)
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.restaurant.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    Recent Searches
                  </h2>
                  <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
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
            )}

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
                {filteredRestaurants.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-lg mb-3">Restaurants</h2>
                    <div className="space-y-4">
                      {filteredRestaurants.slice(0, 3).map((restaurant) => (
                        <Link href={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                          <div className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden">
                              <Image
                                src={restaurant.image || "/placeholder.svg"}
                                alt={restaurant.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{restaurant.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                <span className="mr-2">{restaurant.rating}</span>
                                <span className="mr-2">•</span>
                                <span>{restaurant.deliveryTime}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {restaurant.categories.join(", ")}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {filteredRestaurants.length > 3 && (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="#" onClick={() => setActiveTab("restaurants")}>
                            View all {filteredRestaurants.length} restaurants
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Dishes Section */}
                {filteredDishes.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-lg mb-3">Dishes</h2>
                    <div className="space-y-4">
                      {filteredDishes.slice(0, 3).map((dish) => (
                        <div key={dish.id} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={dish.image || "/placeholder.svg"}
                              alt={dish.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{dish.name}</h3>
                            <p className="text-sm text-muted-foreground">{dish.restaurant}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-medium text-sm">Rp {dish.price.toLocaleString()}</span>
                              <div className="flex items-center text-sm">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                <span>{dish.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredDishes.length > 3 && (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="#" onClick={() => setActiveTab("dishes")}>
                            View all {filteredDishes.length} dishes
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {filteredRestaurants.length === 0 && filteredDishes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="restaurants" className="mt-0">
                <div className="space-y-4">
                  {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant) => (
                      <Link href={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                        <div className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={restaurant.image || "/placeholder.svg"}
                              alt={restaurant.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{restaurant.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="mr-2">{restaurant.rating}</span>
                              <span className="mr-2">•</span>
                              <span>{restaurant.deliveryTime}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{restaurant.categories.join(", ")}</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No restaurants found for "{searchQuery}"</p>
                      <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dishes" className="mt-0">
                <div className="space-y-4">
                  {filteredDishes.length > 0 ? (
                    filteredDishes.map((dish) => (
                      <div key={dish.id} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image src={dish.image || "/placeholder.svg"} alt={dish.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{dish.name}</h3>
                          <p className="text-sm text-muted-foreground">{dish.restaurant}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-medium text-sm">Rp {dish.price.toLocaleString()}</span>
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
                      <p className="text-muted-foreground">No dishes found for "{searchQuery}"</p>
                      <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

