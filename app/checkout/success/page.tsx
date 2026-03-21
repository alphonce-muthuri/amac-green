"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Package, CreditCard, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { supabase } from "@/lib/supabase"
import { markOrderAsPaid } from "@/app/actions/orders"
import { showFinancingSimulationUi } from "@/lib/feature-flags"

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  customer_email: string
  created_at: string
  mpesa_transaction_id?: string
  payment_notes?: string
  mpesa_checkout_request_id?: string
  financing_status?: string
  financing_reference?: string
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  product_image_url?: string
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const handleManualPayment = async () => {
    if (!orderId) return
    
    setUpdating(true)
    try {
      const result = await markOrderAsPaid(orderId)
      if (result.success) {
        // Refresh order data
        await fetchOrder()
        alert('Order marked as paid successfully! Check delivery dashboard.')
      } else {
        alert('Failed to mark order as paid: ' + result.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setUpdating(false)
    }
  }

  const simulateCallback = async (type: 'success' | 'failure') => {
    if (!order?.mpesa_checkout_request_id) return
    
    setUpdating(true)
    try {
      const response = await fetch('/api/daraja/simulate-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutRequestID: order.mpesa_checkout_request_id,
          simulate: type
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`${type} callback simulated successfully!`)
        // Refresh order data
        await fetchOrder()
      } else {
        alert('Failed to simulate callback: ' + result.error)
      }
    } catch (error) {
      alert('Error simulating callback: ' + error)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      // Check if this is a Paystack redirect
      const paymentStatus = searchParams.get("payment")
      const reference = searchParams.get("reference")
      const isMpesa = searchParams.get("mpesa")
      
      if (paymentStatus === "success" && reference) {
        // Verify Paystack payment
        verifyPaystackPayment(reference)
      } else if (isMpesa === "true") {
        // Start M-Pesa payment verification polling
        startMpesaVerification()
      } else {
        fetchOrder()
      }
    }
  }, [orderId])

  const verifyPaystackPayment = async (reference: string) => {
    try {
      console.log('[SUCCESS] Verifying Paystack payment:', reference)
      
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('[SUCCESS] Payment verified successfully')
        setOrder(result.data.order)
      } else {
        console.error('[SUCCESS] Payment verification failed:', result.error)
      }
    } catch (error) {
      console.error('[SUCCESS] Error verifying payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateFinancing = async (outcome: "approved" | "declined") => {
    if (!orderId) return
    setUpdating(true)
    try {
      const response = await fetch("/api/kcb-financing/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, outcome }),
      })
      const result = await response.json()
      if (result.success) {
        await fetchOrder()
      } else {
        alert(result.error || "Financing simulation failed")
      }
    } catch (e) {
      alert("Error: " + e)
    } finally {
      setUpdating(false)
    }
  }

  const simulatePayment = async (simulate = 'success') => {
    try {
      console.log('[SUCCESS] Simulating payment:', simulate)
      
      const response = await fetch('/api/kcb-buni/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, simulate }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('[SUCCESS] Payment simulation successful')
        // Refresh order data
        await fetchOrder()
        setLoading(false)
      } else {
        console.error('[SUCCESS] Payment simulation failed:', result.error)
      }
    } catch (error) {
      console.error('[SUCCESS] Error simulating payment:', error)
    }
  }

  const startMpesaVerification = () => {
    console.log('[SUCCESS] Starting Daraja M-Pesa payment verification polling')
    
    const checkoutRequestID = searchParams.get("checkout")
    
    if (!checkoutRequestID) {
      console.error('[SUCCESS] No checkout request ID found')
      setLoading(false)
      return
    }
    
    let attempts = 0
    const maxAttempts = 30 // Poll for 5 minutes (30 * 10 seconds)
    
    const pollPaymentStatus = async () => {
      try {
        attempts++
        console.log(`[SUCCESS] Daraja verification attempt ${attempts}/${maxAttempts}`)
        
        const response = await fetch('/api/daraja/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            checkoutRequestID,
            orderId 
          }),
        })

        const result = await response.json()
        
        if (result.success) {
          const { status, resultCode, resultDesc } = result.data
          
          if (status === 'completed') {
            console.log('[SUCCESS] Daraja payment confirmed!')
            await fetchOrder() // Refresh order data
            setLoading(false)
            return // Stop polling
          } else if (status === 'failed') {
            console.log('[SUCCESS] Daraja payment failed:', resultDesc)
            setLoading(false)
            return // Stop polling
          }
          // If status is 'pending', continue polling
        }
        
        // Continue polling if payment not confirmed and we haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(pollPaymentStatus, 10000) // Poll every 10 seconds
        } else {
          console.log('[SUCCESS] Daraja verification timeout - this is normal in sandbox')
          await fetchOrder() // Fetch order anyway
          setLoading(false)
        }
        
      } catch (error) {
        console.error('[SUCCESS] Error verifying Daraja payment:', error)
        
        // Continue polling on error (network issues, etc.)
        if (attempts < maxAttempts) {
          setTimeout(pollPaymentStatus, 10000)
        } else {
          await fetchOrder() // Fetch order anyway
          setLoading(false)
        }
      }
    }
    
    // Start polling immediately
    pollPaymentStatus()
  }

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*)
        `)
        .eq("id", orderId)
        .single()

      if (error) {
        console.error("Error fetching order:", error)
      } else {
        setOrder(data)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "paid":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "cancelled":
      case "failed":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "cancelled":
      case "failed":
        return <CheckCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for could not be found.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/products">Continue Shopping</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {order.financing_status === "pending" ? "Financing application received" : "Order Confirmed!"}
            </h1>
            <p className="text-gray-600">
              {order.financing_status === "pending"
                ? "Your KCB financing request is being processed. Complete payment after approval."
                : "Thank you for your order. We've received your payment and will process your order shortly."}
            </p>
          </div>

          {order.financing_status === "pending" && showFinancingSimulationUi() && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900 text-base">Simulate KCB financing (dev)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" disabled={updating} onClick={() => simulateFinancing("approved")}>
                  Approve financing
                </Button>
                <Button size="sm" variant="outline" disabled={updating} onClick={() => simulateFinancing("declined")}>
                  Decline financing
                </Button>
              </CardContent>
            </Card>
          )}

          {order.financing_status === "approved" && order.payment_status === "pending" && (
            <Card className="mb-6 border-emerald-200 bg-emerald-50">
              <CardContent className="py-4 text-sm text-emerald-900">
                Financing approved{order.financing_reference ? ` (${order.financing_reference})` : ""}. Complete payment
                from your dashboard or use the test tools below.
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Status:</span>
                  <span className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">KES {order.total_amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`flex items-center gap-1 ${getStatusColor(order.payment_status)}`}>
                    {getStatusIcon(order.payment_status)}
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                {order.mpesa_transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm">{order.mpesa_transaction_id}</span>
                  </div>
                )}
                {order.payment_notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Notes:</span>
                    <span className="text-sm">{order.payment_notes}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{order.customer_email}</span>
                </div>
                
                {/* Manual Payment Completion - For Testing */}
                {order.payment_status !== 'paid' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      🔧 Manual Payment Completion
                    </h4>
                    <p className="text-xs text-blue-700 mb-3">
                      Mark this order as paid to trigger delivery workflow (for testing purposes):
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleManualPayment}
                        disabled={updating}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {updating ? "Processing..." : "✅ Mark as Paid"}
                      </Button>
                      {order.mpesa_checkout_request_id && (
                        <Button 
                          size="sm" 
                          onClick={() => simulateCallback('success')}
                          disabled={updating}
                          variant="outline"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          🧪 Simulate Success
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sandbox Testing Buttons */}
                {order.payment_status === 'pending' && process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                      🧪 Sandbox Testing (Development Only)
                    </h4>
                    <p className="text-xs text-yellow-700 mb-3">
                      Since this is a sandbox environment, simulate the payment result:
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => simulatePayment('success')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        ✅ Simulate Success
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => simulatePayment('failed')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        ❌ Simulate Failure
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product_name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {item.total_price.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">KES {item.unit_price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/products">Continue Shopping</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">View My Orders</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
