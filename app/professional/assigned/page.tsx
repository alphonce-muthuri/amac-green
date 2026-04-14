"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Award, 
  MapPin, 
  Calendar,
  Eye,
  DollarSign,
  Clock,
  Phone,
  User,
  Package,
  CheckCircle2,
  PlayCircle,
  Mail,
  Briefcase,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AppShellSkeleton } from "@/components/loaders/page-skeletons"
import { ProfessionalPageShell } from "@/components/professional/professional-page-shell"

export default function AssignedJobsPage() {
  const [assignedJobs, setAssignedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)

  useEffect(() => {
    fetchAssignedJobs()
  }, [])

  const fetchAssignedJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // First get accepted bids
      const { data: acceptedBids, error: bidsError } = await supabase
        .from("installation_bids")
        .select("id, job_id, total_bid_amount, labor_cost")
        .eq("professional_id", user.id)
        .eq("status", "accepted")

      if (bidsError) {
        console.error("Error fetching accepted bids:", bidsError)
        return
      }

      if (!acceptedBids || acceptedBids.length === 0) {
        setAssignedJobs([])
        setLoading(false)
        return
      }

      // Get jobs where this professional's bid was selected
      const jobIds = acceptedBids.map(bid => bid.job_id)
      
      const { data: jobs, error: jobsError } = await supabase
        .from("installation_jobs")
        .select(`
          *,
          installation_job_items (
            id,
            product_name,
            product_price,
            quantity
          ),
          customer_profiles!installation_jobs_customer_id_fkey (
            email,
            first_name,
            last_name,
            phone
          )
        `)
        .in("id", jobIds)
        .in("status", ["assigned", "in_progress", "completed"])

      if (jobsError) {
        console.error("Error fetching assigned jobs:", jobsError)
      } else {
        // Add bid information to each job
        const jobsWithBids = jobs?.map(job => ({
          ...job,
          winning_bid: acceptedBids.find(bid => bid.job_id === job.id)
        })) || []
        
        setAssignedJobs(jobsWithBids)
      }
    } catch (error) {
      console.error("Error fetching assigned jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <Award className="h-5 w-5" />
      case "in_progress":
        return <PlayCircle className="h-5 w-5" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-emerald-600 text-white"
      case "in_progress":
        return "bg-gray-100 text-gray-700 border border-gray-200"
      case "completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("installation_jobs")
        .update({ status: newStatus })
        .eq("id", jobId)

      if (error) {
        console.error("Error updating job status:", error)
        alert("Error updating job status. Please try again.")
      } else {
        alert(`Job status updated to ${newStatus}!`)
        fetchAssignedJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Error updating job status:", error)
      alert("Error updating job status. Please try again.")
    }
  }

  const stats = {
    total: assignedJobs.length,
    assigned: assignedJobs.filter(j => j.status === 'assigned').length,
    inProgress: assignedJobs.filter(j => j.status === 'in_progress').length,
    completed: assignedJobs.filter(j => j.status === 'completed').length,
    totalEarnings: assignedJobs.reduce((sum, j) => sum + (j.winning_bid?.total_bid_amount || 0), 0)
  }

  if (loading) {
    return <AppShellSkeleton />
  }

  return (
    <>
      <ProfessionalPageShell title="Assigned Jobs">
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600 mb-2">Assigned Pipeline</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Active delivery queue</h2>
                  <p className="text-sm text-gray-500 mt-1">Track accepted jobs and close them faster.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">{stats.total} total</Badge>
                  <Badge className="bg-gray-100 text-gray-700 border border-gray-200">{stats.inProgress} in progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">New</p><p className="text-xl font-semibold text-gray-900">{stats.assigned}</p></CardContent></Card>
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">In Progress</p><p className="text-xl font-semibold text-gray-900">{stats.inProgress}</p></CardContent></Card>
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">Completed</p><p className="text-xl font-semibold text-gray-900">{stats.completed}</p></CardContent></Card>
            <Card className="border border-gray-100"><CardContent className="p-4"><p className="text-xs text-gray-500">Earnings</p><p className="text-xl font-semibold text-gray-900">KSH {stats.totalEarnings.toLocaleString()}</p></CardContent></Card>
          </div>

          {/* Jobs List */}
          {assignedJobs.length === 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-3">No Assigned Jobs Yet</h3>
                <p className="text-gray-600 mb-4">Win bids on installation jobs to see them here</p>
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
              {assignedJobs.map((job) => (
                <Card
                  key={job.id} 
                  className="group border border-gray-100 hover:bg-gray-50/70 transition-colors"
                >
            <CardHeader className="pb-3 bg-white border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-700">
                          {getStatusIcon(job.status)}
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
                      <Badge className={`${getStatusBadge(job.status)} px-3 py-1 text-xs font-bold uppercase flex-shrink-0`}>
                        {job.status === 'assigned' ? 'NEW' : job.status === 'in_progress' ? 'ACTIVE' : 'DONE'}
                      </Badge>
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
                        <p className="text-sm font-bold text-gray-900">{job.location_city}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-semibold text-gray-600">Your Earnings</span>
                        </div>
                        <p className="text-sm font-semibold text-emerald-700">
                          KSH {job.winning_bid?.total_bid_amount?.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-emerald-700" />
                          <span className="text-xs font-semibold text-gray-600">Assigned Date</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(job.updated_at || job.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {job.preferred_date && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-700" />
                            <span className="text-xs font-semibold text-gray-600">Due Date</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(job.preferred_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    {job.customer_profiles && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <p className="text-sm font-bold text-gray-900">Customer Contact</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Name</p>
                            <p className="font-bold text-gray-900">
                              {job.customer_profiles.first_name} {job.customer_profiles.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Phone</p>
                            <p className="font-semibold text-emerald-700">
                              {job.customer_profiles.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 border-gray-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {job.status === "assigned" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                          onClick={() => updateJobStatus(job.id, "in_progress")}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start Work
                        </Button>
                      )}
                      
                      {job.status === "in_progress" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 hover:bg-emerald-700"
                          onClick={() => updateJobStatus(job.id, "completed")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}

                      {job.customer_profiles?.phone && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border"
                          onClick={() => window.open(`tel:${job.customer_profiles.phone}`, '_self')}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
      </ProfessionalPageShell>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center text-emerald-700">
                    {getStatusIcon(selectedJob.status)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">Job Details</CardTitle>
                    <CardDescription>{selectedJob.title}</CardDescription>
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

            <CardContent className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Current Status:</span>
                <Badge className={`${getStatusBadge(selectedJob.status)} px-4 py-2 text-sm uppercase font-bold`}>
                  {getStatusIcon(selectedJob.status)}
                  <span className="ml-2">{selectedJob.status}</span>
                </Badge>
              </div>

              {/* Customer Information */}
              {selectedJob.customer_profiles && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-700" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">Customer Information</h4>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-bold text-gray-900">
                        {selectedJob.customer_profiles.first_name} {selectedJob.customer_profiles.last_name}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="font-bold text-emerald-700">
                        {selectedJob.customer_profiles.phone || 'Not provided'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl sm:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Email Address</p>
                      <p className="font-bold text-gray-900">{selectedJob.customer_profiles.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Installation Details */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-gray-700" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Installation Details</h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-sm text-gray-900">{selectedJob.location_address}</p>
                    <p className="text-sm font-bold text-emerald-700">{selectedJob.location_city}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Urgency</p>
                    <Badge className="capitalize">{selectedJob.urgency}</Badge>
                  </div>
                  {selectedJob.preferred_date && (
                    <div className="bg-white p-4 rounded-xl sm:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Preferred Installation Date</p>
                      <p className="text-lg font-bold text-emerald-700">
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

                <div className="bg-white p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-sm text-gray-900">{selectedJob.description}</p>
                </div>
              </div>

              {/* Products */}
              {selectedJob.installation_job_items && selectedJob.installation_job_items.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-emerald-700" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">Products to Install</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedJob.installation_job_items.map((item: any) => (
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

              {/* Earnings Breakdown */}
              <div className="bg-emerald-50/40 p-6 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-700" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Your Earnings</h4>
                </div>

                <div className="bg-white p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-900">Installation Fee:</span>
                    <span className="text-xl font-bold tracking-tight text-green-700">
                      KSH {selectedJob.winning_bid?.total_bid_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Product Cost (customer pays):</span>
                      <span className="font-semibold">KSH {selectedJob.total_product_cost?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {selectedJob.status === "assigned" && (
                  <Button
                    className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold"
                    onClick={() => {
                      updateJobStatus(selectedJob.id, "in_progress")
                      setSelectedJob(null)
                    }}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Work
                  </Button>
                )}
                
                {selectedJob.status === "in_progress" && (
                  <Button
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
                    onClick={() => {
                      updateJobStatus(selectedJob.id, "completed")
                      setSelectedJob(null)
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Complete
                  </Button>
                )}

                {selectedJob.customer_profiles?.phone && (
                  <Button 
                    variant="outline"
                    className="h-14 border"
                    onClick={() => window.open(`tel:${selectedJob.customer_profiles.phone}`, '_self')}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Customer
                  </Button>
                )}

                {selectedJob.customer_profiles?.email && (
                  <Button 
                    variant="outline"
                    className="h-14 border"
                    onClick={() => window.open(`mailto:${selectedJob.customer_profiles.email}`, '_self')}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}