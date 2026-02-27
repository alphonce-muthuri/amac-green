"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Hammer, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Wrench,
  Eye,
  Send,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  Briefcase,
  Package
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ProfessionalDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [myBids, setMyBids] = useState<any[]>([])
  const [assignedJobs, setAssignedJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [bidForm, setBidForm] = useState({
    laborCost: '',
    materialCost: '',
    additionalCosts: '',
    estimatedHours: '',
    proposalNotes: ''
  })
  const [stats, setStats] = useState({
    totalBids: 0,
    wonBids: 0,
    activeJobs: 0,
    totalEarnings: 0,
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        await checkUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Auth error:", error)
        router.push("/login")
        return
      }

      if (!user) {
        router.push("/login")
        return
      }

      const userRole = user?.user_metadata?.role
      if (userRole !== "professional") {
        switch (userRole) {
          case "admin":
            router.push("/admin")
            break
          case "vendor":
            router.push("/vendor")
            break
          case "customer":
          default:
            router.push("/dashboard")
            break
        }
        return
      }

      setUser(user)
      await getProfessionalApplication(user)
      await loadInstallationData(user)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const getProfessionalApplication = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from("professional_applications")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching professional application:", error)
        return
      }

      setApplicationStatus(data)
    } catch (error) {
      console.error("Error in getProfessionalApplication:", error)
    }
  }

  const loadInstallationData = async (user: any) => {
    try {
      const { data: jobs, error: jobsError } = await supabase
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

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError)
      } else {
        setAvailableJobs(jobs || [])
      }

      const { data: bids, error: bidsError } = await supabase
        .from("installation_bids")
        .select(`
          *,
          installation_jobs!installation_bids_job_id_fkey (
            id,
            title,
            location_city,
            status,
            total_product_cost
          )
        `)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false })

      if (bidsError) {
        console.error("Error fetching bids:", bidsError)
      } else {
        setMyBids(bids || [])
      }

      if (bids && bids.length > 0) {
        const acceptedBidIds = bids.filter(bid => bid.status === 'accepted').map(bid => bid.id)
        
        if (acceptedBidIds.length > 0) {
          const { data: assigned, error: assignedError } = await supabase
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
            .in("selected_bid_id", acceptedBidIds)

          if (assignedError) {
            console.error("Error fetching assigned jobs:", assignedError)
          } else {
            const jobsWithBids = assigned?.map(job => ({
              ...job,
              winning_bid: bids.find(bid => bid.id === job.selected_bid_id)
            })) || []
            setAssignedJobs(jobsWithBids)
          }
        } else {
          setAssignedJobs([])
        }
      } else {
        setAssignedJobs([])
      }

      const totalBids = bids?.length || 0
      const wonBids = bids?.filter(bid => bid.status === 'accepted').length || 0
      const activeJobs = (bids && bids.length > 0) ? 
        bids.filter(bid => bid.status === 'accepted').length : 0
      const totalEarnings = bids?.filter(bid => bid.status === 'accepted')
        .reduce((sum, bid) => sum + (bid.labor_cost || 0), 0) || 0

      setStats({
        totalBids,
        wonBids,
        activeJobs,
        totalEarnings,
      })

    } catch (error) {
      console.error("Error loading installation data:", error)
    }
  }

  const submitBid = async (jobId: string) => {
    try {
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
        await loadInstallationData(user)
      }
    } catch (error) {
      console.error("Error submitting bid:", error)
      alert("Error submitting bid. Please try again.")
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <Wrench className="absolute inset-0 m-auto h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Professional Dashboard</p>
          <p className="text-sm text-gray-600 mt-1">Preparing your workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isApproved = applicationStatus?.status === "approved"
  const winRate = stats.totalBids > 0 ? Math.round((stats.wonBids / stats.totalBids) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Profile Section */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-emerald-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x"></div>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Building2 className="h-14 w-14 text-white" />
                    </div>
                    {isApproved && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <h1 className="text-4xl font-extrabold text-gray-900">
                        {applicationStatus?.company_name || "Professional"}
                      </h1>
                      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-sm px-4 py-1">
                        {applicationStatus?.professional_type || "Installer"}
                      </Badge>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-4">
                      Welcome back, <span className="font-semibold">{user?.user_metadata?.contact_person || user?.user_metadata?.first_name || "Professional"}</span> 
                      {isApproved ? " 🎯 Ready for new opportunities" : " ⏳ Application under review"}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-full border-2 border-emerald-300">
                        <Target className="h-4 w-4 text-emerald-700" />
                        <span className="text-sm font-bold text-emerald-900">{winRate}% Win Rate</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-2 rounded-full border-2 border-teal-300">
                        <Award className="h-4 w-4 text-teal-700" />
                        <span className="text-sm font-bold text-teal-900">{stats.wonBids} Jobs Won</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2 rounded-full border-2 border-cyan-300">
                        <DollarSign className="h-4 w-4 text-cyan-700" />
                        <span className="text-sm font-bold text-cyan-900">KSH {stats.totalEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      isApproved
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/50 animate-pulse'
                        : 'bg-gradient-to-br from-amber-300 to-orange-400'
                    }`}>
                      {isApproved ? (
                        <Zap className="h-10 w-10 text-white" />
                      ) : (
                        <Clock className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <Badge className={isApproved ? 'bg-green-600' : 'bg-amber-600'}>
                      {isApproved ? 'ACTIVE' : 'PENDING'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!isApproved && (
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-7 w-7 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">Application Under Review</h3>
                    <p className="text-amber-800 mb-3">
                      Your professional credentials are being verified. This typically takes 1-3 business days.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Company</p>
                        <p className="font-bold text-gray-900">{applicationStatus?.company_name || "N/A"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Type</p>
                        <p className="font-bold text-gray-900">{applicationStatus?.professional_type || "N/A"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Applied</p>
                        <p className="font-bold text-gray-900">
                          {applicationStatus?.created_at
                            ? new Date(applicationStatus.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isApproved && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <Card className="border-2 border-emerald-200">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Win Rate</span>
                        <Star className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-5xl font-extrabold text-emerald-700">{winRate}%</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {stats.wonBids} of {stats.totalBids} bids won
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Active Projects</span>
                        <Briefcase className="h-5 w-5 text-teal-600" />
                      </div>
                      <p className="text-5xl font-extrabold text-teal-700">{stats.activeJobs}</p>
                      <p className="text-xs text-teal-600 mt-1">Currently assigned</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-cyan-200">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-cyan-600" />
                      Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-200">
                      <span className="text-sm text-gray-600">Total Earned</span>
                      <p className="text-3xl font-extrabold text-cyan-700 mt-1">
                        KSH {stats.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Completed Jobs</span>
                      <span className="text-2xl font-extrabold text-blue-700">{stats.wonBids}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Pending Bids</span>
                      <span className="text-2xl font-extrabold text-indigo-700">
                        {myBids.filter(b => b.status === 'pending').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/professional/jobs">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 justify-start">
                        <Hammer className="h-4 w-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </Link>
                    <Link href="/professional/bids">
                      <Button variant="outline" className="w-full border-2 justify-start">
                        <Target className="h-4 w-4 mr-2" />
                        My Bids
                      </Button>
                    </Link>
                    <Link href="/professional/assigned">
                      <Button variant="outline" className="w-full border-2 justify-start">
                        <Award className="h-4 w-4 mr-2" />
                        Assigned Jobs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-2 border-orange-200">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Hammer className="h-6 w-6 text-orange-600" />
                        Available Installation Jobs
                        <Badge className="bg-orange-100 text-orange-700 border-2 border-orange-300 font-bold">
                          {availableJobs.length}
                        </Badge>
                      </CardTitle>
                    </div>
                    <CardDescription>Browse and bid on new opportunities</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {availableJobs.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="h-12 w-12 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Available</h3>
                        <p className="text-gray-600">Check back soon for new opportunities</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {availableJobs.slice(0, 3).map((job) => (
                          <Card key={job.id} className="border-2 border-gray-200 hover:shadow-xl transition-all">
                            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Wrench className="h-5 w-5 text-emerald-600" />
                                    <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                                </div>
                                <Badge variant={job.urgency === 'urgent' ? 'destructive' : job.urgency === 'high' ? 'default' : 'secondary'}>
                                  {job.urgency}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location_city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : 'Flexible'}
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                                  <DollarSign className="h-4 w-4" />
                                  KSH {job.total_product_cost?.toLocaleString() || 0}
                                </div>
                              </div>

                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                onClick={() => setSelectedJob(job)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View & Submit Bid
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {availableJobs.length > 3 && (
                          <Link href="/professional/jobs">
                            <Button variant="outline" className="w-full border-2">
                              View All {availableJobs.length} Jobs
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                  <Card className="border-2 border-blue-200">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Recent Bids
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myBids.length === 0 ? (
                        <div className="text-center py-8">
                          <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-500">No bids yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {myBids.slice(0, 3).map((bid) => (
                            <div key={bid.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm line-clamp-1">{bid.installation_jobs?.title}</h4>
                                <Badge variant={
                                  bid.status === 'accepted' ? 'default' : 
                                  bid.status === 'rejected' ? 'destructive' : 'secondary'
                                } className="text-xs">
                                  {bid.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">
                                KSH {bid.total_bid_amount?.toLocaleString()} • {bid.installation_jobs?.location_city}
                              </p>
                            </div>
                          ))}
                          <Link href="/professional/bids">
                            <Button variant="outline" size="sm" className="w-full border-2">
                              View All Bids
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        Active Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {assignedJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-500">No active projects</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {assignedJobs.slice(0, 3).map((job) => (
                            <div key={job.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-200">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm line-clamp-1">{job.title}</h4>
                                <Badge className="bg-green-600 text-xs">Assigned</Badge>
                              </div>
                              <p className="text-xs text-gray-600">
                                Earning: KSH {job.winning_bid?.total_bid_amount?.toLocaleString()}
                              </p>
                            </div>
                          ))}
                          <Link href="/professional/assigned">
                            <Button variant="outline" size="sm" className="w-full border-2">
                              View All Projects
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bidding Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-300 shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader className="border-b bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-emerald-600" />
                  Submit Bid
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-2xl h-8 w-8 p-0"
                  onClick={() => setSelectedJob(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                <h3 className="font-bold text-lg mb-3 text-gray-900">{selectedJob.title}</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-700">Location</p>
                      <p className="text-gray-600">{selectedJob.location_address}, {selectedJob.location_city}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-700">Product Cost</p>
                      <p className="text-emerald-600 font-bold">KSH {selectedJob.total_product_cost?.toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedJob.preferred_date && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-700">Preferred Date</p>
                        <p className="text-gray-600">{new Date(selectedJob.preferred_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3"><strong>Description:</strong> {selectedJob.description}</p>
                
                {selectedJob.installation_job_items && selectedJob.installation_job_items.length > 0 && (
                  <div className="mt-4 bg-white p-3 rounded-lg">
                    <p className="font-semibold mb-2 text-sm">Products to Install:</p>
                    {selectedJob.installation_job_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-semibold">KSH {(item.product_price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborCost" className="text-sm font-semibold">Labor Cost (KSH) *</Label>
                    <Input
                      id="laborCost"
                      type="number"
                      value={bidForm.laborCost}
                      onChange={(e) => setBidForm({...bidForm, laborCost: e.target.value})}
                      placeholder="0"
                      className="border-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="materialCost" className="text-sm font-semibold">Material Cost (KSH)</Label>
                    <Input
                      id="materialCost"
                      type="number"
                      value={bidForm.materialCost}
                      onChange={(e) => setBidForm({...bidForm, materialCost: e.target.value})}
                      placeholder="0"
                      className="border-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="additionalCosts" className="text-sm font-semibold">Additional Costs (KSH)</Label>
                    <Input
                      id="additionalCosts"
                      type="number"
                      value={bidForm.additionalCosts}
                      onChange={(e) => setBidForm({...bidForm, additionalCosts: e.target.value})}
                      placeholder="0"
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours" className="text-sm font-semibold">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={bidForm.estimatedHours}
                      onChange={(e) => setBidForm({...bidForm, estimatedHours: e.target.value})}
                      placeholder="8"
                      className="border-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="proposalNotes" className="text-sm font-semibold">Proposal Notes</Label>
                  <Textarea
                    id="proposalNotes"
                    value={bidForm.proposalNotes}
                    onChange={(e) => setBidForm({...bidForm, proposalNotes: e.target.value})}
                    placeholder="Describe your approach, experience, and any additional services..."
                    rows={4}
                    className="border-2"
                  />
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Bid Amount:</span>
                    <span className="text-3xl font-extrabold text-emerald-700">
                      KSH {(
                        (parseFloat(bidForm.laborCost) || 0) +
                        (parseFloat(bidForm.materialCost) || 0) +
                        (parseFloat(bidForm.additionalCosts) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => submitBid(selectedJob.id)}
                    disabled={!bidForm.laborCost}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Bid
                  </Button>
                  <Button variant="outline" className="border-2" onClick={() => setSelectedJob(null)}>
                    Cancel
                  </Button>
                </div>
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