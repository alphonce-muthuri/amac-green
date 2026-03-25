"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case "low": return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Low - Flexible</Badge>
      case "normal": return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Normal - 2 weeks</Badge>
      case "high": return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">High - 1 week</Badge>
      case "urgent": return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 rounded-full">Urgent - ASAP</Badge>
      default: return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedProducts.length === 0) {
      alert("Please select at least one product for installation")
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        alert("Please log in to create an installation job")
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
        alert("Error creating installation job. Please try again.")
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
        alert("Error adding products to job. Please try again.")
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

      alert("Installation job created successfully! Professionals have been notified.")
      router.push("/dashboard/installations")

    } catch (error) {
      console.error("Error creating installation job:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/installations">
          <Button variant="outline" size="sm" className="border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Installations</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-gray-900">Request Installation Service</h1>
          <p className="text-gray-600 mt-1">Select products and request professional installation</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="border border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedProducts.length > 0 ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Select Products</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.title ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Job Details</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Submit</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <Card className="border border-emerald-200 overflow-hidden">
            <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
            <CardHeader className="bg-white border-b border-emerald-200">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                Select Products for Installation
              </CardTitle>
              <CardDescription>Choose the renewable energy products you want professionally installed</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-emerald-200 rounded-xl p-4 transition-all hover:border-emerald-300 bg-white">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.primary_image ? (
                            <Image 
                              src={product.primary_image} 
                              alt={product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight text-gray-900 mb-1">{product.name}</h4>
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2 rounded-full">
                            {product.category_name}
                          </Badge>
                          {product.short_description && (
                            <p className="text-xs text-gray-600 line-clamp-2">{product.short_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-extrabold text-emerald-700">
                          KES {product.price.toLocaleString()}
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => addProduct(product)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details Form */}
          <Card className="border border-emerald-200 overflow-hidden">
            <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
            <CardHeader className="bg-white border-b border-emerald-200">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Installation Details
              </CardTitle>
              <CardDescription>Provide details about your installation requirements</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-bold text-gray-700">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Solar Panel Installation for Home"
                    className="mt-1 border border-emerald-200"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-bold text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your installation requirements, any special considerations, etc."
                    rows={4}
                    className="mt-1 border border-emerald-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location_address" className="text-sm font-bold text-gray-700">Installation Address *</Label>
                    <Input
                      id="location_address"
                      value={formData.location_address}
                      onChange={(e) => setFormData({...formData, location_address: e.target.value})}
                      placeholder="Full address"
                      className="mt-1 border border-emerald-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location_city" className="text-sm font-bold text-gray-700">City *</Label>
                    <Input
                      id="location_city"
                      value={formData.location_city}
                      onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                      placeholder="City"
                      className="mt-1 border border-emerald-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_date" className="text-sm font-bold text-gray-700">Preferred Date</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="preferred_date"
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                        className="pl-10 border border-emerald-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="urgency" className="text-sm font-bold text-gray-700">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                      <SelectTrigger className="mt-1 border border-emerald-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Flexible timing</SelectItem>
                        <SelectItem value="normal">Normal - Within 2 weeks</SelectItem>
                        <SelectItem value="high">High - Within 1 week</SelectItem>
                        <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Products & Summary */}
        <div className="space-y-6">
          {/* Selected Products */}
          <Card className="border border-emerald-200 sticky top-4 overflow-hidden">
            <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
            <CardHeader className="bg-white border-b border-emerald-200">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  Selected Products
                </span>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-full">
                  {selectedProducts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No products selected yet</p>
                  <p className="text-gray-400 text-xs mt-1">Add products from the list</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-lg border border-emerald-200">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-emerald-700 font-semibold">
                          KES {product.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border border-emerald-200"
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-sm">{product.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border border-emerald-200"
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Summary */}
          {selectedProducts.length > 0 && (
            <Card className="border border-emerald-200 overflow-hidden">
              <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
              <CardHeader className="bg-white border-b border-emerald-200">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200">
                    <span className="text-sm font-semibold text-gray-700">Products Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      KES {getTotalCost().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                    <span className="text-sm font-semibold text-emerald-700">Installation Cost:</span>
                    <span className="text-sm text-emerald-600 font-semibold">Via Professional Bids</span>
                  </div>
                  {formData.urgency && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-emerald-200">
                      <p className="text-xs text-gray-600 mb-1">Urgency Level:</p>
                      {getUrgencyBadge(formData.urgency)}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-emerald-200">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-4">
                    <p className="text-xs text-emerald-700 font-semibold mb-1">Product Cost</p>
                    <p className="text-3xl font-extrabold text-emerald-700">
                      KES {getTotalCost().toLocaleString()}
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-bold"
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedProducts.length === 0 || !formData.title || !formData.location_address || !formData.location_city}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating Job...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Post Installation Job
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500 mt-3">
                    Professionals will bid on your installation project
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="border border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">Need Help?</h4>
                  <p className="text-xs text-gray-600">
                    After posting, qualified professionals will review and submit bids for your installation project.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}