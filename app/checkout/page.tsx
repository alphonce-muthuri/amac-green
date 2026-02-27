"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Smartphone, Banknote, Lock, ArrowLeft, CheckCircle, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { createOrder, checkDeliveryAssignment, manuallyAssignDelivery } from "@/app/actions/orders"
import { toast } from "@/hooks/use-toast"
import { SiteHeader } from "@/components/site-header"
import { KenyaLocationFields } from "@/components/checkout/kenya-location-fields"
import { supabase } from "@/lib/supabase"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrder, setSuccessOrder] = useState<any>(null)
  const [hasGasYetuProduct, setHasGasYetuProduct] = useState(false)
  const [isCheckingProducts, setIsCheckingProducts] = useState(true)

  const [formData, setFormData] = useState({
    // Shipping Address
    shipping_first_name: "",
    shipping_last_name: "",
    shipping_email: "",
    shipping_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "Kenya",

    // Billing Address
    billing_first_name: "",
    billing_last_name: "",
    billing_email: "",
    billing_phone: "",
    billing_address: "",
    billing_city: "",
    billing_postal_code: "",
    billing_country: "Kenya",

    // Payment
    payment_method: "mpesa",
    mpesa_phone: "",

    // Additional
    notes: "",

    // Delivery Options
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

    // Gas Yetu Enhanced Location Fields
    county: "",
    sub_county: "",
    ward: "",
    sub_location: "",
    street_address: "",
    landmark: "",
    gas_delivery_instructions: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = getTotalPrice()
  const shipping = subtotal > 5000 ? 0 : 1
  const tax = subtotal * 0.16
  const total = subtotal + shipping + tax

  // Check if cart contains Gas Yetu products
  useEffect(() => {
    const checkForGasYetuProducts = async () => {
      if (items.length === 0) {
        setIsCheckingProducts(false)
        return
      }

      try {
        const productIds = items.map(item => item.productId)
        
        // Fetch products with their categories
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            id,
            category_id,
            product_categories!inner (
              name,
              slug
            )
          `)
          .in('id', productIds)

        if (error) {
          console.error('Error fetching product categories:', error)
          setIsCheckingProducts(false)
          return
        }

        // Check if any product is in Gas Yetu category
        const hasGasYetu = products?.some((product: any) => 
          product.product_categories?.slug === 'gas-yetu' ||
          product.product_categories?.name === 'Gas Yetu'
        )

        setHasGasYetuProduct(hasGasYetu || false)
      } catch (error) {
        console.error('Error checking for Gas Yetu products:', error)
      } finally {
        setIsCheckingProducts(false)
      }
    }

    checkForGasYetuProducts()
  }, [items])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required shipping fields
    if (!formData.shipping_first_name) newErrors.shipping_first_name = "First name is required"
    if (!formData.shipping_last_name) newErrors.shipping_last_name = "Last name is required"
    if (!formData.shipping_email) newErrors.shipping_email = "Email is required"
    if (!formData.shipping_phone) newErrors.shipping_phone = "Phone number is required"
    if (!formData.shipping_address) newErrors.shipping_address = "Address is required"
    if (!formData.shipping_city) newErrors.shipping_city = "City is required"

    // Email validation
    if (formData.shipping_email && !/\S+@\S+\.\S+/.test(formData.shipping_email)) {
      newErrors.shipping_email = "Please enter a valid email"
    }

    // Phone validation
    if (formData.shipping_phone && !/^(\+254|0)[17]\d{8}$/.test(formData.shipping_phone)) {
      newErrors.shipping_phone = "Please enter a valid Kenyan phone number"
    }

    // M-Pesa phone validation
    if (formData.payment_method === "mpesa") {
      if (!formData.mpesa_phone) {
        newErrors.mpesa_phone = "M-Pesa phone number is required"
      } else if (!/^(\+254|254|0)[17]\d{8}$/.test(formData.mpesa_phone)) {
        newErrors.mpesa_phone = "Please enter a valid Kenyan M-Pesa phone number"
      }
    }

    // Billing address validation (if different from shipping)
    if (!sameAsShipping) {
      if (!formData.billing_first_name) newErrors.billing_first_name = "First name is required"
      if (!formData.billing_last_name) newErrors.billing_last_name = "Last name is required"
      if (!formData.billing_email) newErrors.billing_email = "Email is required"
      if (!formData.billing_phone) newErrors.billing_phone = "Phone number is required"
      if (!formData.billing_address) newErrors.billing_address = "Address is required"
      if (!formData.billing_city) newErrors.billing_city = "City is required"
    }

    // Delivery address validation
    if (formData.needs_delivery && !formData.delivery_address_same) {
      if (!formData.delivery_first_name) newErrors.delivery_first_name = "Delivery contact name is required"
      if (!formData.delivery_phone) newErrors.delivery_phone = "Delivery contact phone is required"
      if (!formData.delivery_address) newErrors.delivery_address = "Delivery address is required"
      if (!formData.delivery_city) newErrors.delivery_city = "Delivery city is required"

      // Phone validation for delivery contact
      if (formData.delivery_phone && !/^(\+254|0)[17]\d{8}$/.test(formData.delivery_phone)) {
        newErrors.delivery_phone = "Please enter a valid Kenyan phone number"
      }
    }

    // Gas Yetu Enhanced Location Validation
    if (hasGasYetuProduct) {
      if (!formData.county) newErrors.county = "County is required for Gas Yetu delivery"
      if (!formData.sub_county) newErrors.sub_county = "Sub-County is required for Gas Yetu delivery"
      if (!formData.ward) newErrors.ward = "Ward/Location is required for Gas Yetu delivery"
      if (!formData.sub_location) newErrors.sub_location = "Sub-Location/Village/Estate is required for Gas Yetu delivery"
      if (!formData.street_address) newErrors.street_address = "Street/Building/House Number is required for Gas Yetu delivery"
      if (!formData.landmark) newErrors.landmark = "Landmark is required for Gas Yetu delivery"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your order.",
        variant: "destructive",
      })
      router.push("/login?redirect=/checkout")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      })
      router.push("/products")
      return
    }

    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please fix the errors in the form and try again.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      console.log('[CHECKOUT_DEBUG] Starting checkout process for user:', user.id)

      // Prepare billing address
      const billingAddress = sameAsShipping
        ? {
          billing_first_name: formData.shipping_first_name,
          billing_last_name: formData.shipping_last_name,
          billing_email: formData.shipping_email,
          billing_phone: formData.shipping_phone,
          billing_address: formData.shipping_address,
          billing_city: formData.shipping_city,
          billing_postal_code: formData.shipping_postal_code,
          billing_country: formData.shipping_country,
        }
        : {
          billing_first_name: formData.billing_first_name,
          billing_last_name: formData.billing_last_name,
          billing_email: formData.billing_email,
          billing_phone: formData.billing_phone,
          billing_address: formData.billing_address,
          billing_city: formData.billing_city,
          billing_postal_code: formData.billing_postal_code,
          billing_country: formData.billing_country,
        }

      // Prepare delivery address
      const deliveryAddress = formData.delivery_address_same
        ? {
          delivery_first_name: formData.shipping_first_name,
          delivery_last_name: formData.shipping_last_name,
          delivery_phone: formData.shipping_phone,
          delivery_address: formData.shipping_address,
          delivery_city: formData.shipping_city,
          delivery_postal_code: formData.shipping_postal_code,
          delivery_country: formData.shipping_country,
        }
        : {
          delivery_first_name: formData.delivery_first_name,
          delivery_last_name: formData.delivery_last_name,
          delivery_phone: formData.delivery_phone,
          delivery_address: formData.delivery_address,
          delivery_city: formData.delivery_city,
          delivery_postal_code: formData.delivery_postal_code,
          delivery_country: formData.delivery_country,
        }

      // Prepare Gas Yetu location data if applicable
      const gasYetuLocationData = hasGasYetuProduct ? {
        gas_yetu_county: formData.county,
        gas_yetu_sub_county: formData.sub_county,
        gas_yetu_ward: formData.ward,
        gas_yetu_sub_location: formData.sub_location,
        gas_yetu_street_address: formData.street_address,
        gas_yetu_landmark: formData.landmark,
        gas_yetu_delivery_instructions: formData.gas_delivery_instructions,
      } : {}

      // Create order first
      const orderData = {
        ...formData,
        ...billingAddress,
        ...deliveryAddress,
        ...gasYetuLocationData,
        subtotal,
        shipping_cost: shipping,
        tax_amount: tax,
        total_amount: total,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      console.log('[CHECKOUT_DEBUG] Calling createOrder with data:', {
        userId: user.id,
        itemCount: orderData.items.length,
        total: orderData.total_amount
      })

      const result = await createOrder(orderData, user.id)

      console.log('[CHECKOUT_DEBUG] createOrder result:', result)

      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      // Check if delivery was auto-assigned (only in development)
      if (process.env.NODE_ENV === 'development') {
        setTimeout(async () => {
          const deliveryCheck = await checkDeliveryAssignment(result.order.id)

          if (deliveryCheck.hasDelivery) {
            toast({
              title: "🚚 Delivery Assigned!",
              description: `Your order has been assigned to a delivery partner`,
            })
          } else {
            // Try manual assignment as fallback in development
            const manualAssignment = await manuallyAssignDelivery(result.order.id)

            if (manualAssignment.success) {
              toast({
                title: "🚚 Delivery Assigned!",
                description: "Your order has been assigned to a delivery partner",
              })
            }
          }
        }, 2000)
      }

      // Initialize M-Pesa payment
      if (formData.payment_method === "mpesa" && result.order?.id) {
        console.log("📱 M-PESA MODE - Initializing Daraja STK Push")

        try {
          // Initialize M-Pesa STK Push using Daraja API
          const mpesaResponse = await fetch("/api/daraja/initialize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber: formData.mpesa_phone,
              amount: total,
              orderId: result.order.id,
              customerName: `${formData.shipping_first_name} ${formData.shipping_last_name}`,
              email: formData.shipping_email
            }),
          })

          const mpesaData = await mpesaResponse.json()

          if (mpesaData.success) {
            console.log("📱 Daraja STK Push initiated:", mpesaData.data.checkoutRequestID)

            // Clear cart after successful STK push
            await clearCart()

            // Show success message
            toast({
              title: "Payment Request Sent",
              description: "Please check your phone and enter your M-Pesa PIN to complete the payment.",
            })

            // Stop loading
            setIsProcessing(false)

            // Redirect to success page with polling for payment status
            router.push(`/checkout/success?order=${result.order.id}&mpesa=true&checkout=${mpesaData.data.checkoutRequestID}`)
          } else {
            console.error("📱 Daraja STK Push failed:", mpesaData)
            throw new Error(mpesaData.error || "Failed to initialize M-Pesa payment")
          }
        } catch (mpesaError) {
          console.error("📱 Daraja API Error:", mpesaError)
          throw new Error(
            `M-Pesa payment initialization failed: ${mpesaError instanceof Error ? mpesaError.message : "Unknown error"}`,
          )
        }
      } else {
        // For non-M-Pesa payments, clear cart immediately
        await clearCart()
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${result.order?.order_number} has been placed.`,
        })

        // Stop loading before redirect
        setIsProcessing(false)

        // Redirect to success page
        router.push(`/checkout/success?order=${result.order?.id}`)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to process your order. Please try again.",
        variant: "destructive",
      })
      // Stop loading on error
      setIsProcessing(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push(`/checkout/success?order=${successOrder?.id}`)
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to complete your checkout.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/login?redirect=/checkout">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shipping_first_name">First Name *</Label>
                          <Input
                            id="shipping_first_name"
                            value={formData.shipping_first_name}
                            onChange={(e) => handleInputChange("shipping_first_name", e.target.value)}
                            className={errors.shipping_first_name ? "border-red-500" : ""}
                          />
                          {errors.shipping_first_name && (
                            <p className="text-sm text-red-500 mt-1">{errors.shipping_first_name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="shipping_last_name">Last Name *</Label>
                          <Input
                            id="shipping_last_name"
                            value={formData.shipping_last_name}
                            onChange={(e) => handleInputChange("shipping_last_name", e.target.value)}
                            className={errors.shipping_last_name ? "border-red-500" : ""}
                          />
                          {errors.shipping_last_name && (
                            <p className="text-sm text-red-500 mt-1">{errors.shipping_last_name}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shipping_email">Email *</Label>
                        <Input
                          id="shipping_email"
                          type="email"
                          value={formData.shipping_email}
                          onChange={(e) => handleInputChange("shipping_email", e.target.value)}
                          className={errors.shipping_email ? "border-red-500" : ""}
                        />
                        {errors.shipping_email && <p className="text-sm text-red-500 mt-1">{errors.shipping_email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="shipping_phone">Phone *</Label>
                        <Input
                          id="shipping_phone"
                          value={formData.shipping_phone}
                          onChange={(e) => handleInputChange("shipping_phone", e.target.value)}
                          className={errors.shipping_phone ? "border-red-500" : ""}
                        />
                        {errors.shipping_phone && <p className="text-sm text-red-500 mt-1">{errors.shipping_phone}</p>}
                      </div>

                      <div>
                        <Label htmlFor="shipping_address">Address *</Label>
                        <Textarea
                          id="shipping_address"
                          value={formData.shipping_address}
                          onChange={(e) => handleInputChange("shipping_address", e.target.value)}
                          className={errors.shipping_address ? "border-red-500" : ""}
                        />
                        {errors.shipping_address && (
                          <p className="text-sm text-red-500 mt-1">{errors.shipping_address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shipping_city">City *</Label>
                          <Input
                            id="shipping_city"
                            value={formData.shipping_city}
                            onChange={(e) => handleInputChange("shipping_city", e.target.value)}
                            className={errors.shipping_city ? "border-red-500" : ""}
                          />
                          {errors.shipping_city && <p className="text-sm text-red-500 mt-1">{errors.shipping_city}</p>}
                        </div>
                        <div>
                          <Label htmlFor="shipping_postal_code">Postal Code</Label>
                          <Input
                            id="shipping_postal_code"
                            value={formData.shipping_postal_code}
                            onChange={(e) => handleInputChange("shipping_postal_code", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shipping_country">Country</Label>
                        <Input
                          id="shipping_country"
                          value={formData.shipping_country}
                          onChange={(e) => handleInputChange("shipping_country", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Billing Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="same-as-shipping"
                          checked={sameAsShipping}
                          onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                        />
                        <Label htmlFor="same-as-shipping">Same as shipping address</Label>
                      </div>

                      {!sameAsShipping && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billing_first_name">First Name *</Label>
                              <Input
                                id="billing_first_name"
                                value={formData.billing_first_name}
                                onChange={(e) => handleInputChange("billing_first_name", e.target.value)}
                                className={errors.billing_first_name ? "border-red-500" : ""}
                              />
                              {errors.billing_first_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.billing_first_name}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="billing_last_name">Last Name *</Label>
                              <Input
                                id="billing_last_name"
                                value={formData.billing_last_name}
                                onChange={(e) => handleInputChange("billing_last_name", e.target.value)}
                                className={errors.billing_last_name ? "border-red-500" : ""}
                              />
                              {errors.billing_last_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.billing_last_name}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="billing_email">Email *</Label>
                            <Input
                              id="billing_email"
                              type="email"
                              value={formData.billing_email}
                              onChange={(e) => handleInputChange("billing_email", e.target.value)}
                              className={errors.billing_email ? "border-red-500" : ""}
                            />
                            {errors.billing_email && (
                              <p className="text-sm text-red-500 mt-1">{errors.billing_email}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="billing_phone">Phone *</Label>
                            <Input
                              id="billing_phone"
                              value={formData.billing_phone}
                              onChange={(e) => handleInputChange("billing_phone", e.target.value)}
                              className={errors.billing_phone ? "border-red-500" : ""}
                            />
                            {errors.billing_phone && (
                              <p className="text-sm text-red-500 mt-1">{errors.billing_phone}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="billing_address">Address *</Label>
                            <Textarea
                              id="billing_address"
                              value={formData.billing_address}
                              onChange={(e) => handleInputChange("billing_address", e.target.value)}
                              className={errors.billing_address ? "border-red-500" : ""}
                            />
                            {errors.billing_address && (
                              <p className="text-sm text-red-500 mt-1">{errors.billing_address}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billing_city">City *</Label>
                              <Input
                                id="billing_city"
                                value={formData.billing_city}
                                onChange={(e) => handleInputChange("billing_city", e.target.value)}
                                className={errors.billing_city ? "border-red-500" : ""}
                              />
                              {errors.billing_city && (
                                <p className="text-sm text-red-500 mt-1">{errors.billing_city}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="billing_postal_code">Postal Code</Label>
                              <Input
                                id="billing_postal_code"
                                value={formData.billing_postal_code}
                                onChange={(e) => handleInputChange("billing_postal_code", e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="billing_country">Country</Label>
                            <Input
                              id="billing_country"
                              value={formData.billing_country}
                              onChange={(e) => handleInputChange("billing_country", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Delivery Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="needs-delivery"
                          checked={formData.needs_delivery}
                          onCheckedChange={(checked) => handleInputChange("needs_delivery", checked as boolean)}
                        />
                        <Label htmlFor="needs-delivery">I need delivery service</Label>
                      </div>

                      {formData.needs_delivery && (
                        <div className="space-y-4 border-l-2 border-green-200 pl-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="delivery-address-same"
                              checked={formData.delivery_address_same}
                              onCheckedChange={(checked) =>
                                handleInputChange("delivery_address_same", checked as boolean)
                              }
                            />
                            <Label htmlFor="delivery-address-same">Deliver to shipping address</Label>
                          </div>

                          {!formData.delivery_address_same && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="delivery_first_name">Contact Name *</Label>
                                  <Input
                                    id="delivery_first_name"
                                    value={formData.delivery_first_name}
                                    onChange={(e) => handleInputChange("delivery_first_name", e.target.value)}
                                    className={errors.delivery_first_name ? "border-red-500" : ""}
                                  />
                                  {errors.delivery_first_name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.delivery_first_name}</p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="delivery_phone">Contact Phone *</Label>
                                  <Input
                                    id="delivery_phone"
                                    value={formData.delivery_phone}
                                    onChange={(e) => handleInputChange("delivery_phone", e.target.value)}
                                    className={errors.delivery_phone ? "border-red-500" : ""}
                                  />
                                  {errors.delivery_phone && (
                                    <p className="text-sm text-red-500 mt-1">{errors.delivery_phone}</p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="delivery_address">Delivery Address *</Label>
                                <Textarea
                                  id="delivery_address"
                                  value={formData.delivery_address}
                                  onChange={(e) => handleInputChange("delivery_address", e.target.value)}
                                  className={errors.delivery_address ? "border-red-500" : ""}
                                />
                                {errors.delivery_address && (
                                  <p className="text-sm text-red-500 mt-1">{errors.delivery_address}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="delivery_city">City *</Label>
                                  <Input
                                    id="delivery_city"
                                    value={formData.delivery_city}
                                    onChange={(e) => handleInputChange("delivery_city", e.target.value)}
                                    className={errors.delivery_city ? "border-red-500" : ""}
                                  />
                                  {errors.delivery_city && (
                                    <p className="text-sm text-red-500 mt-1">{errors.delivery_city}</p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="delivery_postal_code">Postal Code</Label>
                                  <Input
                                    id="delivery_postal_code"
                                    value={formData.delivery_postal_code}
                                    onChange={(e) => handleInputChange("delivery_postal_code", e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                            <Textarea
                              id="delivery_instructions"
                              value={formData.delivery_instructions}
                              onChange={(e) => handleInputChange("delivery_instructions", e.target.value)}
                              placeholder="Any special instructions for the delivery person..."
                              rows={2}
                            />
                          </div>

                          {/* Gas Yetu Enhanced Location Fields */}
                          {hasGasYetuProduct && (
                            <KenyaLocationFields
                              formData={{
                                county: formData.county,
                                sub_county: formData.sub_county,
                                ward: formData.ward,
                                sub_location: formData.sub_location,
                                street_address: formData.street_address,
                                landmark: formData.landmark,
                                delivery_instructions: formData.gas_delivery_instructions,
                              }}
                              errors={errors}
                              onChange={handleInputChange}
                            />
                          )}

                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-green-700">
                              📍 A delivery person will be automatically assigned based on your location once payment is
                              confirmed.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={formData.payment_method}
                        onValueChange={(value) => handleInputChange("payment_method", value)}
                      >
                        <div className="flex items-center space-x-2 mb-4">
                          <RadioGroupItem value="mpesa" id="mpesa" />
                          <Label htmlFor="mpesa" className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            M-Pesa Payment
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Cash on Delivery
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.payment_method === "mpesa" && (
                        <div className="mt-4 space-y-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Smartphone className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">M-Pesa STK Push</span>
                            </div>
                            <p className="text-sm text-green-700">
                              You will receive a payment prompt on your phone to complete the transaction.
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="mpesa_phone">M-Pesa Phone Number *</Label>
                            <Input
                              id="mpesa_phone"
                              type="tel"
                              placeholder="e.g., 0722000000 or 254722000000"
                              value={formData.mpesa_phone}
                              onChange={(e) => handleInputChange("mpesa_phone", e.target.value)}
                              className={errors.mpesa_phone ? "border-red-500" : ""}
                            />
                            {errors.mpesa_phone && (
                              <p className="text-sm text-red-500 mt-1">{errors.mpesa_phone}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Enter the phone number registered with M-Pesa
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Any special instructions or notes for your order..."
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>KES {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>KES {shipping.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (16%)</span>
                          <span>KES {tax.toLocaleString()}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>KES {total.toLocaleString()}</span>
                      </div>

                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">or</span>
                        </div>
                      </div>

                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
                        disabled={isProcessing}
                        onClick={() => {
                          toast({
                            title: "Financing Coming Soon",
                            description: "Our financing options will be available soon. Please use regular payment for now.",
                          })
                        }}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Start Financing
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        By placing your order, you agree to our terms and conditions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Payment Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Confirmed</h3>
              <p className="text-gray-600 mb-4">
                Your payment has been processed successfully. Your order is now confirmed!
              </p>
              {successOrder && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold">{successOrder.order_number}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSuccessModalClose} className="flex-1">
                View Order Details
              </Button>
              <Button variant="outline" onClick={() => router.push("/products")} className="flex-1">
                Continue Shopping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
