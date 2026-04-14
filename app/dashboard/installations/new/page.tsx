"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Zap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string
  name: string
  price: number
  category_name?: string
  primary_image?: string
  description?: string
  short_description?: string
}

interface SelectedProduct {
  id: string
  name: string
  price: number
  quantity: number
}

export default function NewInstallationRequestPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location_address: "",
    location_city: "",
    preferred_date: "",
    urgency: "normal"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          description,
          short_description,
          product_categories (
            name
          ),
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
      } else {
        const transformedProducts: Product[] = data?.map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          category_name: product.product_categories?.name || "Uncategorized",
          primary_image: product.product_images?.find((img: any) => img.is_primary)?.image_url ||
                        product.product_images?.[0]?.image_url,
          description: product.description,
          short_description: product.short_description
        })) || []

        setProducts(transformedProducts)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = (product: any) => {
    const existing = selectedProducts.find(p => p.id === product.id)
    if (existing) {
      setSelectedProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      )
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }])
    }
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
    } else {
      setSelectedProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, quantity } : p)
      )
    }
  }

  const getTotalCost = () => {
    return selectedProducts.reduce((total, product) => total + (product.price * product.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedProducts.length === 0) {
      toast({
        title: "Select products",
        description: "Please select at least one product for installation.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          title: "Sign in required",
          description: "Please log in to create an installation job.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const { data: jobData, error: jobError } = await supabase
        .from("installation_jobs")
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: formData.description,
          location_address: formData.location_address,
          location_city: formData.location_city,
          preferred_date: formData.preferred_date || null,
          urgency: formData.urgency,
          status: "open",
          total_product_cost: getTotalCost()
        })
        .select()
        .single()

      if (jobError) {
        console.error("Error creating job:", jobError)
        toast({
          title: "Could not create job",
          description: "Error creating installation job. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const jobItems = selectedProducts.map(product => ({
        job_id: jobData.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: product.quantity
      }))

      const { error: itemsError } = await supabase
        .from("installation_job_items")
        .insert(jobItems)

      if (itemsError) {
        console.error("Error creating job items:", itemsError)
        toast({
          title: "Could not add products",
          description: "Error adding products to job. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      try {
        await fetch("/api/email/installation-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new-job",
            jobTitle: formData.title,
            location: `${formData.location_address}, ${formData.location_city}`,
            productCost: getTotalCost(),
            urgency: formData.urgency,
            description: formData.description,
            jobId: jobData.id
          })
        })
      } catch (emailError) {
        console.error("Error sending notifications:", emailError)
      }

      toast({
        title: "Installation job posted",
        description: "Professionals have been notified and can now submit bids.",
      })
      router.push("/dashboard/installations")

    } catch (error) {
      console.error("Error creating installation job:", error)
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const urgencyLabel: Record<string, string> = {
    low: "Flexible timing",
    normal: "Within 2 weeks",
    high: "Within 1 week",
    urgent: "ASAP",
  }

  return (
    <>
      <div className="space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/installations">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Request Installation</h1>
            <p className="text-xs text-gray-400 mt-0.5">Select products and post your installation job</p>
          </div>
          {selectedProducts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-gray-200 text-gray-700 hidden sm:flex"
              onClick={() => setSheetOpen(true)}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Selection</span>
              <span className="bg-gray-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {selectedProducts.length}
              </span>
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className={`flex items-center gap-1.5 font-medium ${selectedProducts.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedProducts.length > 0 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>1</div>
            <span className="hidden sm:inline">Products</span>
          </div>
          <div className="h-px w-6 bg-gray-200" />
          <div className={`flex items-center gap-1.5 font-medium ${formData.title ? "text-gray-900" : "text-gray-400"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${formData.title ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>2</div>
            <span className="hidden sm:inline">Details</span>
          </div>
          <div className="h-px w-6 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-gray-400">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">3</div>
            <span className="hidden sm:inline">Submit</span>
          </div>
        </div>

        {/* Product Selection */}
        <Card className="border border-gray-200">
          <CardHeader className="py-3 px-4 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
              Select Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Skeleton className="h-40 rounded-xl" />
                  <Skeleton className="h-40 rounded-xl" />
                  <Skeleton className="h-40 rounded-xl" />
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((product) => {
                  const selected = selectedProducts.find(p => p.id === product.id)
                  return (
                    <div
                      key={product.id}
                      className={`border rounded-xl p-3 transition-all bg-white ${selected ? "border-gray-900 ring-1 ring-gray-900/10" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {product.primary_image ? (
                            <Image
                              src={product.primary_image}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{product.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{product.category_name}</p>
                          {product.short_description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">KES {product.price.toLocaleString()}</p>
                        {selected ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              onClick={() => updateQuantity(product.id, selected.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-gray-900">{selected.quantity}</span>
                            <button
                              className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              onClick={() => updateQuantity(product.id, selected.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                            onClick={() => addProduct(product)}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details Form */}
        <Card className="border border-gray-200">
          <CardHeader className="py-3 px-4 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              Installation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="title" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Solar Panel Installation for Home"
                  className="mt-1 h-9 text-sm border-gray-200 focus-visible:ring-gray-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Special requirements, site details, access notes…"
                  rows={3}
                  className="mt-1 text-sm border-gray-200 focus-visible:ring-gray-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="location_address" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address *</Label>
                  <Input
                    id="location_address"
                    value={formData.location_address}
                    onChange={(e) => setFormData({...formData, location_address: e.target.value})}
                    placeholder="Full address"
                    className="mt-1 h-9 text-sm border-gray-200 focus-visible:ring-gray-300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location_city" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City *</Label>
                  <Input
                    id="location_city"
                    value={formData.location_city}
                    onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                    placeholder="City"
                    className="mt-1 h-9 text-sm border-gray-200 focus-visible:ring-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="preferred_date" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    <Input
                      id="preferred_date"
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                      className="pl-8 h-9 text-sm border-gray-200 focus-visible:ring-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="urgency" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                    <SelectTrigger className="mt-1 h-9 text-sm border-gray-200 focus:ring-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low — Flexible timing</SelectItem>
                      <SelectItem value="normal">Normal — Within 2 weeks</SelectItem>
                      <SelectItem value="high">High — Within 1 week</SelectItem>
                      <SelectItem value="urgent">Urgent — ASAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help note */}
        <div className="flex gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            After posting, qualified professionals will review and submit bids for your installation project.
          </p>
        </div>
      </div>

      {/* Sticky bottom bar — always visible, opens the sheet */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
            </p>
            <p className="text-sm font-bold text-gray-900">KES {getTotalCost().toLocaleString()}</p>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 h-9 px-5 text-sm font-semibold"
            onClick={() => setSheetOpen(true)}
          >
            Review & Post
          </Button>
        </div>
      )}

      {/* Right-side Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-gray-100">
            <SheetTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gray-400" />
              Selection
              <span className="ml-auto bg-gray-100 text-gray-700 text-xs font-bold rounded-full px-2 py-0.5">
                {selectedProducts.length}
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Selected products list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    KES {product.price.toLocaleString()} × {product.quantity} ={" "}
                    <span className="font-semibold text-gray-600">KES {(product.price * product.quantity).toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    onClick={() => updateQuantity(product.id, product.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-900">{product.quantity}</span>
                  <button
                    className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    onClick={() => updateQuantity(product.id, product.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary + submit */}
          <SheetFooter className="flex-col px-5 py-4 border-t border-gray-100 gap-3">
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Products total</span>
                <span className="font-semibold text-gray-800">KES {getTotalCost().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Installation</span>
                <span className="text-xs text-gray-400 self-center">via bids</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Urgency</span>
                <span className="text-xs font-medium text-gray-700">{urgencyLabel[formData.urgency]}</span>
              </div>
            </div>

            <div className="w-full border-t border-gray-100 pt-3">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Product Cost</span>
                <span className="text-lg font-bold text-gray-900">KES {getTotalCost().toLocaleString()}</span>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-9 text-sm font-semibold"
                onClick={handleSubmit}
                disabled={isSubmitting || selectedProducts.length === 0 || !formData.title || !formData.location_address || !formData.location_city}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Post Installation Job
                  </>
                )}
              </Button>
              {(!formData.title || !formData.location_address || !formData.location_city) && (
                <p className="text-[11px] text-center text-amber-600 mt-2">
                  Fill in job title, address and city to post
                </p>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
