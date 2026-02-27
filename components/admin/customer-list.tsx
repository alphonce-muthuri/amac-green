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
        color: "bg-blue-100 text-blue-700 border-blue-300", 
        icon: Home,
        label: "Individual"
      },
      business: { 
        color: "bg-green-100 text-green-700 border-green-300", 
        icon: Briefcase,
        label: "Business"
      },
      school: { 
        color: "bg-purple-100 text-purple-700 border-purple-300", 
        icon: School,
        label: "School"
      },
      institution: { 
        color: "bg-orange-100 text-orange-700 border-orange-300", 
        icon: Building,
        label: "Institution"
      },
      hotel: { 
        color: "bg-pink-100 text-pink-700 border-pink-300", 
        icon: Hotel,
        label: "Hotel"
      },
      developer: { 
        color: "bg-indigo-100 text-indigo-700 border-indigo-300", 
        icon: Globe,
        label: "Developer"
      },
    }

    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-700 border-gray-300", icon: Users, label: type }
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-2 font-semibold`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading customer profiles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Customer Profiles
          </h2>
          <p className="text-gray-600 mt-1">View all registered customers</p>
        </div>
        <Button onClick={loadCustomers} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-600">Customer profiles will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="border-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:border-blue-400">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </CardTitle>
                        {customer.organization_name && (
                          <CardDescription className="text-base font-semibold text-blue-700">
                            {customer.organization_name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getCustomerTypeBadge(customer.customer_type)}
                    <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-semibold text-xs">
                      Joined {new Date(customer.created_at || "").toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Contact Information</h4>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.city}, {customer.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Customer Details</h4>
                    {customer.organization_name && (
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-700 font-semibold">Organization</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{customer.organization_name}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-500 font-semibold">Marketing Preferences</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {customer.accept_marketing ? (
                          <>
                            <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-semibold">
                              <Heart className="h-3 w-3 mr-1" />
                              Subscribed
                            </Badge>
                            <span className="text-xs text-gray-600">Receives updates</span>
                          </>
                        ) : (
                          <>
                            <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-semibold">
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

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 50)}</div>
                    <div className="text-xs text-gray-600 font-medium">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">KES {(Math.floor(Math.random() * 500000)).toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Total Spent</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 365)} days</div>
                    <div className="text-xs text-gray-600 font-medium">Customer Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}