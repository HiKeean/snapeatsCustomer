import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-pink-600 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

