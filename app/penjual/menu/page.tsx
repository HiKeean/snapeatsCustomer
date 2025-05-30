"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Star,
  ShoppingBag,
  UtensilsCrossed,
  PlusCircle,
  Settings,
  icons,
} from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import Swal from "sweetalert2"
import { title } from "process"

// Sample data for menu categories
const menuCategories = [
  { id: "main", name: "Main Dishes" },
  { id: "sides", name: "Side Dishes" },
  { id: "drinks", name: "Beverages" },
]

// Sample data for menu items
const menuItems = [
  {
    id: "m1",
    name: "Beef Rendang",
    description: "Slow-cooked beef in coconut milk and spices",
    price: 45000,
    image: "/placeholder.svg?height=200&width=300",
    category: "main",
    available: true,
    popular: true,
    orders: 42,
    rating: 4.9,
    extraGroups: ["spicy-level", "adds-on"],
  },
  {
    id: "m2",
    name: "Ayam Pop",
    description: "Fried chicken with special Padang spices",
    price: 35000,
    image: "/placeholder.svg?height=200&width=300",
    category: "main",
    available: true,
    popular: true,
    orders: 38,
    rating: 4.8,
    extraGroups: ["spicy-level"],
  },
  {
    id: "m3",
    name: "Gulai Ikan",
    description: "Fish curry with traditional Padang spices",
    price: 40000,
    image: "/placeholder.svg?height=200&width=300",
    category: "main",
    available: true,
    popular: true,
    orders: 28,
    rating: 4.6,
    extraGroups: ["spicy-level", "adds-on"],
  },
  {
    id: "s1",
    name: "Sayur Nangka",
    description: "Young jackfruit curry",
    price: 15000,
    image: "/placeholder.svg?height=200&width=300",
    category: "sides",
    available: true,
    popular: false,
    orders: 22,
    rating: 4.5,
    extraGroups: [],
  },
  {
    id: "s2",
    name: "Terong Balado",
    description: "Eggplant with chili sauce",
    price: 15000,
    image: "/placeholder.svg?height=200&width=300",
    category: "sides",
    available: true,
    popular: true,
    orders: 25,
    rating: 4.7,
    extraGroups: ["spicy-level"],
  },
  {
    id: "d1",
    name: "Es Teh Manis",
    description: "Sweet iced tea",
    price: 8000,
    image: "/placeholder.svg?height=200&width=300",
    category: "drinks",
    available: true,
    popular: false,
    orders: 45,
    rating: 4.4,
    extraGroups: ["sugar-level"],
  },
  {
    id: "d2",
    name: "Es Jeruk",
    description: "Fresh orange juice",
    price: 10000,
    image: "/placeholder.svg?height=200&width=300",
    category: "drinks",
    available: true,
    popular: false,
    orders: 40,
    rating: 4.5,
    extraGroups: ["sugar-level"],
  },
]

// Sample data for extra groups
const extraGroupsData = [
  {
    id: "spicy-level",
    name: "Spicy Level",
    required: true,
    multiSelect: false,
    details: [
      { id: "mild", name: "Mild", price: 0 },
      { id: "medium", name: "Medium", price: 0 },
      { id: "hot", name: "Hot", price: 0 },
      { id: "extra-hot", name: "Extra Hot", price: 5000 },
    ],
  },
  {
    id: "adds-on",
    name: "Adds On",
    required: false,
    multiSelect: true,
    details: [
      { id: "cheese", name: "Topping Keju", price: 5000 },
      { id: "tomato", name: "Topping Tomat", price: 3000 },
      { id: "egg", name: "Telur", price: 5000 },
    ],
  },
  {
    id: "sugar-level",
    name: "Sugar Level",
    required: true,
    multiSelect: false,
    details: [
      { id: "no-sugar", name: "No Sugar", price: 0 },
      { id: "less-sugar", name: "Less Sugar", price: 0 },
      { id: "normal", name: "Normal", price: 0 },
      { id: "extra-sugar", name: "Extra Sugar", price: 2000 },
    ],
  },
]

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState(menuItems)
  const [extraGroups, setExtraGroups] = useState(extraGroupsData)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddExtraGroupDialogOpen, setIsAddExtraGroupDialogOpen] = useState(false)
  const [isManageExtraDetailsDialogOpen, setIsManageExtraDetailsDialogOpen] = useState(false)
  const [selectedExtraGroup, setSelectedExtraGroup] = useState<any>(null)
  const [isAddExtraDetailDialogOpen, setIsAddExtraDetailDialogOpen] = useState(false)
  const [isEditExtraDetailDialogOpen, setIsEditExtraDetailDialogOpen] = useState(false)
  const [selectedExtraDetail, setSelectedExtraDetail] = useState<any>(null)

  // Ubah state newItem untuk menambahkan properti extraGroups dan image
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    priceFormatted: "",
    price: "",
    category: "main",
    available: true,
    extraGroups: [] as string[],
    image: "",
  })

  // Tambahkan state untuk edit item
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [newExtraGroup, setNewExtraGroup] = useState({
    name: "",
    required: false,
    multiSelect: false,
  })

  const [newExtraDetail, setNewExtraDetail] = useState({
    name: "",
    price: "",
  })

  const formatRupiah = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');  // Hapus karakter non-numerik
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const hasil = `Rp. ${formattedValue}`
    return hasil;
  };

  // Ubah fungsi handleAddItem untuk menyertakan extraGroups dan image
  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields",
        icon: "error"
      })
      // toast("Please fill in all required fields", "destructive");
      toast.error("Please fill in all required fields")
      
      return
    }

    const price = Number.parseInt(newItem.price)
    if (isNaN(price) || price <= 0) {
      toast.error("Error",{
        description: "Please enter a valid price",
      })
      return
    }

    const newId = `item-${Date.now()}`
    const itemToAdd = {
      id: newId,
      name: newItem.name,
      description: newItem.description,
      price: Number.parseInt(newItem.price),
      image: newItem.image || "/placeholder.svg?height=200&width=300",
      category: newItem.category,
      available: newItem.available,
      popular: false,
      orders: 0,
      rating: 0,
      extraGroups: newItem.extraGroups,
    }

    setItems([...items, itemToAdd])
    setIsAddDialogOpen(false)
    setNewItem({
      name: "",
      description: "",
      priceFormatted:"",
      price: "",
      category: "main",
      available: true,
      extraGroups: [],
      image: "",
    })

    toast.success("Success",{
      description: "Menu item added successfully",
    })
  }

  // Tambahkan fungsi untuk menangani edit item
  const handleEditItem = () => {
    if (!editingItem.name || !editingItem.description || !editingItem.price) {
      toast.error("Error",{
        description: "Please fill in all required fields",
      })
      return
    }

    const price = Number.parseInt(editingItem.price)
    if (isNaN(price) || price <= 0) {
      toast.error("Error",{
        description: "Please enter a valid price",
      })
      return
    }

    const updatedItems = items.map((item) => {
      var harga = formatRupiah(editingItem.price);
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editingItem.name,
          description: editingItem.description,
          price: Number.parseInt(editingItem.price),
          image: editingItem.image,
          category: editingItem.category,
          available: editingItem.available,
          extraGroups: editingItem.extraGroups,
        }
      }
      return item
    })

    setItems(updatedItems)
    setIsEditItemDialogOpen(false)
    setEditingItem(null)

    toast.success("Success",{
      description: "Menu item updated successfully",
    })
  }

  // Tambahkan fungsi untuk menangani toggle checkbox extra group
  const handleExtraGroupToggle = (groupId: string, isForEdit = false) => {
    if (isForEdit) {
      if (editingItem.extraGroups.includes(groupId)) {
        setEditingItem({
          ...editingItem,
          extraGroups: editingItem.extraGroups.filter((id: string) => id !== groupId),
        })
      } else {
        setEditingItem({
          ...editingItem,
          extraGroups: [...editingItem.extraGroups, groupId],
        })
      }
    } else {
      if (newItem.extraGroups.includes(groupId)) {
        setNewItem({
          ...newItem,
          extraGroups: newItem.extraGroups.filter((id) => id !== groupId),
        })
      } else {
        setNewItem({
          ...newItem,
          extraGroups: [...newItem.extraGroups, groupId],
        })
      }
    }
  }

  // Tambahkan fungsi untuk menangani upload gambar
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isForEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isForEdit) {
          setEditingItem({
            ...editingItem,
            image: reader.result as string,
          })
        } else {
          setNewItem({
            ...newItem,
            image: reader.result as string,
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }
  const handleAddExtraGroup = () => {
    if (!newExtraGroup.name) {
      toast.error("Error",{
        description: "Please enter a group name",
      })
      return
    }

    const newId = `group-${Date.now()}`
    const groupToAdd = {
      id: newId,
      name: newExtraGroup.name,
      required: newExtraGroup.required,
      multiSelect: newExtraGroup.multiSelect,
      details: [],
    }

    setExtraGroups([...extraGroups, groupToAdd])
    setIsAddExtraGroupDialogOpen(false)
    setNewExtraGroup({
      name: "",
      required: false,
      multiSelect: false,
    })

    toast.success("Success",{
      description: "Extra group added successfully",
    })
  }

  const handleAddExtraDetail = () => {
    if (!newExtraDetail.name) {
      toast.error("Error",{
        description: "Please enter a detail name",
      })
      return
    }

    const price = newExtraDetail.price ? Number.parseInt(newExtraDetail.price) : 0
    if (isNaN(price) || price < 0) {
      toast.error("Error",{
        description: "Please enter a valid price",
      })
      return
    }

    const newId = `detail-${Date.now()}`
    const detailToAdd = {
      id: newId,
      name: newExtraDetail.name,
      price: price,
    }

    const updatedGroups = extraGroups.map((group) => {
      if (group.id === selectedExtraGroup.id) {
        return {
          ...group,
          details: [...group.details, detailToAdd],
        }
      }
      return group
    })

    setExtraGroups(updatedGroups)
    setIsAddExtraDetailDialogOpen(false)
    setNewExtraDetail({
      name: "",
      price: "",
    })

    toast.success("Success",{
      description: "Extra detail added successfully",
    })
  }

  const handleEditExtraDetail = () => {
    if (!newExtraDetail.name) {
      toast.error("Error",{
        description: "Please enter a detail name",
      })
      return
    }

    const price = newExtraDetail.price ? Number.parseInt(newExtraDetail.price) : 0
    if (isNaN(price) || price < 0) {
      toast.error("Error",{
        description: "Please enter a valid price",
      })
      return
    }

    const updatedGroups = extraGroups.map((group) => {
      if (group.id === selectedExtraGroup.id) {
        return {
          ...group,
          details: group.details.map((detail) => {
            if (detail.id === selectedExtraDetail.id) {
              return {
                ...detail,
                name: newExtraDetail.name,
                price: price,
              }
            }
            return detail
          }),
        }
      }
      return group
    })

    setExtraGroups(updatedGroups)
    setIsEditExtraDetailDialogOpen(false)
    setNewExtraDetail({
      name: "",
      price: "",
    })
    setSelectedExtraDetail(null)

    toast.success("Success",{
      description: "Extra detail updated successfully",
    })
  }

  const handleDeleteExtraDetail = (detailId: string) => {
    const updatedGroups = extraGroups.map((group) => {
      if (group.id === selectedExtraGroup.id) {
        return {
          ...group,
          details: group.details.filter((detail) => detail.id !== detailId),
        }
      }
      return group
    })

    setExtraGroups(updatedGroups)

    toast.success("Success",{
      description: "Extra detail deleted successfully",
    })
  }

  const handleDeleteExtraGroup = (groupId: string) => {
    setExtraGroups(extraGroups.filter((group) => group.id !== groupId))

    toast.success("Success",{
      description: "Extra group deleted successfully",
    })
  }

  const toggleItemAvailability = (id: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, available: !item.available }
        }
        return item
      }),
    )

    const item = items.find((item) => item.id === id)
    toast(item?.available ? "Item Unavailable" : "Item Available",{
      description: `${item?.name} is now ${item?.available ? "unavailable" : "available"} for ordering`,
    })
  }

  const deleteItem = (id: string) => {
    const item = items.find((item) => item.id === id)
    setItems(items.filter((item) => item.id !== id))

    toast("Item Deleted",{
      description: `${item?.name} has been deleted from your menu`,
    })
  }

  // Filter items based on active tab and search query
  const filteredItems = items.filter((item) => {
    // Filter by category
    if (activeTab !== "all" && item.category !== activeTab) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    }

    return true
  })

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
          <p className="text-muted-foreground">Manage your restaurant menu</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search menu..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
                <DialogDescription>Add a new item to your restaurant menu.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Beef Rendang"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Describe your dish"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (Rp)</Label>
                  <Input
                    id="price"
                    value={newItem.priceFormatted}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value, priceFormatted: formatRupiah(e.target.value) })}
                    placeholder="e.g. 45000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    {menuCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Item Image</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="cursor-pointer"
                    />
                    {newItem.image && (
                      <div className="relative h-40 w-full mt-2 rounded-md overflow-hidden">
                        <Image
                          src={newItem.image || "/placeholder.svg"}
                          alt="Item preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="available" className="flex-1">
                    Available for ordering
                  </Label>
                  <Switch
                    id="available"
                    checked={newItem.available}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, available: checked })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Extra Groups</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    {extraGroups.length > 0 ? (
                      extraGroups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`extra-${group.id}`}
                            checked={newItem.extraGroups.includes(group.id)}
                            onCheckedChange={() => handleExtraGroupToggle(group.id)}
                          />
                          <Label htmlFor={`extra-${group.id}`} className="flex-1 cursor-pointer">
                            {group.name}
                            {group.required && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Required
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">No extra groups available</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="mt-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="main">Main Dishes</TabsTrigger>
                <TabsTrigger value="sides">Side Dishes</TabsTrigger>
                <TabsTrigger value="drinks">Beverages</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="mt-4">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-full">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        {item.popular && <Badge className="absolute top-2 left-2 bg-pink-600">Popular</Badge>}
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="outline" className="bg-white text-black">
                              Unavailable
                            </Badge>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Ubah DropdownMenuItem untuk Edit Item */}
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingItem({
                                  ...item,
                                  price: item.price.toString(),
                                })
                                setIsEditItemDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleItemAvailability(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {item.available ? "Mark as Unavailable" : "Mark as Available"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold truncate mr-2">{item.name}</h3>
                          <p className="font-bold whitespace-nowrap">Rp {item.price.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                        {item.extraGroups && item.extraGroups.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Extras:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.extraGroups.map((groupId) => {
                                const group = extraGroups.find((g) => g.id === groupId)
                                return group ? (
                                  <Badge key={groupId} variant="outline" className="text-xs">
                                    {group.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}

                        <Separator className="my-3" />
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center min-w-0">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1 flex-shrink-0" />
                            <span className="truncate">{item.rating > 0 ? item.rating : "No ratings"}</span>
                          </div>
                          <div className="flex items-center min-w-0 ml-2">
                            <ShoppingBag className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{item.orders} orders</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No menu items found</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      {searchQuery
                        ? `No items match your search for "${searchQuery}"`
                        : "You don't have any menu items in this category yet."}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Menu Item</DialogTitle>
                          <DialogDescription>Add a new item to your restaurant menu.</DialogDescription>
                        </DialogHeader>
                        {/* Form fields would go here */}
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button>Add Item</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="extras" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Extra Groups</h2>
            <Dialog open={isAddExtraGroupDialogOpen} onOpenChange={setIsAddExtraGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Extra Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Extra Group</DialogTitle>
                  <DialogDescription>Create a new group for extras like toppings or spice levels.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newExtraGroup.name}
                      onChange={(e) => setNewExtraGroup({ ...newExtraGroup, name: e.target.value })}
                      placeholder="e.g. Adds On, Spicy Level"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="required" className="flex-1">
                      Required selection
                    </Label>
                    <Switch
                      id="required"
                      checked={newExtraGroup.required}
                      onCheckedChange={(checked) => setNewExtraGroup({ ...newExtraGroup, required: checked })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="multi-select" className="flex-1">
                      Allow multiple selections
                    </Label>
                    <Switch
                      id="multi-select"
                      checked={newExtraGroup.multiSelect}
                      onCheckedChange={(checked) => setNewExtraGroup({ ...newExtraGroup, multiSelect: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddExtraGroupDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExtraGroup}>Add Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {extraGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteExtraGroup(group.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {group.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {group.multiSelect ? (
                      <Badge variant="outline" className="text-xs">
                        Multiple Selection
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Single Selection
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.details.length > 0 ? (
                      group.details.map((detail) => (
                        <div key={detail.id} className="flex justify-between items-center p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{detail.name}</p>
                            {detail.price > 0 && (
                              <p className="text-sm text-muted-foreground">+Rp {detail.price.toLocaleString()}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedExtraDetail(detail)
                                setNewExtraDetail({
                                  name: detail.name,
                                  price: detail.price.toString(),
                                })
                                setIsEditExtraDetailDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExtraDetail(detail.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">No details added yet</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedExtraGroup(group)
                      setIsManageExtraDetailsDialogOpen(true)
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {extraGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No extra groups found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                You haven't created any extra groups yet. Add a group to start managing extras like toppings or spice
                levels.
              </p>
              <Button onClick={() => setIsAddExtraGroupDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Extra Group
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for managing extra details */}
      <Dialog open={isManageExtraDetailsDialogOpen} onOpenChange={setIsManageExtraDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage {selectedExtraGroup?.name} Details</DialogTitle>
            <DialogDescription>Add, edit or remove details for this extra group.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Details</h3>
              <Button
                size="sm"
                onClick={() => {
                  setNewExtraDetail({ name: "", price: "" })
                  setIsAddExtraDetailDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Detail
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedExtraGroup?.details.length > 0 ? (
                selectedExtraGroup.details.map((detail: any) => (
                  <div key={detail.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{detail.name}</p>
                      {detail.price > 0 && (
                        <p className="text-sm text-muted-foreground">+Rp {detail.price.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedExtraDetail(detail)
                          setNewExtraDetail({
                            name: detail.name,
                            price: detail.price.toString(),
                          })
                          setIsEditExtraDetailDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExtraDetail(detail.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No details added yet</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsManageExtraDetailsDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding extra detail */}
      <Dialog open={isAddExtraDetailDialogOpen} onOpenChange={setIsAddExtraDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Detail to {selectedExtraGroup?.name}</DialogTitle>
            <DialogDescription>Add a new detail like a topping or spice level.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="detail-name">Name</Label>
              <Input
                id="detail-name"
                value={newExtraDetail.name}
                onChange={(e) => setNewExtraDetail({ ...newExtraDetail, name: e.target.value })}
                placeholder="e.g. Topping Keju, Medium Spicy"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detail-price">Additional Price (Rp)</Label>
              <Input
                id="detail-price"
                type="number"
                value={newExtraDetail.price}
                onChange={(e) => setNewExtraDetail({ ...newExtraDetail, price: e.target.value })}
                placeholder="e.g. 5000 (leave empty for no additional cost)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExtraDetailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExtraDetail}>Add Detail</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing extra detail */}
      <Dialog open={isEditExtraDetailDialogOpen} onOpenChange={setIsEditExtraDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Detail</DialogTitle>
            <DialogDescription>Update the name or price of this detail.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-detail-name">Name</Label>
              <Input
                id="edit-detail-name"
                value={newExtraDetail.name}
                onChange={(e) => setNewExtraDetail({ ...newExtraDetail, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-detail-price">Additional Price (Rp)</Label>
              <Input
                id="edit-detail-price"
                type="number"
                value={newExtraDetail.price}
                onChange={(e) => setNewExtraDetail({ ...newExtraDetail, price: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditExtraDetailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditExtraDetail}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing item */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Edit an existing item in your restaurant menu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingItem?.name || ""}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="e.g. Beef Rendang"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingItem?.description || ""}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Describe your dish"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price (Rp)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editingItem?.price || ""}
                onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                placeholder="e.g. 45000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editingItem?.category || "main"}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              >
                {menuCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image</Label>
              <Input id="edit-image" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
              {editingItem?.image && (
                <Image
                  src={editingItem.image || "/placeholder.svg"}
                  alt="Menu Item"
                  width={100}
                  height={100}
                  className="rounded-md"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-available" className="flex-1">
                Available for ordering
              </Label>
              <Switch
                id="edit-available"
                checked={editingItem?.available || false}
                onCheckedChange={(checked) => setEditingItem({ ...editingItem, available: checked })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Extra Groups</Label>
              <div className="border rounded-md p-3 space-y-2">
                {extraGroups.length > 0 ? (
                  extraGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-extra-${group.id}`}
                        checked={editingItem?.extraGroups?.includes(group.id) || false}
                        onCheckedChange={() => handleExtraGroupToggle(group.id, true)}
                      />
                      <Label htmlFor={`edit-extra-${group.id}`} className="flex-1 cursor-pointer">
                        {group.name}
                        {group.required && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Required
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No extra groups available</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
