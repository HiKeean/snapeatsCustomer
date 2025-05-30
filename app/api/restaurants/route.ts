import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers";
import { decryptAESClient } from "@/lib/enc";
import { API_PEMBELI } from "@/services/api";
import { refresh_token } from "@/services/authService";
import { ListAllRestaurant, Response } from "@/services/dto/restaurant";


// Sample data for demonstration
const sampleRestaurants = [
  {
    id: "PJ140425090039726",
    name: "Warung Padang Sederhana",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.8,
    estDel: "15-25 min",
    categoryPenjual: "INDONESIAN",
    recomended: true,
  },
  {
    id: "PJ250425102146982",
    name: "Sushi Tei",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.7,
    estDel: "20-30 min",
    categoryPenjual: "JAPANESE",
    recomended: true,
  },
  {
    id: "PJ250425102146983",
    name: "Pizza Hut",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.5,
    estDel: "25-35 min",
    categoryPenjual: "ITALIAN",
    recomended: true,
  },
  {
    id: "PJ250425102146984",
    name: "KFC",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.3,
    estDel: "15-25 min",
    categoryPenjual: "FAST_FOOD",
    recomended: false,
  },
  {
    id: "PJ250425102146985",
    name: "Burger King",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.2,
    estDel: "20-30 min",
    categoryPenjual: "FAST_FOOD",
    recomended: false,
  },
  {
    id: "PJ250425102146986",
    name: "Bakmi GM",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.6,
    estDel: "15-25 min",
    categoryPenjual: "CHINESE",
    recomended: false,
  },
  {
    id: "PJ250425102146987",
    name: "Solaria",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.4,
    estDel: "20-30 min",
    categoryPenjual: "INDONESIAN",
    recomended: false,
  },
  {
    id: "PJ250425102146988",
    name: "Yoshinoya",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.5,
    estDel: "15-25 min",
    categoryPenjual: "JAPANESE",
    recomended: false,
  },
  {
    id: "PJ250425102146989",
    name: "Starbucks",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.6,
    estDel: "10-20 min",
    categoryPenjual: "BEVERAGES",
    recomended: false,
  },
  {
    id: "PJ250425102146990",
    name: "Chatime",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.3,
    estDel: "15-25 min",
    categoryPenjual: "BEVERAGES",
    recomended: false,
  },
  {
    id: "PJ250425102146991",
    name: "Hokben",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.4,
    estDel: "15-25 min",
    categoryPenjual: "JAPANESE",
    recomended: false,
  },
  {
    id: "PJ250425102146992",
    name: "Domino's Pizza",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.2,
    estDel: "25-35 min",
    categoryPenjual: "ITALIAN",
    recomended: false,
  },
  {
    id: "PJ250425102146993",
    name: "McDonalds",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.3,
    estDel: "15-25 min",
    categoryPenjual: "FAST_FOOD",
    recomended: false,
  },
  {
    id: "PJ250425102146994",
    name: "A&W",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.1,
    estDel: "20-30 min",
    categoryPenjual: "FAST_FOOD",
    recomended: false,
  },
  {
    id: "PJ250425102146995",
    name: "Wendy's",
    foto: "/placeholder.svg?height=400&width=600",
    rating: 4.2,
    estDel: "20-30 min",
    categoryPenjual: "FAST_FOOD",
    recomended: false,
  },
]

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "0")
  const size = Number.parseInt(searchParams.get("size") || "10")
    console.log(`url = ${API_PEMBELI.API_GETALLRESTAURANT}?page=${page}&size=${size}`)
    try {
        // const token = await getToken();
        const response = await fetch(`${API_PEMBELI.API_GETALLRESTAURANT}?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${token}`
            },
        })
        const result:Response = await response.json()
        if (!response.ok) {
            // Jika status code bukan 2xx, lempar error
            console.log(`response status = ${response.ok}`)
            if(response.status == 403){
                const temp = await refresh_token();
                if(temp){
                    return await GET(request);
                }
            }else{
                return undefined;
            }
             // Atau bisa lempar exception sesuai kebutuhan
        }
        // const paginatedData:ListAllRestaurant[] = result.content
        // return {
        //     success: result.success,
        //     message: result.success ? "" : result.message || "Something went wrong",
        // }
        // Return paginated response
        return NextResponse.json({
            content: result.content,
            page: {
            size: size,
            number: page,
            totalElements: sampleRestaurants.length,
            totalPages: Math.ceil(sampleRestaurants.length / size),
            },
        })
    } catch (error:any) {
        console.log(error)
        throw new Error(error);
    }
  
}


async function getToken(){
    const cached = (await cookies()).get("SNAPEATS_SESSION")?.value;
    if (!cached) throw new Error("Session token not found");
  
    const decrypted = await decryptAESClient(cached); 
    const parsed = JSON.parse(decrypted); 
    const token = Buffer.from(parsed.access_token, "base64").toString("utf-8");
    return token;
}