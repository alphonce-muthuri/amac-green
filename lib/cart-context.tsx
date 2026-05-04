"use client"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

/* -------------------------------------------------------------------------- */
/*                                 Types                                      */
/* -------------------------------------------------------------------------- */
export interface CartItem {
  productId: string
  name: string
  price: number
  image?: string
  quantity: number
  stock?: number
  sku?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem, options?: { silent?: boolean }) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, qty: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getItemCount: () => number // alias
  getTotalPrice: () => number
  isLoading: boolean
  syncWithDatabase: () => Promise<void>
}

/* -------------------------------------------------------------------------- */
/*                           Context Declaration                              */
/* -------------------------------------------------------------------------- */
const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}

const LS_KEY = "amac_green_cart"

/* -------------------------------------------------------------------------- */
/*                              Provider                                      */
/* -------------------------------------------------------------------------- */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  /* -------- Load cart from localStorage – runs once on mount ------------- */
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        localStorage.removeItem(LS_KEY)
      }
    }
  }, [])

  /* -------- Persist cart to localStorage whenever it changes ------------- */
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items])

  /* -------- Sync with DB when user logs in (or on demand) ---------------- */
  useEffect(() => {
    if (user) void syncWithDatabase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const syncWithDatabase = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      /* SELECT with foreign-key joins that exist:
         shopping_cart.product_id  →  products.id
         products.id              →  product_images.product_id   */
      const { data, error } = await supabase
        .from("shopping_cart")
        .select(
          `
          product_id,
          quantity,
          products (
            name,
            price,
            sku,
            inventory_quantity,
            product_images (
              image_url,
              is_primary
            )
          )
        `,
        )
        .eq("user_id", user.id)

      if (error) throw error

      const dbItems: CartItem[] =
        data?.map((row: any) => ({
          productId: row.product_id,
          name: row.products.name,
          price: row.products.price,
          sku: row.products.sku,
          stock: row.products.inventory_quantity,
          image:
            row.products.product_images?.find((img: any) => img.is_primary)?.image_url ||
            row.products.product_images?.[0]?.image_url,
          quantity: row.quantity,
        })) ?? []

      /* Merge with any items currently in local memory */
      const merged: CartItem[] = []
      const handled = new Set<string>()

      dbItems.forEach((db) => {
        const localMatch = items.find((i) => i.productId === db.productId)
        if (localMatch) {
          const desired = Math.max(db.quantity, localMatch.quantity)
          const qty = db.stock != null ? Math.min(desired, db.stock) : desired
          merged.push({ ...db, quantity: qty })
        } else {
          merged.push(db)
        }
        handled.add(db.productId)
      })

      const newItems = items.filter((local) => !handled.has(local.productId))
      setItems([...merged, ...newItems])

      newItems.forEach(async (local) => {
        /* push missing local item to DB */
        await supabase.from("shopping_cart").insert({
          user_id: user.id,
          product_id: local.productId,
          quantity: local.quantity,
        })
      })
    } catch (err) {
      console.error("Error syncing cart:", err)
      toast({
        title: "Cart Sync Failed",
        description: "Using local cart only.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                         Mutating Helpers                               */
  /* ---------------------------------------------------------------------- */
  const addToCart = async (item: CartItem, options?: { silent?: boolean }) => {
    const maxQty = item.stock != null ? item.stock : Number.MAX_SAFE_INTEGER
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        const qty = Math.min(existing.quantity + item.quantity, maxQty)
        return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: qty } : i))
      }
      return [...prev, { ...item, quantity: Math.min(item.quantity, maxQty) }]
    })

    if (user) {
      await supabase.from("shopping_cart").upsert(
        {
          user_id: user.id,
          product_id: item.productId,
          quantity: item.quantity,
        },
        { onConflict: "user_id,product_id" },
      )
    }
    if (!options?.silent) {
      toast({ title: "Added to cart", description: `${item.name} added.` })
    }
  }

  const removeFromCart = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
    if (user) {
      await supabase.from("shopping_cart").delete().eq("user_id", user.id).eq("product_id", productId)
    }
  }

  const updateQuantity = async (productId: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)))
    if (user) {
      await supabase.from("shopping_cart").update({ quantity: qty }).eq("user_id", user.id).eq("product_id", productId)
    }
  }

  const clearCart = async () => {
    setItems([])
    localStorage.removeItem(LS_KEY)
    if (user) await supabase.from("shopping_cart").delete().eq("user_id", user.id)
  }

  /* ---------------------------------------------------------------------- */
  /*                           Derived Helpers                              */
  /* ---------------------------------------------------------------------- */
  const getTotalItems = () => items.reduce((sum, i) => sum + i.quantity, 0)
  const getItemCount = () => getTotalItems() // alias for legacy code
  const getTotalPrice = () => items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  /* ---------------------------------------------------------------------- */
  /*                               Value                                    */
  /* ---------------------------------------------------------------------- */
  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getItemCount,
    getTotalPrice,
    isLoading,
    syncWithDatabase,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
