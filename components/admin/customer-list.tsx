"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Phone, MapPin, Building, RefreshCw, Heart, Sparkles, Globe, School, Hotel, Home, Briefcase } from "lucide-react"
import { getCustomerProfiles } from "@/app/actions/admin"
import type { CustomerProfile } from "@/lib/supabase"

export function CustomerList() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    const result = await getCustomerProfiles()
    if (result.success) {
      setCustomers(result.data || [])
    }
    setLoading(false)
  }

  const getCustomerTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string; icon: any; label: string }> = {
      individual: { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
        icon: Home,
        label: "Individual"
      },
      business: { 
        color: "bg-green-100 text-green-700 border-green-300", 
        icon: Briefcase,
        label: "Business"
      },
      school: { 
        color: "bg-gray-100 text-gray-700 border-gray-200", 
        icon: School,
        label: "School"
      },
      institution: { 
        color: "bg-gray-100 text-gray-700 border-gray-200", 
        icon: Building,
        label: "Institution"
      },
      hotel: { 
        color: "bg-gray-100 text-gray-700 border-gray-200", 
        icon: Hotel,
        label: "Hotel"
      },
      developer: { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
        icon: Globe,
        label: "Developer"
      },
    }

    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-700 border-gray-300", icon: Users, label: type }
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border font-semibold`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading customer profiles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Customer Profiles
          </h2>
          <p className="text-sm text-gray-500 mt-1">View all registered customers</p>
        </div>
        <Button onClick={loadCustomers} variant="outline" size="sm" className="h-8 rounded-xl border-gray-200 text-xs">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 bg-white">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-600">Customer profiles will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-lg">
                        {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </CardTitle>
                        {customer.organization_name && (
                          <CardDescription className="text-sm font-medium text-gray-600">
                            {customer.organization_name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getCustomerTypeBadge(customer.customer_type)}
                    <Badge className="bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs hover:bg-gray-100">
                      Joined {new Date(customer.created_at || "").toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">Contact Information</h4>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.city}, {customer.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">Customer Details</h4>
                    {customer.organization_name && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs text-emerald-700 font-semibold">Organization</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{customer.organization_name}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <p className="text-xs text-gray-500 font-semibold">Marketing Preferences</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {customer.accept_marketing ? (
                          <>
                            <Badge className="bg-green-100 text-green-700 border border-green-300 font-semibold hover:bg-green-100">
                              <Heart className="h-3 w-3 mr-1" />
                              Subscribed
                            </Badge>
                            <span className="text-xs text-gray-600">Receives updates</span>
                          </>
                        ) : (
                          <>
                            <Badge className="bg-gray-100 text-gray-700 border border-gray-300 font-semibold hover:bg-gray-100">
                              Not Subscribed
                            </Badge>
                            <span className="text-xs text-gray-600">No marketing emails</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Customer Type</p>
                      <div className="flex items-center gap-2">
                        {getCustomerTypeBadge(customer.customer_type)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500">
                    Joined {new Date(customer.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}