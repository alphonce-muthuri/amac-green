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
  Sparkles,
  TrendingUp,
  Briefcase,
  Star,
  Target,
  Zap,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"

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
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "in_progress":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white animate-pulse"
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <Award className="absolute inset-0 m-auto h-8 w-8 text-green-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Assigned Jobs</p>
          <p className="text-sm text-gray-600 mt-1">Fetching your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-green-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 animate-gradient-x"></div>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Award className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div>
                      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Assigned Jobs
                      </h1>
                      <p className="text-lg text-gray-600">
                        Manage your <span className="font-bold text-green-700">{stats.total}</span> won projects
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300">
                          <Award className="h-3 w-3 mr-1" />
                          {stats.assigned} New
                        </Badge>
                        <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-300">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          {stats.inProgress} In Progress
                        </Badge>
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {stats.completed} Completed
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                      <span className="text-3xl font-extrabold text-white">{stats.total}</span>
                    </div>
                    <Badge className="bg-green-600 text-white">Active Projects</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600 text-white">New</Badge>
                </div>
                <p className="text-3xl font-extrabold text-blue-700 mb-1">{stats.assigned}</p>
                <p className="text-sm text-gray-600">Newly Assigned</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <PlayCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-600 text-white animate-pulse">Active</Badge>
                </div>
                <p className="text-3xl font-extrabold text-orange-700 mb-1">{stats.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white">Done</Badge>
                </div>
                <p className="text-3xl font-extrabold text-green-700 mb-1">{stats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-600 text-white">Total</Badge>
                </div>
                <p className="text-3xl font-extrabold text-emerald-700 mb-1">
                  {(stats.totalEarnings / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Total Earnings (KSH)</p>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          {assignedJobs.length === 0 ? (
            <Card className="border-2 border-gray-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Assigned Jobs Yet</h3>
                <p className="text-gray-600 mb-4">Win bids on installation jobs to see them here</p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
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
                  className="group border-2 border-green-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  
                  <CardHeader className="pb-3 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          {getStatusIcon(job.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
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
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-600">Location</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{job.location_city}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-semibold text-gray-600">Your Earnings</span>
                        </div>
                        <p className="text-sm font-bold text-green-700">
                          KSH {job.winning_bid?.total_bid_amount?.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-semibold text-gray-600">Assigned Date</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(job.updated_at || job.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {job.preferred_date && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-xl border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-orange-600" />
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
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-5 w-5 text-indigo-600" />
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
                            <p className="font-bold text-indigo-600">
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
                        className="flex-1 border-2 group-hover:scale-105 transition-transform"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {job.status === "assigned" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                          onClick={() => updateJobStatus(job.id, "in_progress")}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start Work
                        </Button>
                      )}
                      
                      {job.status === "in_progress" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                          className="border-2"
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
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-green-300 shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 animate-gradient-x"></div>
            
            <CardHeader className="border-b-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    {getStatusIcon(selectedJob.status)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Job Details</CardTitle>
                    <CardDescription>{selectedJob.title}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-2xl h-10 w-10 p-0 hover:bg-red-100 hover:text-red-600"
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
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
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
                      <p className="font-bold text-indigo-600">
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
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Installation Details</h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-sm text-gray-900">{selectedJob.location_address}</p>
                    <p className="text-sm font-bold text-blue-600">{selectedJob.location_city}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Urgency</p>
                    <Badge className="capitalize">{selectedJob.urgency}</Badge>
                  </div>
                  {selectedJob.preferred_date && (
                    <div className="bg-white p-4 rounded-xl sm:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Preferred Installation Date</p>
                      <p className="text-lg font-bold text-purple-600">
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
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">Products to Install</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedJob.installation_job_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-emerald-200">
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
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-green-300 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Your Earnings</h4>
                </div>

                <div className="bg-white p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-900">Installation Fee:</span>
                    <span className="text-3xl font-extrabold text-green-700">
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
                    className="flex-1 h-14 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-base font-bold"
                    onClick={() => {
                      updateJobStatus(selectedJob.id, "in_progress")
                      setSelectedJob(null)
                    }}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Work
                    <Zap className="h-5 w-5 ml-2" />
                  </Button>
                )}
                
                {selectedJob.status === "in_progress" && (
                  <Button 
                    className="flex-1 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-base font-bold"
                    onClick={() => {
                      updateJobStatus(selectedJob.id, "completed")
                      setSelectedJob(null)
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Complete
                    <Star className="h-5 w-5 ml-2" />
                  </Button>
                )}

                {selectedJob.customer_profiles?.phone && (
                  <Button 
                    variant="outline"
                    className="h-14 border-2"
                    onClick={() => window.open(`tel:${selectedJob.customer_profiles.phone}`, '_self')}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Customer
                  </Button>
                )}

                {selectedJob.customer_profiles?.email && (
                  <Button 
                    variant="outline"
                    className="h-14 border-2"
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

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}