import { ArrowRight, Building2, Globe, Users, Truck, Sparkles, Shield, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Image from "next/image"

export default function RegisterPage() {
  const registrationTypes = [
    {
      type: "vendor",
      title: "Supplier Account",
      tagline: "For product suppliers",
      description: "List renewable energy products and serve customers across Kenya.",
      icon: Building2,
      features: ["Unlimited product listings", "Advanced analytics dashboard", "Payment integration", "Marketing tools"],
      stats: { label: "Active Vendors", value: "500+" },
      popular: true,
    },
    {
      type: "professional",
      title: "Professional Account",
      tagline: "For installers and wholesale buyers",
      description: "Access bulk pricing, project tools, and priority business support.",
      icon: Users,
      features: ["Bulk pricing discounts", "Priority support", "Extended payment terms", "Project management"],
      stats: { label: "Professionals", value: "300+" },
      popular: false,
    },
    {
      type: "customer",
      title: "Customer Account",
      tagline: "For homes and institutions",
      description: "Buy trusted energy products with simple checkout and delivery tracking.",
      icon: Globe,
      features: ["Competitive prices", "Installation support", "Green financing", "Easy tracking"],
      stats: { label: "Happy Customers", value: "10K+" },
      popular: false,
    },
    {
      type: "delivery",
      title: "Delivery Partner",
      tagline: "For logistics partners",
      description: "Join our delivery network with flexible schedules and weekly payouts.",
      icon: Truck,
      features: ["Flexible schedule", "Competitive rates", "Weekly payments", "GPS support"],
      stats: { label: "Drivers", value: "200+" },
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-white -mt-20 pt-24 sm:pt-28 min-h-[100svh]">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pb-6">
            <div className="lg:min-h-[calc(100svh-8rem)] lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="hidden lg:flex relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#052e1a] via-[#0b3b24] to-[#062515] p-10 text-white">
                <div className="absolute inset-0 pointer-events-none">
                  <Image
                    src="/images/hero-renewable-energy.png"
                    alt="Renewable Energy"
                    fill
                    className="object-cover opacity-15"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/90 to-[#041d12]/90 pointer-events-none" />
                <div className="relative z-10 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-emerald-200/90 uppercase mb-5">
                      AMAC GREEN • SIGN UP
                    </p>
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tighter">
                      Join Kenya's
                      <span className="block text-emerald-300">clean energy network.</span>
                    </h2>
                    <p className="mt-4 text-sm text-emerald-100/80 max-w-md">
                      Choose the account type that matches your role and start building on a trusted renewable marketplace.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <span className="w-8 h-8 rounded-full border border-emerald-300/20 bg-emerald-400/20 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </span>
                      <p className="text-sm text-emerald-100/90">Verified ecosystem across suppliers and professionals</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <span className="w-8 h-8 rounded-full border border-emerald-300/20 bg-emerald-400/20 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </span>
                      <p className="text-sm text-emerald-100/90">Secure onboarding and role-based dashboards</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <span className="w-8 h-8 rounded-full border border-emerald-300/20 bg-emerald-400/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <p className="text-sm text-emerald-100/90">Built for scale, from first order to enterprise projects</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 sm:mb-8">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.4em] mb-4">
                    Get Started
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-none">
                    Select your registration path.
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {registrationTypes.map((regType, index) => (
                    <div
                      key={regType.type}
                      className="group h-full bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-emerald-300 transition-all duration-200 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] font-medium text-gray-300 tracking-[0.3em] hidden sm:block w-5 tabular-nums">
                            0{index + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 group-hover:border-emerald-300 group-hover:text-emerald-600 transition-all duration-200 shrink-0">
                            <regType.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-medium text-gray-400 tracking-[0.2em] uppercase mb-0.5">
                              {regType.tagline}
                            </p>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
                              {regType.title}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">{regType.stats.value}</p>
                          <p className="text-[10px] text-gray-400 hidden sm:block">{regType.stats.label}</p>
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-3">
                        {regType.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {regType.features.slice(0, 2).map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-4">
                        <Button
                          className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-8 px-3 text-[11px] font-medium"
                          asChild
                        >
                          <Link href={`/register/${regType.type}`}>
                            Create Account
                            <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[#0a1a0f] overflow-hidden py-20 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.09),transparent_70%)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-white/[0.07]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-6">
              Already Registered?
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.06] mb-6">
              Continue from where
              <span className="block">you left off.</span>
            </h2>
            <p className="text-white/45 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Sign in to access your dashboard, orders, projects, and account tools.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-full h-10 text-xs font-semibold shadow-lg shadow-emerald-900/40"
              asChild
            >
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.07]" />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
