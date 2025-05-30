import Image from "next/image"
import Link from "next/link"
import { Star, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface RestaurantCardProps {
  id: string
  name: string
  image: string
  rating: number
  deliveryTime: string
  categories: string[]
  priceRange: string
  isRecommended?: boolean
  className?: string
}

export function RestaurantCard({
  id,
  name,
  image,
  rating,
  deliveryTime,
  categories,
  priceRange,
  isRecommended = false,
  className,
}: RestaurantCardProps) {
  return (
    <Link href={`/pembeli/restaurant/${id}`}>
      <div className={cn("rounded-lg overflow-hidden shadow-sm border", className)}>
        <div className="relative h-40 w-full">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
          {isRecommended && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              Recommended
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-base line-clamp-1">{name}</h3>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
            <span className="mr-2">{rating}</span>
            <span className="mr-2">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{deliveryTime}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span>{categories.join(", ")}</span>
            <span className="mx-1">•</span>
            <span>{priceRange}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

