"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  Hammer, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  TrendingUp,
  DollarSign,
  Zap
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function CustomerInstallationsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [selectedJobForBids, setSelectedJobForBids] = useState<any>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error("User not authenticated")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("installation_jobs")
        .select(`
          *,
          installation_job_items (
            id,
            product_name,
            product_price,
            quantity
          ),
          installation_bids!installation_bids_job_id_fkey (
            id,
            total_bid_amount,
            labor_cost,
            material_cost,
            additional_costs,
            estimated_duration_hours,
            proposal_notes,
            status,
            professional_id,
            created_at
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching jobs:", error)
      } else {
        setJobs(data || [])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchJobs()
  }

  const handleBidAction = async (bidId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from("installation_bids")
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq("id", bidId)

      if (error) {
        console.error("Error updating bid:", error)
        alert("Error updating bid. Please try again.")
        return
      }

      if (action === 'accept') {
        const { error: jobError } = await supabase
          .from("installation_jobs")
          .update({ 
            status: 'assigned',
            selected_bid_id: bidId
          })
          .eq("id", selectedJobForBids.id)

        if (jobError) {
          console.error("Error updating job:", jobError)
          alert("Error assigning job. Please try again.")
          return
        }

        await supabase
          .from("installation_bids")
          .update({ status: 'rejected' })
          .eq("job_id", selectedJobForBids.id)
          .neq("id", bidId)
          .eq("status", "pending")
      }

      alert(`Bid ${action}ed successfully!`)
      setSelectedJobForBids(null)
      fetchJobs()

    } catch (error) {
      console.error("Error handling bid action:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-300 font-bold">
            <Clock className="h-3 w-3 mr-1" />
            Open for Bids
          </Badge>
        )
      case "bidding":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-2 border-purple-300 font-bold">
            <Users className="h-3 w-3 mr-1" />
            Receiving Bids
          </Badge>
        )
      case "assigned":
        return (
          <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-bold">
            <CheckCircle className="h-3 w-3 mr-1" />
            Assigned
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-2 border-amber-300 font-bold">
            <Zap className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-2 border-emerald-300 font-bold">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-2 border-red-300 font-bold">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open' || j.status === 'bidding').length,
    assigned: jobs.filter(j => j.status === 'assigned' || j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading installation requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Installation Services</h1>
          <p className="text-gray-600 mt-1">Request professional installation for your renewable energy products</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link href="/dashboard/installations/new" className="flex-1 sm:flex-none">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 w-full">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Request Installation</span>
              <span className="sm:hidden">New Request</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hammer className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Installation Requests Yet</h3>
            <p className="text-gray-600 mb-4 px-4">
              Start by requesting professional installation services for your renewable energy products.
            </p>
            <Link href="/dashboard/installations/new">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Installation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900">{job.title}</CardTitle>
                    <CardDescription className="mt-1">{job.description}</CardDescription>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{job.location_city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Users className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{job.installation_bids?.length || 0} Bid{job.installation_bids?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border-2 border-emerald-200">
                    <span className="text-sm text-emerald-700 font-semibold">Product Cost</span>
                    <p className="text-2xl font-bold text-emerald-900">
                      KES {job.total_product_cost.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedJob(job)}
                      className="w-full sm:w-auto border-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {job.installation_bids && job.installation_bids.length > 0 && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 w-full sm:w-auto"
                        onClick={() => setSelectedJobForBids(job)}
                      >
                        Review Bids ({job.installation_bids.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-300">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedJob.title}</CardTitle>
                <Button variant="ghost" size="lg" onClick={() => setSelectedJob(null)} className="text-2xl">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Job Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedJob.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Location</h4>
                  <p className="text-sm text-gray-700">{selectedJob.location_city}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Status</h4>
                  {getStatusBadge(selectedJob.status)}
                </div>
              </div>

              {selectedJob.installation_job_items && selectedJob.installation_job_items.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Products to Install</h4>
                  <div className="space-y-2">
                    {selectedJob.installation_job_items.map((item: any) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                        <div>
                          <p className="font-semibold text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-600">KES {item.product_price.toLocaleString()} each</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-bold text-emerald-700">KES {(item.product_price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-6 rounded-xl border-2 border-emerald-300">
                <h4 className="font-bold text-gray-900 mb-2">Total Product Cost</h4>
                <p className="text-3xl font-extrabold text-emerald-700">
                  KES {selectedJob.total_product_cost?.toLocaleString() || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bids Review Modal - continues in next part due to length */}
      {selectedJobForBids && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-4xl w-full my-8 border-2 border-blue-300">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 border-b sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Review Bids - {selectedJobForBids.title}</CardTitle>
                <Button variant="ghost" size="lg" onClick={() => setSelectedJobForBids(null)} className="text-2xl">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Job Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Job Summary</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{selectedJobForBids.location_city}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedJobForBids.status)}
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">Product Cost</p>
                    <p className="font-semibold text-emerald-700">KES {selectedJobForBids.total_product_cost?.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">Posted</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedJobForBids.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Bids List */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Professional Bids ({selectedJobForBids.installation_bids?.length || 0})
                </h4>
                
                {selectedJobForBids.installation_bids && selectedJobForBids.installation_bids.length > 0 ? (
                  <div className="space-y-4">
                    {selectedJobForBids.installation_bids.map((bid: any, index: number) => (
                      <div key={bid.id} className="border-2 rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <h5 className="font-bold text-gray-900">Professional Bid #{index + 1}</h5>
                            <p className="text-sm text-gray-600">ID: {bid.professional_id.slice(0, 8)}</p>
                            <Badge variant={
                              bid.status === 'pending' ? 'secondary' : 
                              bid.status === 'accepted' ? 'default' : 'destructive'
                            } className="mt-2">
                              {bid.status}
                            </Badge>
                          </div>
                          <div className="text-left sm:text-right bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                              KES {bid.total_bid_amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-blue-600 font-semibold">Installation Cost</p>
                          </div>
                        </div>

                        {/* Bid Details */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Labor</p>
                            <p className="font-semibold text-sm">KES {bid.labor_cost?.toLocaleString() || 0}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Materials</p>
                            <p className="font-semibold text-sm">KES {bid.material_cost?.toLocaleString() || 0}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Additional</p>
                            <p className="font-semibold text-sm">KES {bid.additional_costs?.toLocaleString() || 0}</p>
                          </div>
                        </div>

                        {bid.estimated_duration_hours && (
                          <div className="mb-4 bg-amber-50 p-3 rounded-lg border-2 border-amber-200">
                            <p className="text-sm text-amber-700 font-semibold">
                              ⏱️ Estimated Duration: {bid.estimated_duration_hours} hours
                            </p>
                          </div>
                        )}

                        {bid.proposal_notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 font-semibold mb-2">Proposal Notes:</p>
                            <p className="text-sm bg-gray-50 p-4 rounded-lg border">{bid.proposal_notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {bid.status === 'pending' && selectedJobForBids.status !== 'assigned' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex-1"
                              onClick={() => handleBidAction(bid.id, 'accept')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Bid
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="bg-gradient-to-r from-red-600 to-rose-600"
                              onClick={() => handleBidAction(bid.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {bid.status === 'accepted' && (
                          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                            <p className="text-green-800 font-bold flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              This bid has been accepted
                            </p>
                            <p className="text-green-700 text-sm mt-1">The professional has been assigned to your job</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold">No bids received yet</p>
                    <p className="text-sm mt-1">Professionals will submit bids for your installation job</p>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              {selectedJobForBids.installation_bids && selectedJobForBids.installation_bids.length > 0 && (
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl border-2 border-blue-300">
                  <h4 className="font-bold text-gray-900 mb-4">Cost Comparison</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Product Cost:</span>
                      <span className="font-bold text-gray-900">KES {selectedJobForBids.total_product_cost?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Lowest Bid:</span>
                      <span className="font-bold text-green-600">
                        KES {Math.min(...selectedJobForBids.installation_bids.map((bid: any) => bid.total_bid_amount || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Highest Bid:</span>
                      <span className="font-bold text-red-600">
                        KES {Math.max(...selectedJobForBids.installation_bids.map((bid: any) => bid.total_bid_amount || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-blue-300 my-2"></div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-lg text-white">
                      <span className="font-bold">Total (with lowest bid):</span>
                      <span className="text-2xl font-extrabold">
                        KES {(selectedJobForBids.total_product_cost + Math.min(...selectedJobForBids.installation_bids.map((bid: any) => bid.total_bid_amount || 0))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}