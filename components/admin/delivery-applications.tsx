"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Clock, Truck, Mail, Phone, MapPin, Car, Download, FileText, RefreshCw, Bike, Package, Shield, ExternalLink } from "lucide-react"
import { getDeliveryApplications, updateDeliveryStatus } from "@/app/actions/admin"

interface DeliveryApplication {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  national_id: string
  driver_license: string
  vehicle_type: string
  vehicle_registration: string
  address: string
  city: string
  country: string
  emergency_contact_name: string
  emergency_contact_phone: string
  bank_name: string
  account_number: string
  documents?: DocumentUpload[]
  status: string
  created_at: string
  updated_at?: string
}

interface DocumentUpload {
  url: string
  type: string
  name: string
  uploadedAt: string
}

export function DeliveryApplications() {
  const [applications, setApplications] = useState<DeliveryApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<DeliveryApplication | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    const result = await getDeliveryApplications()
    if (result.success) {
      setApplications(result.data || [])
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (applicationId: string, status: "approved" | "rejected") => {
    const result = await updateDeliveryStatus(applicationId, status)
    if (result.success) {
      await loadApplications()
      alert(result.message)
    } else {
      alert(result.error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-gray-100 text-gray-700 border border-gray-200 font-semibold hover:bg-gray-100">
            <Clock className="h-4 w-4 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-300 font-semibold hover:bg-green-100">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-200 font-semibold hover:bg-red-50">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "motorcycle":
        return Bike
      case "van":
        return Package
      case "truck":
        return Truck
      default:
        return Car
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading delivery applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-gray-700" />
            Delivery Partner Applications
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review and manage delivery partner applications</p>
        </div>
        <Button onClick={loadApplications} variant="outline" size="sm" className="h-8 rounded-xl border-gray-200 text-xs">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 bg-white">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-10 w-10 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No delivery applications yet</h3>
            <p className="text-gray-600">New applications will appear here for review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            const VehicleIcon = getVehicleIcon(app.vehicle_type)
            
            return (
              <Card key={app.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold text-lg">
                          {app.first_name.charAt(0)}{app.last_name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-900">
                            {app.first_name} {app.last_name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-gray-100 text-gray-700 border border-gray-200 font-semibold hover:bg-gray-100">
                              <VehicleIcon className="h-3 w-3 mr-1" />
                              {app.vehicle_type}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-xs hover:bg-gray-100">
                              {app.vehicle_registration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">Contact Information</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-semibold text-gray-900">{app.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{app.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-semibold text-gray-900">{app.city}, {app.country}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">Vehicle & License Details</h4>
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-gray-700" />
                          <p className="text-xs text-gray-700 font-semibold">Driver's License</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{app.driver_license}</p>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-gray-700" />
                          <p className="text-xs text-gray-700 font-semibold">National ID</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{app.national_id}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Applied Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(app.created_at || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {app.documents && app.documents.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-700" />
                        Documents ({app.documents.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {app.documents.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="h-auto py-3 border hover:border-gray-200 hover:bg-gray-100"
                          >
                            <FileText className="h-4 w-4 mr-2 text-gray-700" />
                            <span className="text-xs font-medium truncate">{doc.name}</span>
                            <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedApp(app)}
                      className="border"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>

                    {app.status === "pending" && (
                      <>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                          onClick={() => handleStatusUpdate(app.id!, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Partner
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleStatusUpdate(app.id!, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {selectedApp.first_name} {selectedApp.last_name}
                  </CardTitle>
                  <CardDescription>Complete Application Details</CardDescription>
                </div>
                <Button variant="ghost" size="lg" onClick={() => setSelectedApp(null)} className="text-2xl">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-gray-700" />
                    Personal & Vehicle Information
                  </h4>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p><strong>Full Name:</strong> {selectedApp.first_name} {selectedApp.last_name}</p>
                    <p><strong>National ID:</strong> {selectedApp.national_id}</p>
                    <p><strong>License:</strong> {selectedApp.driver_license}</p>
                    <p><strong>Vehicle Type:</strong> {selectedApp.vehicle_type}</p>
                    <p><strong>Registration:</strong> {selectedApp.vehicle_registration}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-700" />
                    Contact & Emergency
                  </h4>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Phone:</strong> {selectedApp.phone}</p>
                    <p><strong>Address:</strong> {selectedApp.address}</p>
                    <p><strong>City:</strong> {selectedApp.city}</p>
                    <p className="pt-2 border-t"><strong>Emergency Contact:</strong> {selectedApp.emergency_contact_name}</p>
                    <p><strong>Emergency Phone:</strong> {selectedApp.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Payment Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Bank:</strong> {selectedApp.bank_name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Account:</strong> {selectedApp.account_number}</p>
                  </div>
                </div>
              </div>

              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                    Uploaded Documents
                  </h4>
                  <div className="grid gap-3">
                    {selectedApp.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-700" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                          variant="outline"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.status === "pending" && (
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                    onClick={() => {
                      handleStatusUpdate(selectedApp.id!, "approved")
                      setSelectedApp(null)
                    }}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve Partner
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusUpdate(selectedApp.id!, "rejected")
                      setSelectedApp(null)
                    }}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}