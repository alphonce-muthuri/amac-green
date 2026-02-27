"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Clock, UserCheck, Mail, Phone, MapPin, FileText, Download, ExternalLink, RefreshCw, Award, Briefcase } from "lucide-react"
import { getProfessionalApplications, updateProfessionalStatus } from "@/app/actions/admin"
import type { ProfessionalApplication } from "@/lib/supabase"

export function ProfessionalApplications() {
  const [applications, setApplications] = useState<ProfessionalApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<ProfessionalApplication | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    const result = await getProfessionalApplications()
    if (result.success) {
      setApplications(result.data || [])
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (applicationId: string, status: "approved" | "rejected") => {
    const result = await updateProfessionalStatus(applicationId, status)
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
          <Badge className="bg-emerald-100 text-emerald-700 border-2 border-emerald-300 font-bold">
            <Clock className="h-4 w-4 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-bold">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-2 border-red-300 font-bold">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProfessionalTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      installer: "bg-blue-100 text-blue-700 border-blue-300",
      distributor: "bg-purple-100 text-purple-700 border-purple-300",
      wholesaler: "bg-indigo-100 text-indigo-700 border-indigo-300",
    }

    return (
      <Badge className={`${colors[type] || "bg-gray-100 text-gray-700 border-gray-300"} border-2 font-semibold`}>
        <Briefcase className="h-3 w-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading professional applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Professional Applications
          </h2>
          <p className="text-gray-600 mt-1">Review installers, distributors & wholesalers</p>
        </div>
        <Button onClick={loadApplications} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No professional applications yet</h3>
            <p className="text-gray-600">New applications will appear here for review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <Card key={app.id} className="border-2 border-emerald-200 hover:shadow-2xl transition-all duration-300 hover:border-emerald-400">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl font-bold text-gray-900">{app.company_name}</CardTitle>
                      {getProfessionalTypeBadge(app.professional_type)}
                    </div>
                    <CardDescription className="text-base">
                      <span className="font-semibold text-emerald-700">Contact:</span> {app.contact_person}
                    </CardDescription>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Contact Information</h4>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{app.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{app.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{app.city}, {app.country}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Licenses & Credentials</h4>
                    <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs text-emerald-700 font-semibold">License Number</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{app.license_number || "Not provided"}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs text-emerald-700 font-semibold">EPRA License</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{app.epra_license || "Not provided"}</p>
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
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Documents ({app.documents.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {app.documents.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                          className="h-auto py-3 border-2 hover:border-emerald-400 hover:bg-emerald-50"
                        >
                          <FileText className="h-4 w-4 mr-2 text-emerald-600" />
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
                    className="border-2"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>

                  {app.status === "pending" && (
                    <>
                      <Button
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                        onClick={() => handleStatusUpdate(app.id!, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleStatusUpdate(app.id!, "rejected")}
                        className="bg-gradient-to-r from-red-600 to-rose-600"
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
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-300 shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{selectedApp.company_name}</CardTitle>
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
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    Professional Information
                  </h4>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p><strong>Organization:</strong> {selectedApp.company_name}</p>
                    <p><strong>Contact Person:</strong> {selectedApp.contact_person}</p>
                    <p><strong>Professional Type:</strong> {selectedApp.professional_type}</p>
                    <p><strong>License Number:</strong> {selectedApp.license_number || "Not provided"}</p>
                    <p><strong>EPRA License:</strong> {selectedApp.epra_license || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Phone:</strong> {selectedApp.phone}</p>
                    <p><strong>Address:</strong> {selectedApp.address}</p>
                    <p><strong>City:</strong> {selectedApp.city}</p>
                    <p><strong>Country:</strong> {selectedApp.country}</p>
                  </div>
                </div>
              </div>

              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Uploaded Documents
                  </h4>
                  <div className="grid gap-3">
                    {selectedApp.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-emerald-600" />
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
                          className="bg-emerald-600 hover:bg-emerald-700"
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
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
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
                    className="bg-gradient-to-r from-red-600 to-rose-600"
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