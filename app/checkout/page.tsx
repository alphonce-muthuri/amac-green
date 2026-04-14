"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Smartphone, Banknote, Lock, ArrowLeft, CheckCircle,
  Calculator, MapPin, ShoppingBag, ArrowRight, Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { createOrder, checkDeliveryAssignment, manuallyAssignDelivery } from "@/app/actions/orders"
import { toast } from "@/hooks/use-toast"
import { SiteHeader } from "@/components/site-header"
import { KenyaLocationFields } from "@/components/checkout/kenya-location-fields"
import { supabase } from "@/lib/supabase"
import {
  getEnhancedLocationCategorySlug,
  getFinancingAutoApproveMsClient,
  isFinancingCheckoutEnabled,
} from "@/lib/feature-flags"
import { persistSimulatedOrderSnapshot } from "@/lib/checkout-simulated-order"
import Link from "next/link"

const STEPS = [
  { num: 1, label: "Shipping"  },
  { num: 2, label: "Billing"   },
  { num: 3, label: "Delivery"  },
  { num: 4, label: "Payment"   },
  { num: 5, label: "Review"    },
]

// Stable label — defined outside so it never re-mounts on parent re-renders
function Lbl({ children }: { children: React.ReactNode }) {
  return <Label className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.15em]">{children}</Label>
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrder, setSuccessOrder] = useState<any>(null)
  const [needsEnhancedLocation, setNeedsEnhancedLocation] = useState(false)
  const enableFinancingCheckout = isFinancingCheckoutEnabled()
  const enhancedLocationSlug = getEnhancedLocationCategorySlug()
  const [isCheckingProducts, setIsCheckingProducts] = useState(true)

  const [formData, setFormData] = useState({
    shipping_first_name: "",
    shipping_last_name: "",
    shipping_email: "",
    shipping_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "Kenya",
    billing_first_name: "",
    billing_last_name: "",
    billing_email: "",
    billing_phone: "",
    billing_address: "",
    billing_city: "",
    billing_postal_code: "",
    billing_country: "Kenya",
    payment_method: "mpesa",
    mpesa_phone: "",
    notes: "",
    needs_delivery: true,
    delivery_address_same: true,
    delivery_first_name: "",
    delivery_last_name: "",
    delivery_phone: "",
    delivery_address: "",
    delivery_city: "",
    delivery_postal_code: "",
    delivery_country: "Kenya",
    delivery_instructions: "",
    county: "",
    sub_county: "",
    ward: "",
    sub_location: "",
    street_address: "",
    landmark: "",
    gas_delivery_instructions: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const subtotal = getTotalPrice()
  const shipping = subtotal > 5000 ? 0 : 1
  const tax = subtotal * 0.16
  const total = subtotal + shipping + tax

  // ── Pre-populate from user profile ──────────────────────
  useEffect(() => {
    if (!user) return
    const meta = (user as any).user_metadata || {}
    setFormData((prev) => ({
      ...prev,
      shipping_first_name: meta.first_name  || prev.shipping_first_name,
      shipping_last_name:  meta.last_name   || prev.shipping_last_name,
      shipping_email:      user.email       || prev.shipping_email,
      shipping_phone:      meta.phone       || prev.shipping_phone,
      shipping_address:    meta.address     || prev.shipping_address,
      shipping_city:       meta.city        || prev.shipping_city,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Check for enhanced-location products ────────────────
  useEffect(() => {
    const check = async () => {
      if (items.length === 0) { setIsCheckingProducts(false); return }
      try {
        const { data: products, error } = await supabase
          .from("products")
          .select(`id, category_id, product_categories!inner (name, slug)`)
          .in("id", items.map((i) => i.productId))
        if (error) { setIsCheckingProducts(false); return }
        setNeedsEnhancedLocation(
          products?.some((p: any) => p.product_categories?.slug === enhancedLocationSlug) ?? false
        )
      } catch { /* ignore */ }
      finally { setIsCheckingProducts(false) }
    }
    void check()
  }, [items, enhancedLocationSlug])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const normalizePhone = (s: string) => s.replace(/\s/g, "")

  // ── Per-step validation ──────────────────────────────────
  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {}
    const n = normalizePhone

    if (step === 1) {
      const ph = n(formData.shipping_phone)
      if (!formData.shipping_first_name?.trim()) e.shipping_first_name = "First name is required"
      if (!formData.shipping_last_name?.trim())  e.shipping_last_name  = "Last name is required"
      if (!formData.shipping_email?.trim())       e.shipping_email      = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.shipping_email.trim())) e.shipping_email = "Enter a valid email"
      if (!ph) e.shipping_phone = "Phone number is required"
      else if (!/^(\+254|0)[17]\d{8}$/.test(ph)) e.shipping_phone = "Enter a valid Kenyan number (e.g. 0712345678)"
      if (!formData.shipping_address?.trim()) e.shipping_address = "Address is required"
      if (!formData.shipping_city?.trim())    e.shipping_city    = "City is required"
    }

    if (step === 2 && !sameAsShipping) {
      if (!formData.billing_first_name) e.billing_first_name = "First name is required"
      if (!formData.billing_last_name)  e.billing_last_name  = "Last name is required"
      if (!formData.billing_email)      e.billing_email      = "Email is required"
      if (!formData.billing_phone)      e.billing_phone      = "Phone is required"
      if (!formData.billing_address)    e.billing_address    = "Address is required"
      if (!formData.billing_city)       e.billing_city       = "City is required"
    }

    if (step === 3 && formData.needs_delivery && !formData.delivery_address_same) {
      const ph = n(formData.delivery_phone)
      if (!formData.delivery_first_name?.trim()) e.delivery_first_name = "Contact name is required"
      if (!ph)                                    e.delivery_phone      = "Contact phone is required"
      else if (!/^(\+254|0)[17]\d{8}$/.test(ph)) e.delivery_phone      = "Enter a valid Kenyan number"
      if (!formData.delivery_address?.trim()) e.delivery_address = "Delivery address is required"
      if (!formData.delivery_city?.trim())    e.delivery_city    = "City is required"
    }
    if (step === 3 && needsEnhancedLocation) {
      if (!formData.county?.trim())       e.county       = "County is required"
      if (!formData.sub_county?.trim())   e.sub_county   = "Sub-County is required"
      if (!formData.ward?.trim())         e.ward         = "Ward/Location is required"
      if (!formData.sub_location?.trim()) e.sub_location = "Sub-Location is required"
      if (!formData.street_address?.trim()) e.street_address = "Street address is required"
      if (!formData.landmark?.trim())       e.landmark       = "Landmark is required"
    }

    if (step === 4 && formData.payment_method === "mpesa") {
      const ph = n(formData.mpesa_phone)
      if (!ph) e.mpesa_phone = "M-Pesa number is required"
      else if (!/^(\+254|254|0)[17]\d{8}$/.test(ph)) e.mpesa_phone = "Enter a valid Kenyan number"
    }

    setErrors(e)
    const allTouched: Record<string, boolean> = {}
    Object.keys(e).forEach((k) => { allTouched[k] = true })
    setTouched((prev) => ({ ...prev, ...allTouched }))
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length))
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      setTimeout(() => {
        document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
    }
  }

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // ── Order submission ─────────────────────────────────────
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setIsProcessing(true)
    try {
      const shipPhoneNorm     = normalizePhone(formData.shipping_phone)
      const mpesaPhoneNorm    = normalizePhone(formData.mpesa_phone)
      const billingPhoneNorm  = normalizePhone(formData.billing_phone)
      const deliveryPhoneNorm = normalizePhone(formData.delivery_phone)

      const billingAddress = sameAsShipping
        ? { billing_first_name: formData.shipping_first_name, billing_last_name: formData.shipping_last_name, billing_email: formData.shipping_email, billing_phone: shipPhoneNorm, billing_address: formData.shipping_address, billing_city: formData.shipping_city, billing_postal_code: formData.shipping_postal_code, billing_country: formData.shipping_country }
        : { billing_first_name: formData.billing_first_name, billing_last_name: formData.billing_last_name, billing_email: formData.billing_email, billing_phone: billingPhoneNorm, billing_address: formData.billing_address, billing_city: formData.billing_city, billing_postal_code: formData.billing_postal_code, billing_country: formData.billing_country }

      const deliveryAddress = formData.delivery_address_same
        ? { delivery_first_name: formData.shipping_first_name, delivery_last_name: formData.shipping_last_name, delivery_phone: shipPhoneNorm, delivery_address: formData.shipping_address, delivery_city: formData.shipping_city, delivery_postal_code: formData.shipping_postal_code, delivery_country: formData.shipping_country }
        : { delivery_first_name: formData.delivery_first_name, delivery_last_name: formData.delivery_last_name, delivery_phone: deliveryPhoneNorm, delivery_address: formData.delivery_address, delivery_city: formData.delivery_city, delivery_postal_code: formData.delivery_postal_code, delivery_country: formData.delivery_country }

      const gasYetuLocationData = needsEnhancedLocation
        ? { gas_yetu_county: formData.county, gas_yetu_sub_county: formData.sub_county, gas_yetu_ward: formData.ward, gas_yetu_sub_location: formData.sub_location, gas_yetu_street_address: formData.street_address, gas_yetu_landmark: formData.landmark, gas_yetu_delivery_instructions: formData.gas_delivery_instructions }
        : {}

      const orderData = {
        ...formData, shipping_phone: shipPhoneNorm, mpesa_phone: mpesaPhoneNorm,
        payment_method: formData.payment_method === "kcb_financing_pending" ? "kcb_financing_pending" : formData.payment_method,
        ...billingAddress, ...deliveryAddress, ...gasYetuLocationData,
        subtotal, shipping_cost: shipping, tax_amount: tax, total_amount: total,
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity, price: item.price })),
      }

      const result = await createOrder(orderData, user!.id)
      if (!result.success) throw new Error(result.error || "Failed to create order")

      if ("simulation" in result && result.simulation && result.order?.id) {
        persistSimulatedOrderSnapshot(result.order.id, result.order as Record<string, unknown>,
          items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })))
      }

      if (formData.payment_method === "kcb_financing_pending" && result.order?.id) {
        await clearCart()
        const ms = getFinancingAutoApproveMsClient()
        if (ms > 0) {
          window.setTimeout(() => {
            void fetch("/api/kcb-financing/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: result.order.id, outcome: "approved" }) })
          }, ms)
        }
        toast({ title: "Financing submitted", description: ms > 0 ? "Simulated approval will run shortly." : "Pending KCB review." })
        setIsProcessing(false)
        router.push(`/checkout/success?order=${result.order.id}&financing=pending`)
        return
      }

      if (process.env.NODE_ENV === "development") {
        setTimeout(async () => {
          const dc = await checkDeliveryAssignment(result.order.id)
          if (!dc.hasDelivery) await manuallyAssignDelivery(result.order.id)
        }, 2000)
      }

      if (formData.payment_method === "mpesa" && result.order?.id) {
        const res = await fetch("/api/daraja/initialize", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: mpesaPhoneNorm, amount: total, orderId: result.order.id, customerName: `${formData.shipping_first_name} ${formData.shipping_last_name}`, email: formData.shipping_email }),
        })
        const mpesaData = await res.json()
        if (mpesaData.success) {
          await clearCart()
          toast({ title: "Payment Request Sent", description: "Check your phone and enter your M-Pesa PIN." })
          setIsProcessing(false)
          router.push(`/checkout/success?order=${result.order.id}&mpesa=true&checkout=${mpesaData.data.checkoutRequestID}`)
        } else {
          throw new Error(mpesaData.error || "Failed to initialize M-Pesa payment")
        }
      } else {
        await clearCart()
        toast({ title: "Order Placed!", description: `Order #${result.order?.order_number} confirmed.` })
        setIsProcessing(false)
        router.push(`/checkout/success?order=${result.order?.id}`)
      }
    } catch (error) {
      toast({ title: "Order Failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
      setIsProcessing(false)
    }
  }

  // ── Field helpers ────────────────────────────────────────
  const inputCls = (field: string) => {
    const hasErr = touched[field] && errors[field]
    return `h-11 rounded-none border-0 border-b text-sm bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors ${hasErr ? "border-red-400" : "border-gray-200 focus:border-emerald-700"}`
  }
  const textareaCls = (field: string) => {
    const err = touched[field] && errors[field]
    return `rounded-none border-0 border-b text-sm bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none transition-colors ${err ? "border-red-400" : "border-gray-200 focus:border-emerald-700"}`
  }
  // render-functions (not components) — avoids remounting on every keystroke
  const err = (field: string) => {
    const msg = touched[field] ? errors[field] : undefined
    return msg ? <p data-error="true" className="text-xs text-red-500 mt-1.5">{msg}</p> : null
  }

  const paymentOptions = [
    { value: "mpesa", label: "M-Pesa", description: "Pay via STK push to your mobile", icon: Smartphone },
    { value: "cod",   label: "Cash on Delivery", description: "Pay when your order arrives", icon: Banknote },
    ...(enableFinancingCheckout
      ? [{ value: "kcb_financing_pending", label: "KCB Financing", description: "Apply first — pay after approval", icon: Calculator }]
      : []),
  ]

  // ── Guards ───────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center mx-auto mb-8">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-4">Access Required</p>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">Sign in to continue</h1>
            <p className="text-sm text-gray-400 mb-10">Please sign in to complete your checkout.</p>
            <Button asChild className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 rounded-full h-11 text-sm font-semibold">
              <Link href="/login?redirect=/checkout">Sign In <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-4">Empty Cart</p>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">Nothing here yet</h1>
            <p className="text-sm text-gray-400 mb-10">Add items to your cart before checking out.</p>
            <Button asChild className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 rounded-full h-11 text-sm font-semibold">
              <Link href="/products">Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // ── Step content (plain JSX, NOT inner components) ─────────────────────────
  // Keeping these as JSX values — not `const Step = () => (...)` — prevents
  // React from treating them as new component types on every keystroke, which
  // would unmount and remount inputs and steal focus.

  const stepShipping = (
    <div className="space-y-6">
      {formData.shipping_first_name && (
        <p className="text-sm text-gray-400">We found your saved details below. Review and update if needed.</p>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Lbl>First Name <span className="text-red-500">*</span></Lbl>
          <Input value={formData.shipping_first_name} onChange={(e) => handleInputChange("shipping_first_name", e.target.value)} onBlur={() => handleBlur("shipping_first_name")} className={inputCls("shipping_first_name")} placeholder="John" />
          {err("shipping_first_name")}
        </div>
        <div>
          <Lbl>Last Name <span className="text-red-500">*</span></Lbl>
          <Input value={formData.shipping_last_name} onChange={(e) => handleInputChange("shipping_last_name", e.target.value)} onBlur={() => handleBlur("shipping_last_name")} className={inputCls("shipping_last_name")} placeholder="Doe" />
          {err("shipping_last_name")}
        </div>
      </div>
      <div>
        <Lbl>Email Address <span className="text-red-500">*</span></Lbl>
        <Input type="email" value={formData.shipping_email} onChange={(e) => handleInputChange("shipping_email", e.target.value)} onBlur={() => handleBlur("shipping_email")} className={inputCls("shipping_email")} placeholder="john@example.com" />
        {err("shipping_email")}
      </div>
      <div>
        <Lbl>Phone Number <span className="text-red-500">*</span></Lbl>
        <Input value={formData.shipping_phone} onChange={(e) => handleInputChange("shipping_phone", e.target.value)} onBlur={() => handleBlur("shipping_phone")} className={inputCls("shipping_phone")} placeholder="0712 345 678" />
        {err("shipping_phone")}
      </div>
      <div>
        <Lbl>Street Address <span className="text-red-500">*</span></Lbl>
        <Textarea value={formData.shipping_address} onChange={(e) => handleInputChange("shipping_address", e.target.value)} onBlur={() => handleBlur("shipping_address")} className={textareaCls("shipping_address")} placeholder="House/Building, Street name…" rows={2} />
        {err("shipping_address")}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Lbl>City <span className="text-red-500">*</span></Lbl>
          <Input value={formData.shipping_city} onChange={(e) => handleInputChange("shipping_city", e.target.value)} onBlur={() => handleBlur("shipping_city")} className={inputCls("shipping_city")} placeholder="Nairobi" />
          {err("shipping_city")}
        </div>
        <div>
          <Lbl>Postal Code</Lbl>
          <Input value={formData.shipping_postal_code} onChange={(e) => handleInputChange("shipping_postal_code", e.target.value)} className={inputCls("shipping_postal_code")} placeholder="00100" />
        </div>
      </div>
      <div>
        <Lbl>Country</Lbl>
        <Input value={formData.shipping_country} onChange={(e) => handleInputChange("shipping_country", e.target.value)} className={inputCls("shipping_country")} />
      </div>
    </div>
  )

  const stepBilling = (
    <div className="space-y-6">
      <label className="flex items-center gap-3 cursor-pointer group">
        <Checkbox id="same-as-shipping" checked={sameAsShipping} onCheckedChange={(c) => setSameAsShipping(c as boolean)} />
        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Same as shipping address</span>
      </label>

      {sameAsShipping ? (
        <div className="border border-gray-100 bg-gray-50/60 px-5 py-4 space-y-1">
          <p className="text-sm font-medium text-gray-700">{formData.shipping_first_name} {formData.shipping_last_name}</p>
          <p className="text-sm text-gray-400">{formData.shipping_address}, {formData.shipping_city}</p>
          <p className="text-sm text-gray-400">{formData.shipping_email} · {formData.shipping_phone}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Lbl>First Name <span className="text-red-500">*</span></Lbl>
              <Input value={formData.billing_first_name} onChange={(e) => handleInputChange("billing_first_name", e.target.value)} className={inputCls("billing_first_name")} />
              {err("billing_first_name")}
            </div>
            <div>
              <Lbl>Last Name <span className="text-red-500">*</span></Lbl>
              <Input value={formData.billing_last_name} onChange={(e) => handleInputChange("billing_last_name", e.target.value)} className={inputCls("billing_last_name")} />
              {err("billing_last_name")}
            </div>
          </div>
          <div>
            <Lbl>Email <span className="text-red-500">*</span></Lbl>
            <Input type="email" value={formData.billing_email} onChange={(e) => handleInputChange("billing_email", e.target.value)} className={inputCls("billing_email")} />
            {err("billing_email")}
          </div>
          <div>
            <Lbl>Phone <span className="text-red-500">*</span></Lbl>
            <Input value={formData.billing_phone} onChange={(e) => handleInputChange("billing_phone", e.target.value)} className={inputCls("billing_phone")} />
            {err("billing_phone")}
          </div>
          <div>
            <Lbl>Address <span className="text-red-500">*</span></Lbl>
            <Textarea value={formData.billing_address} onChange={(e) => handleInputChange("billing_address", e.target.value)} className={textareaCls("billing_address")} rows={2} />
            {err("billing_address")}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Lbl>City <span className="text-red-500">*</span></Lbl>
              <Input value={formData.billing_city} onChange={(e) => handleInputChange("billing_city", e.target.value)} className={inputCls("billing_city")} />
              {err("billing_city")}
            </div>
            <div>
              <Lbl>Postal Code</Lbl>
              <Input value={formData.billing_postal_code} onChange={(e) => handleInputChange("billing_postal_code", e.target.value)} className={inputCls("billing_postal_code")} />
            </div>
          </div>
          <div>
            <Lbl>Country</Lbl>
            <Input value={formData.billing_country} onChange={(e) => handleInputChange("billing_country", e.target.value)} className={inputCls("billing_country")} />
          </div>
        </>
      )}
    </div>
  )

  const stepDelivery = (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.15em] mb-3">How would you like to receive your order?</p>
        <div className="border-t border-gray-100">
          {[
            { value: true,  label: "Home Delivery", description: "We'll bring it to your door", icon: "🚚" },
            { value: false, label: "Self Pickup",    description: "Collect from our location",  icon: "🏪" },
          ].map((opt) => (
            <button key={String(opt.value)} type="button" onClick={() => handleInputChange("needs_delivery", opt.value)}
              className="group relative w-full flex items-center gap-5 py-5 border-b border-gray-100 text-left hover:bg-gray-50/60 transition-colors">
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-base transition-all ${formData.needs_delivery === opt.value ? "border-gray-900" : "border-gray-200 group-hover:border-gray-400"}`}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${formData.needs_delivery === opt.value ? "text-gray-900" : "text-gray-600"}`}>{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${formData.needs_delivery === opt.value ? "border-gray-900" : "border-gray-300"}`}>
                {formData.needs_delivery === opt.value && <div className="w-2 h-2 rounded-full bg-gray-900" />}
              </div>
              <div className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full bg-gray-100 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>

      {formData.needs_delivery && (
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.15em] mb-3">Deliver to</p>
            <div className="border-t border-gray-100">
              {[
                { value: true,  label: "My shipping address", description: `${formData.shipping_address || "—"}, ${formData.shipping_city || "—"}` },
                { value: false, label: "A different address",  description: "Enter a new delivery location" },
              ].map((opt) => (
                <button key={String(opt.value)} type="button" onClick={() => handleInputChange("delivery_address_same", opt.value)}
                  className="group relative w-full flex items-center gap-5 py-4 border-b border-gray-100 text-left hover:bg-gray-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${formData.delivery_address_same === opt.value ? "text-gray-900" : "text-gray-500"}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{opt.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${formData.delivery_address_same === opt.value ? "border-gray-900" : "border-gray-300"}`}>
                    {formData.delivery_address_same === opt.value && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                  </div>
                  <div className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full bg-gray-100 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>

          {!formData.delivery_address_same && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Lbl>Contact Name <span className="text-red-500">*</span></Lbl>
                  <Input value={formData.delivery_first_name} onChange={(e) => handleInputChange("delivery_first_name", e.target.value)} className={inputCls("delivery_first_name")} placeholder="Recipient name" />
                  {err("delivery_first_name")}
                </div>
                <div>
                  <Lbl>Contact Phone <span className="text-red-500">*</span></Lbl>
                  <Input value={formData.delivery_phone} onChange={(e) => handleInputChange("delivery_phone", e.target.value)} className={inputCls("delivery_phone")} placeholder="0712 345 678" />
                  {err("delivery_phone")}
                </div>
              </div>
              <div>
                <Lbl>Street Address <span className="text-red-500">*</span></Lbl>
                <Textarea value={formData.delivery_address} onChange={(e) => handleInputChange("delivery_address", e.target.value)} className={textareaCls("delivery_address")} placeholder="House/Building, Street…" rows={2} />
                {err("delivery_address")}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Lbl>City <span className="text-red-500">*</span></Lbl>
                  <Input value={formData.delivery_city} onChange={(e) => handleInputChange("delivery_city", e.target.value)} className={inputCls("delivery_city")} placeholder="Nairobi" />
                  {err("delivery_city")}
                </div>
                <div>
                  <Lbl>Postal Code</Lbl>
                  <Input value={formData.delivery_postal_code} onChange={(e) => handleInputChange("delivery_postal_code", e.target.value)} className={inputCls("delivery_postal_code")} placeholder="00100" />
                </div>
              </div>
            </div>
          )}

          <div>
            <Lbl>Delivery Instructions <span className="text-gray-300 normal-case font-normal">(optional)</span></Lbl>
            <Textarea value={formData.delivery_instructions} onChange={(e) => handleInputChange("delivery_instructions", e.target.value)} className={textareaCls("delivery_instructions")} placeholder="Gate code, floor number, landmark…" rows={2} />
          </div>

          <div className="flex items-start gap-3 text-xs text-gray-400">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            A delivery partner will be auto-assigned once payment is confirmed.
          </div>
        </div>
      )}

      {isCheckingProducts ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-48" /><div className="h-3 bg-gray-200 rounded w-64" />
        </div>
      ) : needsEnhancedLocation ? (
        <KenyaLocationFields
          formData={{ county: formData.county, sub_county: formData.sub_county, ward: formData.ward, sub_location: formData.sub_location, street_address: formData.street_address, landmark: formData.landmark, delivery_instructions: formData.gas_delivery_instructions }}
          errors={errors} onChange={handleInputChange}
        />
      ) : null}
    </div>
  )

  const stepPayment = (
    <div className="space-y-6">
      <RadioGroup value={formData.payment_method} onValueChange={(v) => handleInputChange("payment_method", v)}>
        <div className="border-t border-gray-100">
          {paymentOptions.map((opt) => (
            <label key={opt.value} htmlFor={`pay-${opt.value}`}
              className="group relative flex items-center gap-5 py-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50/60 transition-colors">
              <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} className="sr-only" />
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all ${formData.payment_method === opt.value ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-400 group-hover:border-gray-400"}`}>
                <opt.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${formData.payment_method === opt.value ? "text-gray-900" : "text-gray-700"}`}>{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${formData.payment_method === opt.value ? "border-gray-900" : "border-gray-300"}`}>
                {formData.payment_method === opt.value && <div className="w-2 h-2 rounded-full bg-gray-900" />}
              </div>
              <div className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full bg-gray-100 transition-all duration-300" />
            </label>
          ))}
        </div>
      </RadioGroup>

      {formData.payment_method === "kcb_financing_pending" && (
        <div className="border-l-2 border-gray-300 pl-4 py-1">
          <p className="text-xs font-semibold text-gray-700 mb-1">How financing works</p>
          <p className="text-xs text-gray-400 leading-relaxed">No payment is taken now. After KCB approval, return to complete payment.</p>
        </div>
      )}

      {formData.payment_method === "mpesa" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-xs text-gray-400">
            <Smartphone className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            You will receive an STK push prompt to enter your M-Pesa PIN.
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Lbl>M-Pesa Number <span className="text-red-500">*</span></Lbl>
              {formData.shipping_phone && !formData.mpesa_phone && (
                <button type="button"
                  onClick={() => { handleInputChange("mpesa_phone", formData.shipping_phone); setTouched((p) => ({ ...p, mpesa_phone: false })) }}
                  className="text-[11px] text-gray-400 hover:text-gray-900 underline underline-offset-2 transition-colors">
                  Use shipping number
                </button>
              )}
            </div>
            <Input type="tel" placeholder="e.g. 0722 000 000" value={formData.mpesa_phone}
              onChange={(e) => handleInputChange("mpesa_phone", e.target.value)}
              onBlur={() => handleBlur("mpesa_phone")}
              className={inputCls("mpesa_phone")} />
            {err("mpesa_phone")}
            <p className="text-[11px] text-gray-400 mt-1.5">Enter the number registered with M-Pesa</p>
          </div>
        </div>
      )}
    </div>
  )

  const stepReview = (
    <div className="space-y-8">
      <div className="border border-gray-100 divide-y divide-gray-100 [&>*:nth-child(even)]:bg-gray-50/60">
        {[
          { label: "Shipping to", step: 1, value: `${formData.shipping_first_name} ${formData.shipping_last_name} · ${formData.shipping_address}, ${formData.shipping_city} · ${formData.shipping_phone}` },
          { label: "Billing",     step: 2, value: sameAsShipping ? "Same as shipping address" : `${formData.billing_first_name} ${formData.billing_last_name} · ${formData.billing_address}, ${formData.billing_city}` },
          { label: "Delivery",    step: 3, value: !formData.needs_delivery ? "Self pickup" : formData.delivery_address_same ? "Home delivery · Same as shipping address" : `Home delivery · ${formData.delivery_address}, ${formData.delivery_city}` },
          { label: "Payment",     step: 4, value: formData.payment_method === "mpesa" ? `M-Pesa · ${formData.mpesa_phone}` : formData.payment_method === "cod" ? "Cash on Delivery" : "KCB Financing" },
        ].map(({ label, step, value }) => (
          <div key={label} className="px-5 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-0.5">{label}</p>
              <p className="text-sm text-gray-800 leading-snug">{value}</p>
            </div>
            <button type="button" onClick={() => goToStep(step)}
              className="text-[11px] text-gray-400 hover:text-gray-900 underline underline-offset-2 shrink-0 transition-colors">
              Edit
            </button>
          </div>
        ))}
      </div>

      <div>
        <Lbl>Order Notes <span className="text-gray-300 normal-case font-normal">(optional)</span></Lbl>
        <Textarea value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Any special instructions for your order…"
          className={textareaCls("notes")} rows={3} />
      </div>
    </div>
  )

  const stepContent: Record<number, React.ReactNode> = {
    1: stepShipping,
    2: stepBilling,
    3: stepDelivery,
    4: stepPayment,
    5: stepReview,
  }

  const isLastStep = currentStep === STEPS.length

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SiteHeader />

        <main className="flex-1 py-8 pb-28 lg:pb-8 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="mb-5">
            <button type="button" onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-900 transition-colors mb-4 group">
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to cart
            </button>
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Checkout</h1>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.4em]">Secure</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

            {/* ── Left: stepped form ── */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {/* Step indicator */}
              <div className="flex items-center gap-0 px-6 pt-5 pb-0 overflow-x-auto">
                {STEPS.map((step, i) => {
                  const done = step.num < currentStep
                  const active = step.num === currentStep
                  const clickable = step.num < currentStep
                  return (
                    <div key={step.num} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => clickable && goToStep(step.num)}
                        className={`flex items-center gap-2 shrink-0 transition-all ${clickable ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          done   ? "bg-emerald-700 border-emerald-700" :
                          active ? "border-emerald-700" :
                                   "border-gray-200"
                        }`}>
                          {done
                            ? <Check className="w-3.5 h-3.5 text-white" />
                            : <span className={`text-[10px] tabular-nums font-medium ${active ? "text-emerald-700" : "text-gray-300"}`}>{String(step.num).padStart(2, "0")}</span>
                          }
                        </div>
                        <span className={`text-xs font-medium hidden sm:block transition-colors ${
                          active ? "text-emerald-700" : done ? "text-gray-500" : "text-gray-300"
                        }`}>
                          {step.label}
                        </span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <div className={`h-px w-6 sm:w-8 mx-2 transition-all duration-500 ${step.num < currentStep ? "bg-emerald-700" : "bg-gray-200"}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Current step */}
              <section className="border-t border-gray-100 px-6">
                <div className="py-5">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.4em] mb-1">
                    Step {currentStep} of {STEPS.length}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {STEPS[currentStep - 1].label}
                  </h2>
                </div>

                <div className="pb-6">
                  {stepContent[currentStep]}
                </div>
              </section>

              {/* Navigation */}
              <div className="border-t border-gray-100 px-6 py-5 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button type="button" onClick={handleBack}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                  </button>
                ) : <div />}

                {isLastStep ? (
                  <form onSubmit={handleSubmit}>
                    <Button type="submit" disabled={isProcessing}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-12 px-10 text-sm font-semibold transition-all disabled:opacity-50">
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Place Order
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <Button type="button" onClick={handleNext}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-12 px-10 text-sm font-semibold transition-all">
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* ── Right: Order Summary (always visible) ── */}
            <div>
              <div className="sticky top-6 bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 [&>*:nth-child(even)]:bg-gray-50/70">

                {/* row 1 */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Order Summary</p>
                </div>

                {/* row 2 */}
                <div className="px-5 py-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium leading-snug truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* row 3 */}
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span><span className="tabular-nums">KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-gray-700 font-medium">Free</span> : `KES ${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>VAT (16%)</span><span className="tabular-nums">KES {tax.toLocaleString()}</span>
                  </div>
                </div>

                {/* row 4 */}
                <div className="px-5 py-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-900 tabular-nums">KES {total.toLocaleString()}</span>
                </div>

                {/* row 5 — step progress */}
                <div className="px-5 py-4">
                  <div className="flex gap-1.5 mb-1.5">
                    {STEPS.map((s) => (
                      <div key={s.num} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${s.num < currentStep ? "bg-emerald-700" : s.num === currentStep ? "bg-emerald-400" : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {STEPS[currentStep - 1].label} — step {currentStep} of {STEPS.length}
                  </p>
                </div>

              </div>
            </div>

          </div>
          </div>
        </main>

        {/* Mobile sticky footer */}
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-gray-100 px-4 py-4">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">KES {total.toLocaleString()}</p>
            </div>
            {isLastStep ? (
              <Button disabled={isProcessing} onClick={handleSubmit as any}
                className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-11 px-8 text-sm font-semibold shrink-0">
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                    Processing…
                  </span>
                ) : <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" />Place Order</span>}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}
                className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-11 px-8 text-sm font-semibold shrink-0">
                <span className="flex items-center gap-2">Continue <ArrowRight className="h-3.5 w-3.5" /></span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <CheckCircle className="h-5 w-5 text-gray-900" />
              Payment Successful
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 space-y-6">
            <div className="text-center py-4">
              <CheckCircle className="h-14 w-14 text-gray-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Confirmed</h3>
              <p className="text-sm text-gray-400">Your payment has been processed and your order is confirmed.</p>
              {successOrder && (
                <div className="mt-4 bg-gray-50 rounded-lg px-5 py-4">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
                  <p className="font-bold text-gray-900">{successOrder.order_number}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setShowSuccessModal(false); router.push(`/checkout/success?order=${successOrder?.id}`) }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full">View Order</Button>
              <Button variant="outline" onClick={() => router.push("/products")} className="flex-1 rounded-full border-gray-200">Keep Shopping</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
