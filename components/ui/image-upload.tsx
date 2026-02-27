"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { uploadProductImage, deleteProductImage } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

interface ImageUploadProps {
  onImagesChange?: (images: { url: string; alt?: string; isPrimary?: boolean }[]) => void
  maxImages?: number
  existingImages?: { url: string; alt?: string; isPrimary?: boolean }[]
  productId?: string
}

export function ImageUpload({ onImagesChange, maxImages = 5, existingImages = [], productId }: ImageUploadProps) {
  const [images, setImages] =
    useState<{ url: string; alt?: string; isPrimary?: boolean; uploading?: boolean }[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    setUploading(true)

    try {
      // Get current user for vendor ID
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please log in to upload images")
        return
      }

      const newImages = []

      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB.`)
          continue
        }

        // Add placeholder while uploading
        const placeholderImage = {
          url: URL.createObjectURL(file),
          alt: file.name,
          isPrimary: images.length === 0 && newImages.length === 0,
          uploading: true,
        }

        newImages.push(placeholderImage)
        setImages((prev) => [...prev, placeholderImage])

        // Upload to storage
        const uploadResult = await uploadProductImage(file, user.id, productId || "temp")

        if (uploadResult.success && uploadResult.url) {
          // Replace placeholder with actual URL
          setImages((prev) =>
            prev.map((img) =>
              img.url === placeholderImage.url ? { ...img, url: uploadResult.url!, uploading: false } : img,
            ),
          )

          // Clean up blob URL
          URL.revokeObjectURL(placeholderImage.url)
        } else {
          // Remove failed upload
          setImages((prev) => prev.filter((img) => img.url !== placeholderImage.url))
          alert(`Failed to upload ${file.name}: ${uploadResult.error}`)
        }
      }

      // Update parent component
      const finalImages = images.filter((img) => !img.uploading).map(({ uploading, ...img }) => img)

      onImagesChange?.(finalImages)
    } catch (error) {
      alert("Error processing images. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]

    // Delete from storage if it's a real URL (not blob)
    if (imageToRemove.url && !imageToRemove.url.startsWith("blob:")) {
      await deleteProductImage(imageToRemove.url)
    }

    // Revoke object URL to prevent memory leaks
    if (imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url)
    }

    const updatedImages = images.filter((_, i) => i !== index)

    // If we removed the primary image, make the first remaining image primary
    if (imageToRemove.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }

    setImages(updatedImages)
    onImagesChange?.(updatedImages.map(({ uploading, ...img }) => img))
  }

  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    setImages(updatedImages)
    onImagesChange?.(updatedImages.map(({ uploading, ...img }) => img))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"
        } ${images.length >= maxImages ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Uploading images...</span>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop images here, or click to select</p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG, WEBP up to 5MB each ({images.length}/{maxImages} images)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= maxImages}
            >
              Choose Images
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />

                  {/* Upload indicator */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}

                  {/* Primary Badge */}
                  {image.isPrimary && !image.uploading && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      {!image.isPrimary && (
                        <Button type="button" size="sm" variant="secondary" onClick={() => setPrimaryImage(index)}>
                          Set Primary
                        </Button>
                      )}
                      <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {images
        .filter((img) => !img.uploading)
        .map((image, index) => (
          <div key={index}>
            <input type="hidden" name={`image_${index}_url`} value={image.url} />
            <input type="hidden" name={`image_${index}_alt`} value={image.alt || ""} />
            <input type="hidden" name={`image_${index}_primary`} value={image.isPrimary ? "true" : "false"} />
          </div>
        ))}
    </div>
  )
}
