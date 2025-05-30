"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatRupiah } from "@/services/api"
import type { ExtraGroup } from "@/services/dto/restaurant"
import { getExtraGroup } from "@/services/foodService"
import Swal from "sweetalert2"

interface ExtrasModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  onAddToCart: (item: any, selectedExtras: Record<number, number | number[]>, totalPrice:number) => void
}

export function ExtrasModal({ isOpen, onClose, item, onAddToCart }: ExtrasModalProps) {
  const [extraGroups, setExtraGroups] = useState<ExtraGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExtras, setSelectedExtras] = useState<Record<number, number | number[]>>({})
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [validationErrors, setValidationErrors] = useState<Record<number, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false) // Add flag to prevent double submission

  // Reset selections when modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      // Reset selections
      setSelectedExtras({})
      setValidationErrors({})
      setTotalPrice(Number.parseInt(item.price || "0"))
      setIsSubmitting(false) // Reset submission flag

      // Fetch extra groups
      fetchExtraGroups()
    }
  }, [isOpen, item])

  const fetchExtraGroups = async () => {
    if (!item || !item.id) return

    try {
      setLoading(true)
      // Fetch extra groups directly using the food item's ID
      const data = await getExtraGroup(item.id)
      if (data) {
        setExtraGroups(data)
      } else {
        Swal.fire("Error", "undefined", "error")
      }
    } catch (error) {
      console.error("Error fetching extra groups:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Calculate total price based on selected extras
    if (!item) return

    let newTotal = Number.parseInt(item.price || "0")

    Object.entries(selectedExtras).forEach(([groupId, selection]) => {
      const group = extraGroups.find((g) => g.id === Number.parseInt(groupId))
      if (!group) return

      if (Array.isArray(selection)) {
        // Multiple selections
        selection.forEach((detailId) => {
          const detail = group.details.find((d) => d.id === detailId)
          if (detail) {
            newTotal += Number.parseInt(detail.price || "0")
          }
        })
      } else {
        // Single selection
        const detail = group.details.find((d) => d.id === selection)
        if (detail) {
          newTotal += Number.parseInt(detail.price || "0")
        }
      }
    })

    setTotalPrice(newTotal)
  }, [selectedExtras, item, extraGroups])

  const handleSingleSelection = (groupId: number, detailId: number) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [groupId]: detailId,
    }))

    // Clear validation error for this group
    if (validationErrors[groupId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[groupId]
        return newErrors
      })
    }
  }

  const handleMultipleSelection = (groupId: number, detailId: number, checked: boolean) => {
    setSelectedExtras((prev) => {
      const currentSelections = (prev[groupId] as number[]) || []

      if (checked) {
        return {
          ...prev,
          [groupId]: [...currentSelections, detailId],
        }
      } else {
        return {
          ...prev,
          [groupId]: currentSelections.filter((id) => id !== detailId),
        }
      }
    })

    // Clear validation error for this group if it now has selections
    if (validationErrors[groupId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[groupId]
        return newErrors
      })
    }
  }

  const validateSelections = (): boolean => {
    const errors: Record<number, boolean> = {}

    extraGroups.forEach((group) => {
      if (group.requiredSelection) {
        const selection = selectedExtras[group.id]

        if (!selection || (Array.isArray(selection) && selection.length === 0)) {
          errors[group.id] = true
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddToCart = () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log("Already submitting, ignoring")
      return
    }

    if (validateSelections()) {
      setIsSubmitting(true) // Set flag to prevent double submission

      // Call the onAddToCart function with the selected extras
      onAddToCart(item, selectedExtras, totalPrice)

      // Close modal is handled by the parent component
    }
  }

  // Custom close handler to ensure state is reset
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item?.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center">Loading options...</div>
        ) : (
          <>
            {extraGroups.map((group) => (
              <div key={group.id} className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{group.name}</h3>
                  {group.requiredSelection > 0 && <span className="text-sm text-red-500">Required</span>}
                </div>

                {validationErrors[group.id] && <p className="text-sm text-red-500 mb-2">Please select an option</p>}

                {group.allowMultipleSelection ? (
                  // Checkbox group for multiple selections
                  <div className="space-y-2">
                    {group.details.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`option-${detail.id}`}
                            checked={
                              Array.isArray(selectedExtras[group.id]) &&
                              (selectedExtras[group.id] as number[]).includes(detail.id)
                            }
                            onCheckedChange={(checked) =>
                              handleMultipleSelection(group.id, detail.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={`option-${detail.id}`}>{detail.name}</Label>
                        </div>
                        {Number.parseInt(detail.price) > 0 ? (
                          <span className="text-sm">{formatRupiah(Number.parseInt(detail.price))}</span>
                        ) : (
                          <span className="text-sm text-green-600">Free</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Radio group for single selection
                  <RadioGroup
                    value={selectedExtras[group.id]?.toString()}
                    onValueChange={(value) => handleSingleSelection(group.id, Number.parseInt(value))}
                    className="space-y-2"
                  >
                    {group.details.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={detail.id.toString()} id={`option-${detail.id}`} />
                          <Label htmlFor={`option-${detail.id}`}>{detail.name}</Label>
                        </div>
                        {Number.parseInt(detail.price) > 0 ? (
                          <span className="text-sm">{formatRupiah(Number.parseInt(detail.price))}</span>
                        ) : (
                          <span className="text-sm text-green-600">Free</span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}

                <Separator className="mt-4" />
              </div>
            ))}
          </>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <span className="font-medium">Total:</span>
            <span className="font-bold">{formatRupiah(totalPrice)}</span>
          </div>
          <Button onClick={handleAddToCart} className="w-full" disabled={loading || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
