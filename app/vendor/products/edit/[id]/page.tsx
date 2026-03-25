"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Sparkles, Save, Package, Edit } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { getProductById, updateProduct, getProductCategories } from "@/app/actions/products"
import type { ProductCategory } from "@/lib/types/product"
import { useAuth } from "@/lib/auth-context"

export default function EditProductPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [productImages, setProductImages] = useState<{ url: string; alt?: string; isPrimary?: boolean }[]>([])
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const loadData = useCallback(async () => {
    setLoading(true)

    const product = await getProductById(productId)
    const categoriesResult = await getProductCategories()

    if (product) {
      setProduct(product)

      if (product.product_images) {
        const images = product.product_images
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => ({
            url: img.image_url,
            alt: img.alt_text,
            isPrimary: img.is_primary,
          }))
        setProductImages(images)
      }
    } else {
      setMessage({ type: "error", text: "Product not found" })
    }

    if (categoriesResult.success) {
      setCategories(categoriesResult.data || [])
    }

    setLoading(false)
  }, [productId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setMessage(null)

    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to edit a product" })
      setIsSubmitting(false)
      return
    }

    formData.append("userId", user.id)

    if (productImages.length > 0) {
      formData.append("images", JSON.stringify(productImages))
    }

    const result = await updateProduct(productId, formData)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <Edit className="absolute inset-0 m-auto h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Product</p>
          <p className="text-sm text-gray-600 mt-1">Please wait...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-red-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Not Found</h3>
                <p className="text-gray-600 mb-6">The product you're looking for doesn't exist</p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/vendor/products">Back to Products</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-indigo-300 shadow-md">
              <div className="h-2 bg-indigo-500/30" />
              <CardContent className="relative p-6 sm:p-8">
                <Link href="/vendor/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4 font-semibold">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-700 border border-indigo-800 rounded-xl flex items-center justify-center shadow-md">
                    <Edit className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Edit Product</h1>
                    <p className="text-lg text-gray-600">Update your product information</p>
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
                      <Package className="h-5 w-5 text-red-600" />
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
                    <Input id="name" name="name" required defaultValue={product.name} className="border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-sm font-bold text-gray-900">SKU</Label>
                    <Input id="sku" name="sku" defaultValue={product.sku || ""} className="border h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-sm font-bold text-gray-900">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    defaultValue={product.short_description || ""}
                    maxLength={500}
                    className="border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-bold text-gray-900">Full Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    defaultValue={product.description || ""} 
                    rows={6}
                    className="border" 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-sm font-bold text-gray-900">Category</Label>
                    <Select name="categoryId" defaultValue={product.category_id || ""}>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-bold text-gray-900">Status</Label>
                    <Select name="status" defaultValue={product.status}>
                      <SelectTrigger className="border h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Draft</SelectItem>
                        <SelectItem value="active">✅ Active</SelectItem>
                        <SelectItem value="inactive">⏸️ Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="border border-purple-200 shadow-sm">
              <div className="h-2 bg-purple-500/30" />
            <CardHeader className="bg-white border-b border-purple-200">
                <CardTitle className="text-xl">Product Images</CardTitle>
                <CardDescription>Update your product images</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUpload onImagesChange={setProductImages} maxImages={5} existingImages={productImages} />
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
                <CardDescription>Update your product pricing</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold text-gray-900">Selling Price * (KSH)</Label>
                    <Input 
                      id="price" 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      required 
                      defaultValue={product.price}
                      className="border h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice" className="text-sm font-bold text-gray-900">Compare Price (KSH)</Label>
                    <Input
                      id="comparePrice"
                      name="comparePrice"
                      type="number"
                      step="0.01"
                      defaultValue={product.compare_price || ""}
                      className="border h-11"
                    />
                    <p className="text-xs text-gray-500">Original price for discounts</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventoryQuantity" className="text-sm font-bold text-gray-900">Stock Quantity</Label>
                    <Input
                      id="inventoryQuantity"
                      name="inventoryQuantity"
                      type="number"
                      defaultValue={product.inventory_quantity}
                      className="border h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 hover:bg-indigo-700 text-base font-bold shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border border-white border-t-transparent mr-2"></div>
                    Updating Product...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Product
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


