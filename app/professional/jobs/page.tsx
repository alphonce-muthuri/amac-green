"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Hammer, 
  MapPin, 
  Calendar,
  Eye,
  Send,
  Package,
  DollarSign,
  Clock,
  Zap,
  Search,
  Filter,
  TrendingUp,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Target,
  Award,
  Calculator
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AppShellSkeleton } from "@/components/loaders/page-skeletons"
import { ProfessionalPageShell } from "@/components/professional/professional-page-shell"

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUrgency, setFilterUrgency] = useState<string>("all")
  const [bidForm, setBidForm] = useState({
    laborCost: '',
    materialCost: '',
    additionalCosts: '',
    estimatedHours: '',
    proposalNotes: ''
  })

  useEffect(() => {
    fetchAvailableJobs()
  }, [])

  const fetchAvailableJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("installation_jobs")
        .select(`
          *,
          installation_job_items (
            id,
            product_name,
            product_price,
            quantity
          )
        `)
        .in("status", ["open", "bidding"])
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
    }
  }

  const submitBid = async (jobId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const laborCost = parseFloat(bidForm.laborCost)
      const materialCost = parseFloat(bidForm.materialCost) || 0
      const additionalCosts = parseFloat(bidForm.additionalCosts) || 0
      const totalBidAmount = laborCost + materialCost + additionalCosts

      const { error } = await supabase
        .from("installation_bids")
        .insert({
          job_id: jobId,
          professional_id: user.id,
          labor_cost: laborCost,
          material_cost: materialCost,
          additional_costs: additionalCosts,
          total_bid_amount: totalBidAmount,
          estimated_duration_hours: parseInt(bidForm.estimatedHours) || null,
          proposal_notes: bidForm.proposalNotes,
        })

      if (error) {
        console.error("Error submitting bid:", error)
        alert("Error submitting bid. Please try again.")
      } else {
        try {
          const { data: jobWithCustomer, error: jobError } = await supabase
            .from("installation_jobs")
            .select(`
              customer_id,
              title,
              installation_bids (id)
            `)
            .eq("id", jobId)
            .single()

          if (!jobError && jobWithCustomer) {
            const { data: customerData, error: customerError } = await supabase
              .from("customer_profiles")
              .select("email, first_name, last_name")
              .eq("user_id", jobWithCustomer.customer_id)
              .single()

            if (!customerError && customerData) {
              const response = await fetch("/api/email/installation-notifications", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "new-bid",
                  customerEmail: customerData.email,
                  customerName: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Customer',
                  jobTitle: jobWithCustomer.title,
                  bidAmount: totalBidAmount,
                  totalBids: (jobWithCustomer.installation_bids?.length || 0) + 1,
                  jobId: jobId
                })
              })
              
              const emailResult = await response.json()
              if (emailResult.success) {
                console.log('[BID_SUBMISSION] Customer notification sent successfully')
              }
            }
          }
        } catch (emailError) {
          console.error('[BID_SUBMISSION] Error sending customer notification:', emailError)
        }

        alert("Bid submitted successfully! The customer has been notified.")
        setSelectedJob(null)
        setBidForm({
          laborCost: '',
          materialCost: '',
          additionalCosts: '',
          estimatedHours: '',
          proposalNotes: ''
        })
        fetchAvailableJobs()
      }
    } catch (error) {
      console.error("Error submitting bid:", error)
      alert("Error submitting bid. Please try again.")
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location_city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUrgency = filterUrgency === "all" || job.urgency === filterUrgency
    return matchesSearch && matchesUrgency
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-gray-900'
      case 'high':
        return 'bg-gray-100'
      case 'normal':
        return 'bg-emerald-600'
      default:
        return 'bg-gray-400/40'
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-gray-100 text-white '
      case 'high':
        return 'bg-gray-100 hover:bg-gray-100 text-white'
      case 'normal':
        return 'bg-emerald-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  if (loading) {
    return <AppShellSkeleton />
  }

  return (
    <>
      <ProfessionalPageShell title="Available Jobs">
      <div className="space-y-4">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-2">Opportunities</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Browse available jobs</h2>
                    <p className="text-sm text-gray-500 mt-1">Submit faster bids on high-fit projects.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">{filteredJobs.length} listings</Badge>
                    <Badge className="bg-gray-100 text-gray-700 border border-gray-200">{jobs.filter(j => j.urgency === "urgent").length} urgent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border border-gray-100">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 border border-gray-200 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    title="Filter by urgency"
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="flex-1 h-10 px-3 border border-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Urgency Levels</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="normal">🔵 Normal</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <Card className="border border-gray-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-3">No Jobs Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterUrgency !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Check back later for new installation opportunities"}
                </p>
                {(searchTerm || filterUrgency !== "all") && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setFilterUrgency("all")
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="group border border-gray-100 hover:bg-gray-50/70 transition-colors">
                  <div className={`h-2 ${getUrgencyColor(job.urgency)}`} />
                  
                  <CardHeader className="pb-3 bg-white border-b border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {job.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getUrgencyBadge(job.urgency)} px-3 py-1 text-xs font-bold uppercase flex-shrink-0`}>
                        {job.urgency}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Job Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-600">Location</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">{job.location_city}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-semibold text-gray-600">Product Value</span>
                        </div>
                        <p className="text-sm font-bold text-green-700">
                          KSH {job.total_product_cost?.toLocaleString() || 0}
                        </p>
                      </div>

                      {job.preferred_date && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-emerald-700" />
                            <span className="text-xs font-semibold text-gray-600">Preferred Date</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(job.preferred_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Products List */}
                    {job.installation_job_items && job.installation_job_items.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-gray-700" />
                          <p className="text-sm font-bold text-gray-900">Products to Install</p>
                        </div>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {job.installation_job_items.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg">
                              <span className="text-gray-700">
                                <span className="font-bold text-emerald-600">{item.quantity}x</span> {item.product_name}
                              </span>
                              <span className="font-bold text-gray-900">
                                KSH {(item.product_price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {job.installation_job_items.length > 3 && (
                            <p className="text-xs text-gray-500 text-center pt-1">
                              +{job.installation_job_items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      onClick={() => setSelectedJob(job)}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      View Details & Submit Bid
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
    </ProfessionalPageShell>

      {/* Bidding Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-3xl w-full max-h-[88vh] overflow-y-auto border border-gray-100 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ scrollbarWidth: "thin" }}>
            <CardHeader className="border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Submit Your Bid</CardTitle>
                    <CardDescription>Complete the form to bid on this project</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-2xl h-10 w-10 p-0 hover:bg-gray-900 hover:text-gray-700"
                  onClick={() => setSelectedJob(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Job Details */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-emerald-700" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{selectedJob.title}</h3>
                  <Badge className={`${getUrgencyBadge(selectedJob.urgency)} ml-auto text-xs`}>
                    {selectedJob.urgency}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="font-semibold text-sm text-gray-700">Location</p>
                    </div>
                    <p className="text-sm text-gray-900">{selectedJob.location_address}</p>
                    <p className="text-sm font-bold text-emerald-700">{selectedJob.location_city}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <p className="font-semibold text-sm text-gray-700">Product Cost</p>
                    </div>
                    <p className="text-xl font-bold tracking-tight text-emerald-600">
                      KSH {selectedJob.total_product_cost?.toLocaleString() || 0}
                    </p>
                  </div>

                  {selectedJob.preferred_date && (
                    <div className="bg-white p-4 rounded-lg border border-gray-100 sm:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-emerald-700" />
                        <p className="font-semibold text-sm text-gray-700">Preferred Installation Date</p>
                      </div>
                      <p className="text-base font-semibold text-emerald-700">
                        {new Date(selectedJob.preferred_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Description:</p>
                  <p className="text-sm text-gray-900">{selectedJob.description}</p>
                </div>
                
                {selectedJob.installation_job_items && selectedJob.installation_job_items.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-100 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-emerald-600" />
                      <p className="font-bold text-gray-900">Products to Install:</p>
                    </div>
                    <div className="space-y-2">
                      {selectedJob.installation_job_items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
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
              </div>

              {/* Bid Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-emerald-700" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Your Bid Details</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborCost" className="text-sm font-bold text-gray-900 mb-2 block">
                      Labor Cost (KSH) *
                    </Label>
                    <Input
                      id="laborCost"
                      type="number"
                      value={bidForm.laborCost}
                      onChange={(e) => setBidForm({...bidForm, laborCost: e.target.value})}
                      placeholder="0"
                      className="border border-gray-200 h-10 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="materialCost" className="text-sm font-bold text-gray-900 mb-2 block">
                      Material Cost (KSH)
                    </Label>
                    <Input
                      id="materialCost"
                      type="number"
                      value={bidForm.materialCost}
                      onChange={(e) => setBidForm({...bidForm, materialCost: e.target.value})}
                      placeholder="0"
                      className="border border-gray-200 h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="additionalCosts" className="text-sm font-bold text-gray-900 mb-2 block">
                      Additional Costs (KSH)
                    </Label>
                    <Input
                      id="additionalCosts"
                      type="number"
                      value={bidForm.additionalCosts}
                      onChange={(e) => setBidForm({...bidForm, additionalCosts: e.target.value})}
                      placeholder="0"
                      className="border border-gray-200 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours" className="text-sm font-bold text-gray-900 mb-2 block">
                      Estimated Hours
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="estimatedHours"
                        type="number"
                        value={bidForm.estimatedHours}
                        onChange={(e) => setBidForm({...bidForm, estimatedHours: e.target.value})}
                        placeholder="8"
                        className="border border-gray-200 h-10 text-sm pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="proposalNotes" className="text-sm font-bold text-gray-900 mb-2 block">
                    Proposal Notes
                  </Label>
                  <Textarea
                    id="proposalNotes"
                    value={bidForm.proposalNotes}
                    onChange={(e) => setBidForm({...bidForm, proposalNotes: e.target.value})}
                    placeholder="Describe your approach, experience, and any additional services you'll provide..."
                    rows={5}
                    className="border border-gray-200 text-sm"
                  />
                </div>

                {/* Total Calculation */}
                <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                        <Award className="h-4 w-4 text-emerald-700" />
                      </div>
                      <span className="text-lg font-semibold text-gray-900">Total Bid Amount:</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold tracking-tight text-emerald-700">
                        KSH {(
                          (parseFloat(bidForm.laborCost) || 0) +
                          (parseFloat(bidForm.materialCost) || 0) +
                          (parseFloat(bidForm.additionalCosts) || 0)
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Your complete proposal</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-white p-2.5 rounded-lg text-center border border-gray-100">
                      <p className="text-gray-600 mb-1">Labor</p>
                      <p className="font-bold text-emerald-600">
                        KSH {(parseFloat(bidForm.laborCost) || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg text-center border border-gray-100">
                      <p className="text-gray-600 mb-1">Materials</p>
                      <p className="font-bold text-emerald-700">
                        KSH {(parseFloat(bidForm.materialCost) || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg text-center border border-gray-100">
                      <p className="text-gray-600 mb-1">Additional</p>
                      <p className="font-bold text-gray-700">
                        KSH {(parseFloat(bidForm.additionalCosts) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => submitBid(selectedJob.id)}
                    disabled={!bidForm.laborCost}
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Bid
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 border border-gray-300 hover:bg-gray-100 font-medium"
                    onClick={() => setSelectedJob(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}