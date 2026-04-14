"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Zap
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

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
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-full text-xs py-0.5 px-2">
            <Clock className="h-3 w-3 mr-1" />
            Open
          </Badge>
        )
      case "bidding":
        return (
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-full text-xs py-0.5 px-2">
            <Users className="h-3 w-3 mr-1" />
            Bidding
          </Badge>
        )
      case "assigned":
        return (
          <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold rounded-full text-xs py-0.5 px-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Assigned
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold rounded-full text-xs py-0.5 px-2">
            <Zap className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold rounded-full text-xs py-0.5 px-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-full text-xs py-0.5 px-2">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Installation Services</h1>
          <p className="text-xs text-gray-500 mt-0.5">Request professional installation for your renewable energy products</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 h-8 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1.5 text-xs">Refresh</span>
          </Button>
          <Link href="/dashboard/installations/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Request Installation</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Package, label: "Total", value: stats.total },
          { icon: Clock, label: "Open", value: stats.open },
          { icon: Zap, label: "Active", value: stats.assigned },
          { icon: CheckCircle, label: "Done", value: stats.completed },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border border-emerald-200/60">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className="w-7 h-7 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="border border-emerald-200/60">
          <CardContent className="text-center py-12">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Hammer className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Installation Requests Yet</h3>
            <p className="text-sm text-gray-500 mb-4 px-4">
              Start by requesting professional installation for your renewable energy products.
            </p>
            <Link href="/dashboard/installations/new">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Request Your First Installation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.id} className="border border-emerald-200/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 truncate">{job.title}</span>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {job.location_city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-emerald-600" />
                        {job.installation_bids?.length || 0} bid{job.installation_bids?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Cost + actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Product cost</p>
                      <p className="text-sm font-bold text-gray-900">KES {job.total_product_cost.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                        className="h-7 px-2 text-xs border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                      >
                        <Eye className="h-3.5 w-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>
                      {job.installation_bids && job.installation_bids.length > 0 && (
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => setSelectedJobForBids(job)}
                        >
                          Bids ({job.installation_bids.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-4 sm:p-6">
          <Card className="mx-auto mt-4 sm:mt-10 flex max-h-[86vh] w-full max-w-xl flex-col overflow-hidden border border-slate-200 shadow-2xl">
            <CardHeader className="shrink-0 border-b border-slate-200 bg-white py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">{selectedJob.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)} className="h-7 w-7 rounded-full p-0 text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</h4>
                <p className="text-sm text-slate-700 bg-white border border-slate-200 p-3 rounded-lg">
                  {selectedJob.description || "No additional description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 p-3 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Location</h4>
                  <p className="text-sm text-slate-800 font-medium">{selectedJob.location_city}</p>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Status</h4>
                  {getStatusBadge(selectedJob.status)}
                </div>
              </div>

              {selectedJob.installation_job_items && selectedJob.installation_job_items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Products to Install</h4>
                  <div className="space-y-1.5">
                    {selectedJob.installation_job_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-500">KES {item.product_price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">KES {(item.product_price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Total Product Cost</span>
                <span className="text-lg font-bold text-slate-900">KES {selectedJob.total_product_cost?.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bids Review Modal */}
      {selectedJobForBids && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-4 sm:p-6">
          <Card className="mx-auto mt-4 sm:mt-8 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden border border-slate-200 shadow-2xl">
            <CardHeader className="shrink-0 border-b border-slate-200 bg-white/95 py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">Review Bids - {selectedJobForBids.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedJobForBids(null)} className="h-7 w-7 rounded-full p-0 text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70">
              {/* Job Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { label: "Location", value: selectedJobForBids.location_city },
                  { label: "Posted", value: new Date(selectedJobForBids.created_at).toLocaleDateString() },
                  { label: "Product Cost", value: `KES ${selectedJobForBids.total_product_cost?.toLocaleString()}` },
                  { label: "Status", value: null, badge: getStatusBadge(selectedJobForBids.status) },
                ].map(({ label, value, badge }) => (
                  <div key={label} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <p className="text-slate-400 font-medium mb-0.5">{label}</p>
                    {badge ?? <p className="font-semibold text-slate-800">{value}</p>}
                  </div>
                ))}
              </div>

              {/* Bids */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  Professional Bids ({selectedJobForBids.installation_bids?.length || 0})
                </h4>

                {selectedJobForBids.installation_bids && selectedJobForBids.installation_bids.length > 0 ? (
                  <div className="space-y-3">
                    {selectedJobForBids.installation_bids.map((bid: any, index: number) => (
                      <div key={bid.id} className="border rounded-xl p-3 border-slate-200 bg-white">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Professional Bid #{index + 1}</p>
                            <p className="text-xs text-gray-400">ID: {bid.professional_id.slice(0, 8)}</p>
                            <Badge variant={
                              bid.status === 'pending' ? 'secondary' :
                              bid.status === 'accepted' ? 'default' : 'destructive'
                            } className="mt-1 text-[10px]">
                              {bid.status}
                            </Badge>
                          </div>
                          <div className="text-right bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
                            <p className="text-xl font-extrabold text-slate-900">KES {bid.total_bid_amount?.toLocaleString() || 0}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Installation Cost</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {[
                            { label: "Labor", value: bid.labor_cost },
                            { label: "Materials", value: bid.material_cost },
                            { label: "Additional", value: bid.additional_costs },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-slate-50 p-2 rounded-lg text-center border border-slate-200/80">
                              <p className="text-[10px] text-slate-500">{label}</p>
                              <p className="text-xs font-semibold text-slate-800">KES {value?.toLocaleString() || 0}</p>
                            </div>
                          ))}
                        </div>

                        {bid.estimated_duration_hours && (
                          <p className="text-xs text-slate-700 font-semibold bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 mb-2">
                            ⏱ Est. {bid.estimated_duration_hours} hours
                          </p>
                        )}

                        {bid.proposal_notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-2">{bid.proposal_notes}</p>
                        )}

                        {bid.status === 'pending' && selectedJobForBids.status !== 'assigned' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 flex-1 h-8 text-xs"
                              onClick={() => handleBidAction(bid.id, 'accept')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-slate-900 hover:bg-slate-800 h-8 text-xs"
                              onClick={() => handleBidAction(bid.id, 'reject')}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {bid.status === 'accepted' && (
                          <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200/60 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-800">Bid accepted</p>
                              <p className="text-xs text-emerald-700">Professional assigned to your job</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                    <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No bids received yet</p>
                    <p className="text-xs mt-0.5">Professionals will submit bids for your installation job</p>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              {selectedJobForBids.installation_bids && selectedJobForBids.installation_bids.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Cost Comparison</h4>
                  {[
                    { label: "Product Cost", value: selectedJobForBids.total_product_cost, color: "text-gray-900" },
                    { label: "Lowest Bid", value: Math.min(...selectedJobForBids.installation_bids.map((b: any) => b.total_bid_amount || 0)), color: "text-emerald-700" },
                    { label: "Highest Bid", value: Math.max(...selectedJobForBids.installation_bids.map((b: any) => b.total_bid_amount || 0)), color: "text-gray-700" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-200/70">
                      <span className="text-slate-600 font-medium">{label}</span>
                      <span className={`font-bold ${color}`}>KES {value?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center bg-emerald-700 px-3 py-2.5 rounded-lg text-white mt-1">
                    <span className="text-sm font-bold">Total (lowest bid)</span>
                    <span className="text-base font-extrabold">
                      KES {(selectedJobForBids.total_product_cost + Math.min(...selectedJobForBids.installation_bids.map((b: any) => b.total_bid_amount || 0))).toLocaleString()}
                    </span>
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
