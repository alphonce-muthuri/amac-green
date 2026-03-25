"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, Plus, Minus, Sparkles, Save, Package } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createProduct, getProductCategories } from "@/app/actions/products"
import type { ProductCategory } from "@/lib/types/product"
import { ImageUpload } from "@/components/ui/image-upload"
import { useAuth } from "@/lib/auth-context"

export default function AddProductPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [formData, setFormData] = useState({
    categoryId: "",
    status: "draft",
    trackInventory: true,
    isFeatured: false,
  })
  const [productImages, setProductImages] = useState<{ url: string; alt?: string; isPrimary?: boolean }[]>([])
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const result = await getProductCategories()
    if (result.success) {
      setCategories(result.data || [])
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setMessage(null)

    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to create a product" })
      setIsSubmitting(false)
      return
    }

    formData.append("userId", user.id)

    const specsObject = specifications.reduce(
      (acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value
        }
        return acc
      },
      {} as Record<string, string>,
    )

    formData.append("specifications", JSON.stringify(specsObject))
    formData.append("tags", tags.join(","))

    const result = await createProduct(formData)

    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setTimeout(() => {
        router.push("/vendor/products")
      }, 2000)
    } else {
      setMessage({ type: "error", text: result.error })
    }

    setIsSubmitting(false)
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specifications]
    updated[index][field] = value
    setSpecifications(updated)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-purple-300 shadow-md">
              <div className="h-2 bg-purple-500/30" />
              <CardContent className="relative p-6 sm:p-8">
                <Link href="/vendor/products" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 font-semibold">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-purple-700 border border-purple-800 rounded-xl flex items-center justify-center shadow-md">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Add New Product</h1>
                    <p className="text-lg text-gray-600">Create a new product listing for your store</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success/Error Message */}
          {message && (
            <Card className={`border ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            } shadow-sm animate-in fade-in duration-200`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.type === "success" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {message.type === "success" ? (
                      <Sparkles className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className={`font-semibold ${
                    message.type === "success" ? "text-green-800" : "text-red-800"
                  }`}>
                    {message.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <form action={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border border-blue-200 shadow-sm">
              <div className="h-2 bg-blue-500/30" />
            <CardHeader className="bg-white border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-700 border border-blue-800 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                    <CardDescription>Essential product details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold text-gray-900">Product Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Solar Panel 300W" className="border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-sm font-bold text-gray-900">SKU</Label>
                    <Input id="sku" name="sku" placeholder="e.g., SP-300W-001" className="border h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-sm font-bold text-gray-900">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="Brief product description (max 500 characters)"
                    maxLength={500}
                    className="border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-bold text-gray-900">Full Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed product description, features, and benefits"
                    rows={6}
                    className="border"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-sm font-bold text-gray-900">Category</Label>
                    <Select name="categoryId" onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger className="border h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="categoryId" value={formData.categoryId} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-bold text-gray-900">Status</Label>
                    <Select name="status" onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="border h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Draft</SelectItem>
                        <SelectItem value="active">✅ Active</SelectItem>
                        <SelectItem value="inactive">⏸️ Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="status" value={formData.status} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="border border-purple-200 shadow-sm">
              <div className="h-2 bg-purple-500/30" />
            <CardHeader className="bg-white border-b border-purple-200">
                <CardTitle className="text-xl">Product Images</CardTitle>
                <CardDescription>Upload high-quality images (max 5)</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUpload maxImages={5} />
                <p className="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  💡 The first image will be used as the main product image
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border border-green-200 shadow-sm">
              <div className="h-2 bg-emerald-500/30" />
            <CardHeader className="bg-white border-b border-emerald-200">
                <CardTitle className="text-xl">Pricing</CardTitle>
                <CardDescription>Set your product pricing</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold text-gray-900">Selling Price * (KSH)</Label>
                    <Input id="price" name="price" type="number" step="0.01" required placeholder="29999" className="border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice" className="text-sm font-bold text-gray-900">Compare Price (KSH)</Label>
                    <Input id="comparePrice" name="comparePrice" type="number" step="0.01" placeholder="39999" className="border h-11" />
                    <p className="text-xs text-gray-500">Original price for discounts</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice" className="text-sm font-bold text-gray-900">Cost Price (KSH)</Label>
                    <Input id="costPrice" name="costPrice" type="number" step="0.01" placeholder="19999" className="border h-11" />
                    <p className="text-xs text-gray-500">Your cost (private)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card className="border border-orange-200 shadow-sm">
              <div className="h-2 bg-orange-500/30" />
            <CardHeader className="bg-white border-b border-orange-200">
                <CardTitle className="text-xl">Inventory</CardTitle>
                <CardDescription>Manage stock levels</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Checkbox
                    id="trackInventory"
                    name="trackInventory"
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) => setFormData({ ...formData, trackInventory: checked as boolean })}
                  />
                  <Label htmlFor="trackInventory" className="font-semibold">Track inventory quantity</Label>
                  <input type="hidden" name="trackInventory" value={formData.trackInventory.toString()} />
                </div>

                {formData.trackInventory && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inventoryQuantity" className="text-sm font-bold text-gray-900">Current Stock</Label>
                      <Input id="inventoryQuantity" name="inventoryQuantity" type="number" defaultValue="0" className="border h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold" className="text-sm font-bold text-gray-900">Low Stock Alert</Label>
                      <Input id="lowStockThreshold" name="lowStockThreshold" type="number" defaultValue="5" className="border h-11" />
                      <p className="text-xs text-gray-500">Alert when stock falls below this</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card className="border border-teal-200 shadow-sm">
              <div className="h-2 bg-teal-500/30" />
            <CardHeader className="bg-white border-b border-teal-200">
                <CardTitle className="text-xl">Shipping</CardTitle>
                <CardDescription>Physical product details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-bold text-gray-900">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" step="0.01" placeholder="25.5" className="border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensionsLength" className="text-sm font-bold text-gray-900">Length (cm)</Label>
                    <Input id="dimensionsLength" name="dimensionsLength" type="number" step="0.1" placeholder="165" className="border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensionsWidth" className="text-sm font-bold text-gray-900">Width (cm)</Label>
                    <Input id="dimensionsWidth" name="dimensionsWidth" type="number" step="0.1" placeholder="99" className="border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensionsHeight" className="text-sm font-bold text-gray-900">Height (cm)</Label>
                    <Input id="dimensionsHeight" name="dimensionsHeight" type="number" step="0.1" placeholder="4" className="border h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingInfo" className="text-sm font-bold text-gray-900">Shipping Information</Label>
                  <Textarea
                    id="shippingInfo"
                    name="shippingInfo"
                    placeholder="Special shipping instructions, delivery time, etc."
                    className="border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="border border-indigo-200 shadow-sm">
              <div className="h-2 bg-indigo-500/30"></div>
              <CardHeader className="bg-white border-b border-indigo-200">
                <CardTitle className="text-xl">Specifications</CardTitle>
                <CardDescription>Technical specifications and features</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <Label htmlFor={`spec-key-${index}`} className="text-sm font-bold">Specification</Label>
                        <Input
                          id={`spec-key-${index}`}
                          value={spec.key}
                          onChange={(e) => updateSpecification(index, "key", e.target.value)}
                          placeholder="e.g., Power Output"
                          className="border h-11 mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`spec-value-${index}`} className="text-sm font-bold">Value</Label>
                        <Input
                          id={`spec-value-${index}`}
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, "value", e.target.value)}
                          placeholder="e.g., 300W"
                          className="border h-11 mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                        className="h-11 border"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSpecification} className="w-full border border-indigo-300 hover:bg-indigo-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="warrantyInfo" className="text-sm font-bold text-gray-900">Warranty Information</Label>
                  <Textarea
                    id="warrantyInfo"
                    name="warrantyInfo"
                    placeholder="Warranty terms, duration, and coverage details"
                    className="border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 hover:bg-purple-700 text-base font-bold shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border border-white border-t-transparent mr-2"></div>
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Product
                    <Sparkles className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="h-14 border font-bold">
                <Link href="/vendor/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
</div>
  )
}


