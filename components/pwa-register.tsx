"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export function PWARegister() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // <-- ini buat X

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )
      })
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    })

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  if (!isVisible || isStandalone) return null

  return (
    <>
      {isInstallable && (
        <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-secondary rounded-lg shadow-lg p-4 z-30 border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">Install FoodExpress</h3>
              <p className="text-sm text-muted-foreground">Add to home screen for a better experience</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleInstallClick}>
                <Download className="mr-2 h-4 w-4" />
                Install
              </Button>
              <button onClick={() => setIsVisible(false)} className="p-1 rounded hover:bg-muted transition">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isIOS && !isInstallable && (
        <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-secondary rounded-lg shadow-lg p-4 z-30 border">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">Install FoodExpress</h3>
              <p className="text-sm text-muted-foreground">
                To install this app on your iOS device, tap the share button ⎋ and then "Add to Home Screen" ➕.
              </p>
            </div>
            <button onClick={() => setIsVisible(false)} className="p-1 rounded hover:bg-muted transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
