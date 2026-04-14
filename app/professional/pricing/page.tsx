"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  Calculator, 
  Download, 
  Search,
  Percent,
  DollarSign,
  Package,
  TrendingUp,
  Zap,
  Award,
  Star,
  Tag,
  FileText,
  Rocket,
  Shield,
  Clock
} from "lucide-react"
import { AppShellSkeleton } from "@/components/loaders/page-skeletons"
import { ProfessionalPageShell } from "@/components/professional/professional-page-shell"

export default function ProfessionalPricingPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading products with professional pricing
    const mockProducts = [
      {
        id: 1,
        name: "Solar Panel 300W Monocrystalline",
        sku: "SP-300W-MC",
        category: "Solar Panels",
        regularPrice: 25000,
        professionalPrice: 18750,
        discount: 25,
        minOrder: 5,
        stock: 50,
        description: "High efficiency monocrystalline solar panel",
        featured: true
      },
      {
        id: 2,
        name: "Lithium Battery 100Ah 12V",
        sku: "LB-100Ah-12V",
        category: "Batteries",
        regularPrice: 45000,
        professionalPrice: 33750,
        discount: 25,
        minOrder: 2,
        stock: 30,
        description: "Deep cycle lithium battery for solar storage",
        featured: true
      },
      {
        id: 3,
        name: "Inverter 2kW Pure Sine Wave",
        sku: "INV-2kW-PSW",
        category: "Inverters",
        regularPrice: 35000,
        professionalPrice: 26250,
        discount: 25,
        minOrder: 1,
        stock: 20,
        description: "Pure sine wave inverter for clean power",
        featured: false
      },
      {
        id: 4,
        name: "Solar Panel 400W Monocrystalline",
        sku: "SP-400W-MC",
        category: "Solar Panels",
        regularPrice: 32000,
        professionalPrice: 24000,
        discount: 25,
        minOrder: 3,
        stock: 25,
        description: "High power monocrystalline solar panel",
        featured: true
      },
      {
        id: 5,
        name: "Charge Controller 60A MPPT",
        sku: "CC-60A-MPPT",
        category: "Charge Controllers",
        regularPrice: 15000,
        professionalPrice: 11250,
        discount: 25,
        minOrder: 2,
        stock: 40,
        description: "MPPT charge controller for optimal charging",
        featured: false
      },
      {
        id: 6,
        name: "Lithium Battery 200Ah 12V",
        sku: "LB-200Ah-12V",
        category: "Batteries",
        regularPrice: 85000,
        professionalPrice: 63750,
        discount: 25,
        minOrder: 1,
        stock: 15,
        description: "High capacity lithium battery for large systems",
        featured: true
      }
    ]
    
    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
    setLoading(false)
  }, [])

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  const getTotalSavings = () => {
    return products.reduce((total, product) => {
      const savings = product.regularPrice - product.professionalPrice
      return total + savings
    }, 0)
  }

  const getAverageDiscount = () => {
    const totalDiscount = products.reduce((total, product) => total + product.discount, 0)
    return Math.round(totalDiscount / products.length)
  }

  const categories = Array.from(new Set(products.map(p => p.category)))

  if (loading) {
    return <AppShellSkeleton />
  }

  return (
    <ProfessionalPageShell title="Pricing">
      <div className="space-y-4">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-2">Professional Pricing</p>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Minimal rates, maximum margin</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Save <span className="font-semibold text-emerald-700">{getAverageDiscount()}%</span> on every order.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">{products.length} items</Badge>
                <Badge className="bg-gray-100 text-gray-700 border border-gray-200">{categories.length} categories</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border border-gray-100 bg-white"><CardContent className="p-4"><p className="text-xs text-gray-500">Avg Discount</p><p className="text-xl font-semibold text-gray-900">{getAverageDiscount()}%</p></CardContent></Card>
          <Card className="border border-gray-100 bg-white"><CardContent className="p-4"><p className="text-xs text-gray-500">Total Savings</p><p className="text-xl font-semibold text-gray-900">KSH {getTotalSavings().toLocaleString()}</p></CardContent></Card>
          <Card className="border border-gray-100 bg-white"><CardContent className="p-4"><p className="text-xs text-gray-500">Featured</p><p className="text-xl font-semibold text-gray-900">{products.filter((p) => p.featured).length}</p></CardContent></Card>
        </div>

        <Card className="border border-gray-100">
          <CardContent className="p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by product, SKU, or category"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 border-gray-200"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 rounded-md border border-gray-100 bg-white px-3 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {products.filter((p) => p.featured).length > 0 && (
          <Card className="border border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Featured Deals</CardTitle>
              <CardDescription className="text-xs">Top margin products right now</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 md:grid-cols-2">
                {products
                  .filter((p) => p.featured)
                  .slice(0, 4)
                  .map((product) => (
                    <div key={product.id} className="rounded-lg border border-gray-100 p-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <Badge className="bg-emerald-600 text-white">{product.discount}% off</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                      <div className="mt-3 flex items-end justify-between">
                        <p className="text-xs text-gray-500 line-through">KSH {product.regularPrice.toLocaleString()}</p>
                        <p className="text-sm font-semibold text-emerald-700">KSH {product.professionalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border border-gray-100">
          <CardHeader className="bg-gray-50/60 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                <CardTitle className="text-base">Price List</CardTitle>
                  <CardDescription className="text-base">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} with professional pricing
                  </CardDescription>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Price List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60">
                        <TableHead className="font-bold">Product / SKU</TableHead>
                        <TableHead className="font-bold">Category</TableHead>
                        <TableHead className="font-bold">Retail</TableHead>
                        <TableHead className="font-bold">Your Price</TableHead>
                        <TableHead className="font-bold">Savings</TableHead>
                        <TableHead className="font-bold">MOQ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-50/70 transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border font-medium">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500 line-through">KSH {product.regularPrice.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-emerald-700">KSH {product.professionalPrice.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                {product.discount}% OFF
                              </Badge>
                              <div className="text-xs text-green-700 font-medium">KSH {(product.regularPrice - product.professionalPrice).toLocaleString()}</div>
                            </div>
                          </TableCell>
                          <TableCell><div className="text-sm">{product.minOrder}</div></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        <Card className="border border-emerald-100 bg-emerald-50/40">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ready to order with pro pricing?</p>
                <p className="text-xs text-gray-600 mt-0.5">Download this list or continue to bulk ordering for a fast checkout flow.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                  <Calculator className="h-4 w-4 mr-2" />
                  Estimate Project
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Prices
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfessionalPageShell>
  )
}