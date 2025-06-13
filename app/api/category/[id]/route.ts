import { NextResponse } from "next/server"

// This would be replaced with a database query in a real application
const restaurantsByCategory = {
  indonesian: [
    {
      id: "1",
      name: "Warung Padang Sederhana",
      image: "/placeholder.svg?height=400&width=600",
      rating: 4.8,
      deliveryTime: "15-25 min",
      categories: ["Indonesian", "Padang"],
      priceRange: "$$",
      description: "Authentic Padang cuisine with a variety of traditional dishes.",
      distance: "1.2 km",
      coordinates: {
        latitude: -6.2088,
        longitude: 106.8456,
      },
    },
    {
      id: "7",
      name: "Solaria",
      image: "/placeholder.svg?height=400&width=600",
      rating: 4.4,
      deliveryTime: "20-30 min",
      categories: ["Indonesian", "Chinese"],
      priceRange: "$$",
      description: "Popular Indonesian restaurant chain with a variety of local dishes.",
      distance: "2.5 km",
      coordinates: {
        latitude: -6.2154,
        longitude: 106.8271,
      },
    },
    {
      id: "12",
      name: "Sederhana",
      image: "/placeholder.svg?height=400&width=600",
      rating: 4.6,
      deliveryTime: "15-25 min",
      categories: ["Indonesian", "Padang"],
      priceRange: "$$",
      description: "Famous Padang restaurant with authentic taste.",
      distance: "3.1 km",
      coordinates: {
        latitude: -6.1924,
        longitude: 106.8372,
      },
    },
  ],
  japanese: [
    {
      id: "2",
      name: "Sushi Tei",
      image: "/placeholder.svg?height=400&width=600",
      rating: 4.7,
      deliveryTime: "20-30 min",
      categories: ["Japanese", "Sushi"],
      priceRange: "$$$",
      description: "Premium Japanese restaurant with fresh sushi and sashimi.",
      distance: "3.5 km",
      coordinates: {
        latitude: -6.2265,
        longitude: 106.8092,
      },
    },
    {
      id: "8",
      name: "Yoshinoya",
      image: "/placeholder.svg?height=400&width=600",
      rating: 4.5,
      deliveryTime: "15-25 min",
      categories: ["Japanese", "Fast Food"],
      priceRange: "$$",
      description: "Japanese fast food specializing in beef bowls.",
      distance: "2.8 km",
      coordinates: {
        latitude: -6.2198,
        longitude: 106.8321,
      },
    },
    {
      id: "11",
      name: "Hokben",
      image: "/placeholder.svg?height=400&width=600",
      rating: 4.4,
      deliveryTime: "15-25 min",
      categories: ["Japanese", "Fast Food"],
      priceRange: "$$",
      description: "Japanese fast food with bento boxes and sushi.",
      distance: "1.9 km",
      coordinates: {
        latitude: -6.2112,
        longitude: 106.8354,
      },
    },
  ],
  // Add more categories as needed
}

// Function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// FIXED: Updated to handle async params in Next.js 15
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  // Await the params since they're now a Promise in Next.js 15
  const { id } = await context.params
  const { searchParams } = new URL(request.url)

  // Get location parameters
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  // Get restaurants for the category
  let restaurants = restaurantsByCategory[id as keyof typeof restaurantsByCategory] || []

  // If location is provided, calculate actual distances
  if (lat && lng) {
    const userLat = Number.parseFloat(lat)
    const userLng = Number.parseFloat(lng)

    // Calculate actual distance for each restaurant
    restaurants = restaurants.map((restaurant) => {
      if (restaurant.coordinates) {
        const distance = calculateDistance(
          userLat,
          userLng,
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude,
        )

        // Update the distance string
        return {
          ...restaurant,
          distance: `${distance.toFixed(1)} km`,
        }
      }
      return restaurant
    })

    // Sort by distance (this would typically be done in the database query)
    restaurants.sort((a, b) => {
      const distA = Number.parseFloat(a.distance.split(" ")[0])
      const distB = Number.parseFloat(b.distance.split(" ")[0])
      return distA - distB
    })
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(restaurants)
}
