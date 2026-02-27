import { notFound } from "next/navigation"
import { getProductById } from "@/app/actions/products"
import { ProductDetail } from "@/components/products/product-detail"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} relatedProducts={[]} />
      </div>
    </div>
  )
}
