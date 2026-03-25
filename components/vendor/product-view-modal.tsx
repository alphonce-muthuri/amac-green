"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProductViewModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
}

export function ProductViewModal({ product, isOpen, onClose }: ProductViewModalProps) {
  if (!product) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            {getStatusBadge(product.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Images */}
          {product.product_images && product.product_images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Product Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.product_images
                  .sort((a: any, b: any) => a.sort_order - b.sort_order)
                  .map((image: any, index: number) => (
                    <div key={image.id} className="relative">
                      <Image
                        src={image.image_url || "/placeholder.svg"}
                        alt={image.alt_text}
                        width={400}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {image.is_primary && <Badge className="absolute top-2 left-2 text-xs">Primary</Badge>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span>{product.sku || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span>{product.product_categories?.name || "Uncategorized"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Pricing & Inventory</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">KSH {product.price}</span>
                </div>
                {product.compare_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compare Price:</span>
                    <span className="line-through text-gray-500">KSH {product.compare_price}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span>{product.inventory_quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Stock Alert:</span>
                  <span>{product.low_stock_threshold} units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          {product.short_description && (
            <div>
              <h3 className="font-semibold mb-2">Short Description</h3>
              <p className="text-gray-600 text-sm">{product.short_description}</p>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Full Description</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Specifications</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span>{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Properties */}
          {(product.weight || product.dimensions_length) && (
            <div>
              <h3 className="font-semibold mb-3">Physical Properties</h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span>{product.weight} kg</span>
                  </div>
                )}
                {product.dimensions_length && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span>
                      {product.dimensions_length} × {product.dimensions_width} × {product.dimensions_height} cm
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(product.warranty_info || product.shipping_info) && (
            <div className="space-y-4">
              {product.warranty_info && (
                <div>
                  <h3 className="font-semibold mb-2">Warranty Information</h3>
                  <p className="text-gray-600 text-sm">{product.warranty_info}</p>
                </div>
              )}
              {product.shipping_info && (
                <div>
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <p className="text-gray-600 text-sm">{product.shipping_info}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
