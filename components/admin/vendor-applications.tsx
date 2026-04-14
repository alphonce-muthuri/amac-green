"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Clock, Building2, Mail, Phone, MapPin, FileText, Download, ExternalLink, RefreshCw } from "lucide-react"
import { getVendorApplications, updateVendorStatus } from "@/app/actions/admin"
import type { VendorApplication } from "@/lib/supabase"

export function VendorApplications() {
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    const result = await getVendorApplications()
    if (result.success) {
      setApplications(result.data || [])
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (applicationId: string, status: "approved" | "rejected") => {
    const result = await updateVendorStatus(applicationId, status)
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

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading vendor applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gray-700" />
            Vendor Applications
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review and manage supplier applications</p>
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
              <Building2 className="h-10 w-10 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No vendor applications yet</h3>
            <p className="text-gray-600">New applications will appear here for review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <Card key={app.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-gray-900 mb-2">{app.company_name}</CardTitle>
                    <CardDescription className="text-sm">
                      <span className="font-semibold text-gray-700">Contact:</span> {app.contact_person} • 
                      <span className="font-semibold text-gray-700 ml-2">Type:</span> {app.business_type}
                    </CardDescription>
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
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">Business Details</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tax ID</p>
                      <p className="text-sm font-semibold text-gray-900">{app.tax_id}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Bank</p>
                      <p className="text-sm font-semibold text-gray-900">{app.bank_name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Applied</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(app.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {app.description && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">{app.description}</p>
                  </div>
                )}

                {app.documents && app.documents.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
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
                        Approve Application
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
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">{selectedApp.company_name}</CardTitle>
                  <CardDescription>Complete Application Details</CardDescription>
                </div>
                <Button variant="ghost" size="lg" onClick={() => setSelectedApp(null)} className="text-2xl">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Rest of detail modal content remains similar but with improved styling */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-700" />
                    Company Information
                  </h4>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p><strong>Company:</strong> {selectedApp.company_name}</p>
                    <p><strong>Contact Person:</strong> {selectedApp.contact_person}</p>
                    <p><strong>Business Type:</strong> {selectedApp.business_type}</p>
                    <p><strong>Website:</strong> {selectedApp.website || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Financial Information</h4>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p><strong>Tax ID:</strong> {selectedApp.tax_id}</p>
                    <p><strong>Bank Name:</strong> {selectedApp.bank_name}</p>
                    <p><strong>Account:</strong> {selectedApp.account_number}</p>
                  </div>
                </div>
              </div>

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
                    Approve Application
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