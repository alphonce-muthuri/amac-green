"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  MapPin, 
  Calendar,
  Eye,
  DollarSign,
  Clock,
  TrendingUp,
  Award,
  XCircle,
  CheckCircle2,
  Package,
  AlertCircle,
  Filter,
  BarChart3,
  Zap
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AppShellSkeleton } from "@/components/loaders/page-skeletons"
import { ProfessionalPageShell } from "@/components/professional/professional-page-shell"

export default function MyBidsPage() {
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchMyBids()
  }, [])

  const fetchMyBids = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("installation_bids")
        .select(`
          *,
          installation_jobs!installation_bids_job_id_fkey (
            id,
            title,
            description,
            location_city,
            location_address,
            status,
            total_product_cost,
            preferred_date,
            urgency,
            installation_job_items (
              id,
              product_name,
              product_price,
              quantity
            )
          )
        `)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching bids:", error)
      } else {
        setBids(data || [])
      }
    } catch (error) {
      console.error("Error fetching bids:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700 border border-gray-200"
      case "accepted":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
      case "rejected":
        return "bg-gray-900 text-white"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
      case "bidding":
        return "bg-gray-100 text-gray-700 border border-gray-200"
      case "assigned":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
      case "in_progress":
        return "bg-gray-100 text-gray-700 border border-gray-200"
      case "completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const filteredBids = bids.filter(bid => 
    filterStatus === "all" || bid.status === filterStatus
  )

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
    totalValue: bids.reduce((sum, b) => sum + (b.total_bid_amount || 0), 0),
    acceptedValue: bids.filter(b => b.status === 'accepted').reduce((sum, b) => sum + (b.total_bid_amount || 0), 0)
  }

  const winRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0

  if (loading) {
    return <AppShellSkeleton />
  }

  return (
    <>
      <ProfessionalPageShell title="My Bids">
        <div className="space-y-4">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-2">Bids Pipeline</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Performance overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Track outcomes and improve your close rate.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">{winRate}% win rate</Badge>
                    <Badge className="bg-gray-100 text-gray-700 border border-gray-200">{stats.total} bids</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-semibold text-gray-900">{stats.total}</p></CardContent></Card>
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-semibold text-gray-900">{stats.pending}</p></CardContent></Card>
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">Accepted</p><p className="text-xl font-semibold text-gray-900">{stats.accepted}</p></CardContent></Card>
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">Won Value</p><p className="text-xl font-semibold text-gray-900">KSH {stats.acceptedValue.toLocaleString()}</p></CardContent></Card>
          </div>

          {/* Filter */}
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 h-10 px-3 border border-gray-200 rounded-md text-sm"
                >
                  <option value="all">All Bids ({stats.total})</option>
                  <option value="pending">Pending ({stats.pending})</option>
                  <option value="accepted">Accepted ({stats.accepted})</option>
                  <option value="rejected">Rejected ({stats.rejected})</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Bids List */}
          {filteredBids.length === 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-3">
                  {filterStatus === "all" ? "No Bids Submitted Yet" : `No ${filterStatus} Bids`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filterStatus === "all" 
                    ? "Start bidding on available installation jobs to see them here"
                    : `You don't have any ${filterStatus} bids at the moment`
                  }
                </p>
                <Button 
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <a href="/professional/jobs">Browse Available Jobs</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBids.map((bid) => (
                <Card
                  key={bid.id} 
                  className="group border border-gray-100 hover:bg-gray-50/70 transition-colors"
                >
            <CardHeader className="pb-3 bg-white border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-700">
                          {getStatusIcon(bid.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                            {bid.installation_jobs?.title}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {bid.installation_jobs?.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Badge className={`${getStatusBadge(bid.status)} px-3 py-1 text-xs font-bold uppercase`}>
                          {bid.status}
                        </Badge>
                        <Badge className={`${getJobStatusBadge(bid.installation_jobs?.status)} px-3 py-1 text-xs font-bold uppercase`}>
                          {bid.installation_jobs?.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Info Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-600">Location</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{bid.installation_jobs?.location_city}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-gray-600">My Bid</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-700">
                          KSH {bid.total_bid_amount?.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-emerald-700" />
                          <span className="text-xs font-semibold text-gray-600">Submitted</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(bid.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {bid.estimated_duration_hours && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-700" />
                            <span className="text-xs font-semibold text-gray-600">Duration</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {bid.estimated_duration_hours}h estimated
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-gray-600">
                        Product Cost: <span className="font-bold text-gray-900">KSH {bid.installation_jobs?.total_product_cost?.toLocaleString()}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedBid(bid)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
      </ProfessionalPageShell>

      {/* Bid Details Modal */}
      {selectedBid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Bid Details</CardTitle>
                    <CardDescription>{selectedBid.installation_jobs?.title}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-2xl h-10 w-10 p-0 hover:bg-gray-900 hover:text-gray-700"
                  onClick={() => setSelectedBid(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-sm text-gray-600 mr-2">Bid Status:</span>
                  <Badge className={`${getStatusBadge(selectedBid.status)} px-4 py-2 text-sm`}>
                    {getStatusIcon(selectedBid.status)}
                    <span className="ml-2 uppercase font-bold">{selectedBid.status}</span>
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600 mr-2">Job Status:</span>
                  <Badge className={`${getJobStatusBadge(selectedBid.installation_jobs?.status)} px-4 py-2 text-sm uppercase font-bold`}>
                    {selectedBid.installation_jobs?.status}
                  </Badge>
                </div>
              </div>

              {/* Job Information */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-700 border border-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Job Information</h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Location</p>
                    <p className="text-sm text-gray-900">{selectedBid.installation_jobs?.location_address}</p>
                    <p className="text-sm font-bold text-emerald-700">{selectedBid.installation_jobs?.location_city}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Product Cost</p>
                    <p className="text-xl font-bold tracking-tight text-emerald-600">
                      KSH {selectedBid.installation_jobs?.total_product_cost?.toLocaleString()}
                    </p>
                  </div>

                  {selectedBid.installation_jobs?.preferred_date && (
                    <div className="bg-white p-4 rounded-xl sm:col-span-2">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Preferred Date</p>
                      <p className="text-lg font-bold text-emerald-700">
                        {new Date(selectedBid.installation_jobs.preferred_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                  <p className="text-sm text-gray-900">{selectedBid.installation_jobs?.description}</p>
                </div>
              </div>

              {/* Products */}
              {selectedBid.installation_jobs?.installation_job_items && selectedBid.installation_jobs.installation_job_items.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-emerald-700" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">Products to Install</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedBid.installation_jobs.installation_job_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">
                          <span className="text-emerald-600">{item.quantity}x</span> {item.product_name}
                        </span>
                        <span className="text-sm font-bold text-emerald-700">
                          KSH {(item.product_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Bid Details */}
              <div className="bg-emerald-50/40 p-6 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-700" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Your Bid Breakdown</h4>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-2">Labor Cost</p>
                    <p className="text-xl font-bold text-emerald-700">
                      KSH {selectedBid.labor_cost?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-2">Material Cost</p>
                    <p className="text-xl font-bold text-gray-700">
                      KSH {selectedBid.material_cost?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-2">Additional</p>
                    <p className="text-xl font-bold text-emerald-700">
                      KSH {selectedBid.additional_costs?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Bid Amount:</span>
                    <span className="text-xl font-bold tracking-tight text-emerald-700">
                      KSH {selectedBid.total_bid_amount?.toLocaleString()}
                    </span>
                  </div>
                  {selectedBid.estimated_duration_hours && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-sm text-gray-600">Estimated Duration:</span>
                      <span className="text-sm font-bold text-gray-900">{selectedBid.estimated_duration_hours} hours</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposal Notes */}
              {selectedBid.proposal_notes && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-emerald-700" />
                    <h4 className="font-bold text-lg text-gray-900">Your Proposal</h4>
                  </div>
                  <p className="text-sm bg-white p-4 rounded-lg border border-gray-100">{selectedBid.proposal_notes}</p>
                </div>
              )}

              {/* Submission Info */}
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
                <div className="grid sm:grid-cols-2 gap-2">
                  <p><strong className="text-gray-900">Submitted:</strong> {new Date(selectedBid.created_at).toLocaleString()}</p>
                  {selectedBid.updated_at !== selectedBid.created_at && (
                    <p><strong className="text-gray-900">Last Updated:</strong> {new Date(selectedBid.updated_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}