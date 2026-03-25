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
  Sparkles,
  Star,
  ShoppingCart,
  Tag,
  FileText,
  Rocket,
  Shield,
  Clock
} from "lucide-react"

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <Tag className="absolute inset-0 m-auto h-8 w-8 text-teal-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Pricing</p>
          <p className="text-sm text-gray-600 mt-1">Fetching professional rates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-emerald-300 shadow-sm">
              <div className="h-2 bg-teal-500/30" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-teal-700 border border-teal-800 rounded-2xl flex items-center justify-center shadow-sm">
                        <Tag className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-600 border border-amber-700 rounded-full flex items-center justify-center border-4 border-white shadow-sm ">
                        <Percent className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                        Professional Pricing
                      </h1>
                      <p className="text-lg text-gray-600">
                        Exclusive <span className="font-bold text-emerald-700">{getAverageDiscount()}%</span> discount on all products
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-teal-50 text-teal-800 border border-emerald-300">
                          <Star className="h-3 w-3 mr-1" />
                          Professional Rates
                        </Badge>
                        <Badge className="bg-emerald-50 text-green-800 border border-green-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Bulk Discounts
                        </Badge>
                        <Badge className="bg-orange-50 text-orange-800 border border-orange-200">
                          <Zap className="h-3 w-3 mr-1" />
                          Instant Savings
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-teal-600 border border-teal-700 rounded-full flex items-center justify-center shadow-sm shadow-sm">
                      <span className="text-xl font-bold tracking-tight text-white">{getAverageDiscount()}%</span>
                    </div>
                    <Badge className="bg-teal-600 text-white">Avg Discount</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-green-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-emerald-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                    <Percent className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white">Discount</Badge>
                </div>
                <p className="text-xl font-bold tracking-tight text-green-700 mb-1">{getAverageDiscount()}%</p>
                <p className="text-sm text-gray-600">Average Savings</p>
              </CardContent>
            </Card>

            <Card className="border border-teal-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-teal-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-600 text-white">Value</Badge>
                </div>
                <p className="text-xl font-bold tracking-tight text-emerald-700 mb-1">
                  {(getTotalSavings() / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Total Savings (KSH)</p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-blue-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600 text-white">Products</Badge>
                </div>
                <p className="text-xl font-bold tracking-tight text-blue-700 mb-1">{products.length}</p>
                <p className="text-sm text-gray-600">Available Items</p>
              </CardContent>
            </Card>

            <Card className="border border-teal-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-teal-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <Badge className="bg-teal-600 text-white">Categories</Badge>
                </div>
                <p className="text-xl font-bold tracking-tight text-emerald-700 mb-1">{categories.length}</p>
                <p className="text-sm text-gray-600">Product Types</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border border-teal-200">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search products by name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border border-teal-300 focus:border-emerald-500 text-base"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-cyan-200">
              <CardContent className="p-6">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 px-4 border border-cyan-300 rounded-lg focus:outline-none focus:border-cyan-500 text-base font-semibold"
                >
                  <option value="all">📦 All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </div>

          {/* Featured Products */}
          {products.filter(p => p.featured).length > 0 && (
            <Card className="border border-yellow-300 shadow-sm">
              <div className="h-2 bg-amber-500/30" />
            <CardHeader className="bg-white border-b border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-600 border border-amber-700 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Featured Products</CardTitle>
                    <CardDescription>Best-selling items with maximum savings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.filter(p => p.featured).map(product => (
                    <Card key={product.id} className="border border-yellow-200 hover:shadow-sm transition-all hover:shadow-sm">
                      <div className="h-1 bg-amber-500/30" />
              <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-amber-600 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          <Badge className="bg-green-600 text-white font-bold">
                            {product.discount}% OFF
                          </Badge>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 line-through">
                              KSH {product.regularPrice.toLocaleString()}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              KSH {product.professionalPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Min: {product.minOrder} units</span>
                            <span className="text-green-600 font-semibold">
                              Save KSH {(product.regularPrice - product.professionalPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card className="border border-gray-300">
            <CardHeader className="bg-gray-50 border-b-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Complete Price List</CardTitle>
                  <CardDescription className="text-base">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} with professional pricing
                  </CardDescription>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
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
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold">Product</TableHead>
                        <TableHead className="font-bold">Category</TableHead>
                        <TableHead className="font-bold">SKU</TableHead>
                        <TableHead className="font-bold">Regular Price</TableHead>
                        <TableHead className="font-bold">Pro Price</TableHead>
                        <TableHead className="font-bold">Savings</TableHead>
                        <TableHead className="font-bold">Min Order</TableHead>
                        <TableHead className="font-bold">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-emerald-50/50 transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-bold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-600">{product.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border font-semibold">{product.category}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">{product.sku}</TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500 line-through">
                              KSH {product.regularPrice.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-lg text-green-600">
                              KSH {product.professionalPrice.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                {product.discount}% OFF
                              </Badge>
                              <div className="text-sm text-green-600 font-semibold">
                                KSH {(product.regularPrice - product.professionalPrice).toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold">
                              {product.minOrder} unit{product.minOrder !== 1 ? 's' : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={product.stock > 20 ? "bg-green-600" : product.stock > 10 ? "bg-yellow-600" : "bg-red-600"}>
                              {product.stock} left
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Benefits */}
          <Card className="border border-teal-300 shadow-sm">
            <div className="h-2 bg-teal-500/30" />
            <CardHeader className="bg-white border-b border-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-700 border border-teal-800 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Professional Benefits</CardTitle>
                  <CardDescription>Exclusive advantages for verified professionals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start space-x-4 p-4 bg-emerald-50 rounded-xl border border-green-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 border border-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Percent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Bulk Discounts</h3>
                    <p className="text-sm text-gray-600">
                      Save up to {getAverageDiscount()}% on all products with professional pricing
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 border border-blue-700 flex items-center justify-center flex-shrink-0">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Project Calculator</h3>
                    <p className="text-sm text-gray-600">
                      Access tools to calculate project costs and requirements
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-teal-50 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 border border-teal-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Technical Docs</h3>
                    <p className="text-sm text-gray-600">
                      Download installation guides and technical specifications
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-12 h-12 rounded-xl bg-orange-600 border border-orange-700 flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Priority Support</h3>
                    <p className="text-sm text-gray-600">
                      Get priority customer support for your projects
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-teal-50/60 rounded-xl border border-teal-200">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 border border-teal-700 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Market Insights</h3>
                    <p className="text-sm text-gray-600">
                      Access market trends and product recommendations
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 border border-teal-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Flexible Payment</h3>
                    <p className="text-sm text-gray-600">
                      Extended payment terms for large projects
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}