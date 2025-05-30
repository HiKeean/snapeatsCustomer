"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CreditCard, DollarSign, Plus, Check } from "lucide-react"
import Image from "next/image"

export interface PaymentMethod {
  id: string
  type: "cash" | "qris" | "credit_card" | "debit_card" | "ewallet"
  name: string
  icon: React.ReactNode
  details?: string
  isDefault?: boolean
}

interface PaymentMethodSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPaymentMethod: (method: PaymentMethod) => void
  currentMethod?: PaymentMethod | null
}

export function PaymentMethodSelector({
  open,
  onOpenChange,
  onSelectPaymentMethod,
  currentMethod,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(currentMethod?.id || "cash")
  const [showAddCard, setShowAddCard] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: "cash",
      type: "cash",
      name: "Cash on Delivery",
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      details: "Pay when your order arrives",
      isDefault: true,
    },
    {
      id: "qris",
      type: "qris",
      name: "QRIS",
      icon: <QRISIcon className="h-5 w-5" />,
      details: "Scan QR code to pay",
    },
    {
      id: "card_visa",
      type: "credit_card",
      name: "Visa ending in 4242",
      icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      details: "Expires 12/25",
    },
    {
      id: "card_mastercard",
      type: "credit_card",
      name: "Mastercard ending in 8888",
      icon: <CreditCard className="h-5 w-5 text-red-600" />,
      details: "Expires 10/24",
    },
    {
      id: "gopay",
      type: "ewallet",
      name: "GoPay",
      icon: (
        <div className="relative h-5 w-5">
          <Image src="/placeholder.svg?height=20&width=20" alt="GoPay" fill className="object-contain" />
        </div>
      ),
      details: "Connected",
    },
  ]

  const handleConfirm = () => {
    const method = paymentMethods.find((m) => m.id === selectedMethod)
    if (method) {
      onSelectPaymentMethod(method)
      onOpenChange(false)
    }
  }

  if (showAddCard) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Payment Card</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="save-card" className="rounded border-gray-300" />
              <Label htmlFor="save-card">Save card for future payments</Label>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAddCard(false)}>
              Back
            </Button>
            <Button onClick={() => setShowAddCard(false)}>Add Card</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Payment Method</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                  selectedMethod === method.id ? "border-primary" : "border-border"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">{method.icon}</div>
                <div className="flex-1">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  {method.details && <p className="text-sm text-muted-foreground">{method.details}</p>}
                </div>
                {selectedMethod === method.id && <Check className="h-5 w-5 text-primary" />}
              </div>
            ))}
          </RadioGroup>

          <Separator className="my-4" />

          <Button variant="outline" className="w-full" onClick={() => setShowAddCard(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Card
          </Button>
        </div>

        <Button onClick={handleConfirm}>Confirm</Button>
      </DialogContent>
    </Dialog>
  )
}

function QRISIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}
