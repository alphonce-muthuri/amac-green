"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories = [] }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [isOpen, setIsOpen] = useState(false)

  const currentCategory = searchParams.get("category")
  const currentSort = searchParams.get("sort") || "newest"

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters("search", searchTerm || null)
  }

  const clearFilters = () => {
    setSearchTerm("")
    router.push("/products")
  }

  const hasActiveFilters = searchParams.toString() !== ""

  const FilterContent = () => (
    <div className="space-y-0 divide-y divide-gray-100">

      {/* Search */}
      <div className="pb-6">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-4">Search</p>
        <form onSubmit={handleSearch} className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-3.5 w-3.5" />
            <Input
              id="search"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-200 focus-visible:ring-0 focus-visible:border-emerald-400 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="w-full bg-[#0b1a10] hover:bg-emerald-800 text-white rounded-lg h-8 text-xs"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Sort */}
      <div className="py-6">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-4">Sort By</p>
        <Select value={currentSort} onValueChange={(value) => updateFilters("sort", value)}>
          <SelectTrigger className="h-9 text-sm border-gray-200 focus:ring-0 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="py-6">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-4">Categories</p>
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="all-categories"
              checked={!currentCategory}
              onCheckedChange={() => updateFilters("category", null)}
              className="rounded-sm"
            />
            <Label htmlFor="all-categories" className="text-[13px] text-gray-600 cursor-pointer">
              All Categories
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2.5">
              <Checkbox
                id={category.slug}
                checked={currentCategory === category.slug}
                onCheckedChange={(checked) => updateFilters("category", checked ? category.slug : null)}
                className="rounded-sm"
              />
              <Label htmlFor={category.slug} className="text-[13px] text-gray-600 cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="pt-6">
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-6">Filters</p>
        <FilterContent />

        {/* Help nudge */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[12px] text-gray-500 font-medium mb-0.5">Need help choosing?</p>
          <p className="text-[12px] text-gray-400 mb-2">Talk to support for quick guidance.</p>
          <a
            href="/contact"
            className="text-[12px] text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
          >
            Contact support →
          </a>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="lg:hidden mb-6">
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-3.5 w-3.5" />
              <Input
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm border-gray-200 focus-visible:ring-0 focus-visible:border-emerald-400 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-[#0b1a10] hover:bg-emerald-800 text-white rounded-lg h-9 px-4 text-xs"
            >
              Search
            </Button>
          </form>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-gray-200 text-gray-600 rounded-lg text-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-emerald-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                    On
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-[13px] font-semibold text-gray-900 uppercase tracking-[0.2em]">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
