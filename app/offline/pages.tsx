import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <WifiOff className="w-16 h-16 mb-4 text-primary" />
      <h1 className="text-2xl font-bold mb-2">You're offline</h1>
      <p className="mb-6 text-muted-foreground">Please check your internet connection and try again.</p>
      <Button asChild>
        <Link href="/">Try Again</Link>
      </Button>
    </div>
  )
}

