"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  RefreshCw,
  AlertCircle,
  CheckCircle,
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const isCheckingRef = useRef(false)
  const hasLoadedOnceRef = useRef(false)

  const getProfessionalApplication = useCallback(async (user: any) => {
    try {
      const { data, error } = await supabase
        .from("professional_applications")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching professional application:", error)
        return null
      }
      return data ?? null
    } catch (error) {
      console.error("Error in getProfessionalApplication:", error)
      return null
    }
  }, [])

  const loadInstallationData = useCallback(async (user: any) => {
    try {
      const jobsQuery = supabase
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

      const bidsQuery = supabase
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

      const [{ data: jobs, error: jobsError }, { data: bids, error: bidsError }] = await Promise.all([
        jobsQuery,
        bidsQuery,
      ])

      if (bidsError) {
        console.error("Error fetching bids:", bidsError)
      }

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError)
      }

      const safeJobs = jobs || []
      const safeBids = bids || []

      let safeAssignedJobs: any[] = []
      if (safeBids.length > 0) {
        const acceptedBidIds = safeBids.filter((bid) => bid.status === "accepted").map((bid) => bid.id)

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
            safeAssignedJobs = assigned?.map((job) => ({
              ...job,
              winning_bid: safeBids.find((bid) => bid.id === job.selected_bid_id)
            })) || []
          }
        }
      }

      const acceptedBids = safeBids.filter((bid) => bid.status === "accepted")
      const totalBids = safeBids.length
      const wonBids = acceptedBids.length
      const activeJobs = acceptedBids.length
      const totalEarnings = acceptedBids.reduce((sum, bid) => sum + (bid.labor_cost || 0), 0)

      setAvailableJobs(safeJobs)
      setMyBids(safeBids)
      setAssignedJobs(safeAssignedJobs)
      setStats({
        totalBids,
        wonBids,
        activeJobs,
        totalEarnings,
      })

    } catch (error) {
      console.error("Error loading installation data:", error)
    }
  }, [])

  const checkUser = useCallback(async () => {
    if (isCheckingRef.current) return
    isCheckingRef.current = true
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
      const [application] = await Promise.all([
        getProfessionalApplication(user),
        loadInstallationData(user),
      ])
      setApplicationStatus(application)
      hasLoadedOnceRef.current = true
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
      isCheckingRef.current = false
    }
  }, [router, getProfessionalApplication, loadInstallationData])

  useEffect(() => {
    void checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (event === "SIGNED_IN" && session && !hasLoadedOnceRef.current) {
        await checkUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, checkUser])

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

  const refreshDashboard = async () => {
    if (!user || isRefreshing) return
    setIsRefreshing(true)
    try {
      await loadInstallationData(user)
      const application = await getProfessionalApplication(user)
      setApplicationStatus(application)
    } finally {
      setIsRefreshing(false)
    }
  }

  const isApproved = applicationStatus?.status === "approved"
  const winRate = stats.totalBids > 0 ? Math.round((stats.wonBids / stats.totalBids) * 100) : 0
  const pendingBids = myBids.filter((bid) => bid.status === "pending").length
  const displayName =
    applicationStatus?.company_name || user?.user_metadata?.contact_person || "Professional"
  const performanceChartData = [
    { label: "Open Jobs", value: availableJobs.length },
    { label: "Pending Bids", value: pendingBids },
    { label: "Won Bids", value: stats.wonBids },
    { label: "Active Projects", value: assignedJobs.length },
  ]
  const performanceChartConfig = {
    value: {
      label: "Count",
      color: "#059669",
    },
  } satisfies ChartConfig

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200/70 bg-white/90 px-6 backdrop-blur-xl">
          <Skeleton className="h-7 w-7 rounded-md" />
          <div className="flex flex-1 items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="hidden h-4 w-40 sm:block" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-80 max-w-full" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-4/5 max-w-xl" />
                <div className="flex flex-wrap gap-2 pt-1">
                  <Skeleton className="h-7 w-40 rounded-full" />
                  <Skeleton className="h-7 w-36 rounded-full" />
                  <Skeleton className="h-7 w-44 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Skeleton className="h-10 w-36 rounded-full" />
                  <Skeleton className="h-10 w-40 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-[420px] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200/70 bg-white/90 px-6 backdrop-blur-xl">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">Professional Dashboard</h1>
            {applicationStatus && (
              <Badge className={isApproved
                ? "border border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : "border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100"
              }>
                {isApproved ? "Active" : "Pending Review"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:inline">{displayName}</span>
            <Button onClick={refreshDashboard} disabled={isRefreshing} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600">Professional hub</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {displayName}</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Track your pipeline, secure new projects, and manage active work from one premium workspace.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  <Hammer className="mr-1 h-3 w-3" />
                  {availableJobs.length} opportunities
                </Badge>
                <Badge className="border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100">
                  <Clock className="mr-1 h-3 w-3" />
                  {pendingBids} pending bids
                </Badge>
                <Badge className="border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100">
                  <Award className="mr-1 h-3 w-3" />
                  {assignedJobs.length} active projects
                </Badge>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/professional/jobs">
                  <Button className="rounded-full bg-emerald-500 px-6 text-white hover:bg-emerald-400">
                    <Hammer className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/professional/assigned">
                  <Button variant="outline" className="rounded-full border-gray-300 bg-white px-6 text-gray-700 hover:bg-gray-50">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Active Projects
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Win Rate</p>
                <p className="mt-2 text-3xl font-bold">{winRate}%</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Earnings</p>
                <p className="mt-2 text-2xl font-bold">KSH {stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Won Bids</p>
                <p className="mt-2 text-3xl font-bold">{stats.wonBids}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Open Jobs</p>
                <p className="mt-2 text-3xl font-bold">{availableJobs.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="rounded-xl border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Bids</CardTitle>
              <Hammer className="h-5 w-5 text-gray-700" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-2xl font-bold text-gray-900">{stats.totalBids}</div>
              <p className="text-sm text-gray-500">All submissions</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-emerald-200/70 bg-white/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Jobs Won</CardTitle>
              <Award className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-2xl font-bold text-gray-900">{stats.wonBids}</div>
              <p className="text-sm text-emerald-700">Accepted bids</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Active Jobs</CardTitle>
              <Briefcase className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-2xl font-bold text-gray-900">{stats.activeJobs}</div>
              <p className="text-sm text-gray-500">Current assignments</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-emerald-200 bg-white/95 shadow-sm lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Performance Chart</CardTitle>
              <CardDescription>Current pipeline snapshot</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={performanceChartConfig} className="h-[160px] w-full">
                <BarChart data={performanceChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={6} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        {!isApproved && (
          <Card className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <AlertCircle className="h-7 w-7 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Application Under Review</h3>
                  <p className="mb-3 text-gray-600">
                    Your credentials are being verified. This typically takes 1-3 business days.
                  </p>
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="mb-1 text-gray-500">Company</p>
                      <p className="font-bold text-gray-900">{applicationStatus?.company_name || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="mb-1 text-gray-500">Type</p>
                      <p className="font-bold text-gray-900">{applicationStatus?.professional_type || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="mb-1 text-gray-500">Applied</p>
                      <p className="font-bold text-gray-900">
                        {applicationStatus?.created_at ? new Date(applicationStatus.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isApproved && (
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card className="rounded-2xl border border-gray-200/70 bg-white/95 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Hammer className="h-5 w-5 text-emerald-600" />
                    Available Installation Jobs
                    <Badge className="border border-gray-200 bg-gray-100 font-bold text-gray-700 hover:bg-gray-100">
                      {availableJobs.length}
                    </Badge>
                  </CardTitle>
                  <Link href="/professional/jobs">
                    <Button size="sm" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                      View All
                    </Button>
                  </Link>
                </div>
                <CardDescription>Priority opportunities matched to your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {availableJobs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No jobs available right now</p>
                  </div>
                ) : (
                  availableJobs.slice(0, 4).map((job) => (
                    <Card key={job.id} className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                            <p className="line-clamp-1 text-sm text-gray-500">{job.description}</p>
                          </div>
                          <Badge variant={job.urgency === "urgent" ? "destructive" : job.urgency === "high" ? "default" : "secondary"}>
                            {job.urgency}
                          </Badge>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location_city}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : "Flexible"}</span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-700"><DollarSign className="h-3.5 w-3.5" />KSH {job.total_product_cost?.toLocaleString() || 0}</span>
                        </div>
                        <Button size="sm" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setSelectedJob(job)}>
                          <Eye className="mr-1 h-4 w-4" />
                          View & Submit Bid
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-2xl border border-gray-200/70 bg-white/95 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Action Center</CardTitle>
                  <Zap className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/professional/jobs"><Button className="w-full justify-start rounded-xl bg-emerald-600 hover:bg-emerald-700"><Hammer className="mr-2 h-4 w-4" />Browse Jobs</Button></Link>
                  <Link href="/professional/bids"><Button variant="outline" className="w-full justify-start rounded-xl border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"><Target className="mr-2 h-4 w-4" />My Bids</Button></Link>
                  <Link href="/professional/assigned"><Button variant="outline" className="w-full justify-start rounded-xl border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"><Award className="mr-2 h-4 w-4" />Assigned Jobs</Button></Link>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-gray-200/70 bg-white/95 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Recent Bids</CardTitle>
                  <Target className="h-5 w-5 text-gray-700" />
                </CardHeader>
                <CardContent>
                  {myBids.length === 0 ? (
                    <div className="py-8 text-center">
                      <Target className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No bids yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myBids.slice(0, 3).map((bid) => (
                        <div key={bid.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="mb-1 flex items-start justify-between">
                            <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">{bid.installation_jobs?.title}</h4>
                            <Badge variant={bid.status === "accepted" ? "default" : bid.status === "rejected" ? "destructive" : "secondary"} className="ml-1 shrink-0 text-xs">{bid.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">KSH {bid.total_bid_amount?.toLocaleString()} · {bid.installation_jobs?.location_city}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-gray-200/70 bg-white/95 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Active Projects
                  </CardTitle>
                  <Link href="/professional/assigned">
                    <Button size="sm" variant="outline" className="rounded-full border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-4">
                  {assignedJobs.length === 0 ? (
                    <div className="py-8 text-center">
                      <Award className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No active projects</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <div className="mb-1 flex items-start justify-between">
                            <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">{job.title}</h4>
                            <Badge className="ml-1 shrink-0 bg-emerald-600 text-xs text-white">Assigned</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Earning: KSH {job.winning_bid?.total_bid_amount?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>

      {/* Bidding Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-300 bg-white shadow-xl">
            <div className="h-2 bg-emerald-600" />
            <CardHeader className="border-b bg-emerald-50/60">
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
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
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
                  <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
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
                      className="border"
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
                      className="border"
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
                      className="border"
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
                      className="border"
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
                    className="border"
                  />
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Bid Amount:</span>
                    <span className="text-xl font-bold text-emerald-700">
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Bid
                  </Button>
                  <Button variant="outline" className="border-gray-200" onClick={() => setSelectedJob(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
