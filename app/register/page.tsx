import { ArrowRight, Building2, Globe, Users, Truck, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export default function RegisterPage() {
  const registrationTypes = [
    {
      type: "vendor",
      title: "Supplier Account",
      tagline: "Suppliers",
      description: "List products and grow your clean-energy business.",
      icon: Building2,
      features: ["Unlimited product listings", "Advanced analytics dashboard", "Payment integration", "Marketing tools"],
      stats: { label: "Active Vendors", value: "500+" },
      popular: true,
      priority: "primary",
    },
    {
      type: "professional",
      title: "Professional Account",
      tagline: "Installers",
      description: "Access project tools, bulk pricing, and priority support.",
      icon: Users,
      features: ["Bulk pricing discounts", "Priority support", "Extended payment terms", "Project management"],
      stats: { label: "Professionals", value: "300+" },
      popular: false,
      priority: "primary",
    },
    {
      type: "customer",
      title: "Customer Account",
      tagline: "Homes",
      description: "Shop trusted products with easy checkout and delivery tracking.",
      icon: Globe,
      features: ["Competitive prices", "Installation support", "Green financing", "Easy tracking"],
      stats: { label: "Happy Customers", value: "10K+" },
      popular: false,
      priority: "secondary",
    },
    {
      type: "delivery",
      title: "Delivery Partner",
      tagline: "Logistics",
      description: "Join deliveries with flexible schedules and weekly payouts.",
      icon: Truck,
      features: ["Flexible schedule", "Competitive rates", "Weekly payments", "GPS support"],
      stats: { label: "Drivers", value: "200+" },
      popular: false,
      priority: "secondary",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteHeader />

      <main className="flex-1 overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <section className="h-[calc(100svh-5rem)]">
          <div className="mx-auto flex h-full max-w-7xl items-center px-3 sm:px-4 lg:px-6">
            <div className="flex w-full flex-col justify-center">
              <div className="mb-4 text-center md:mb-5">
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Create Account
                </p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                  Choose your registration path
                </h2>
                
              </div>

              <div className="grid auto-rows-fr grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                {registrationTypes.map((regType, index) => (
                  <div
                    key={regType.type}
                    className="group flex h-full min-h-[168px] flex-col rounded-[1.1rem] border border-white/70 bg-white/75 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-slate-200 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)] sm:min-h-[188px] md:min-h-[220px]"
                  >
                    <div className="mb-2.5 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex items-start gap-2.5">
                        <span className="hidden pt-1 text-[10px] font-medium tracking-[0.18em] text-slate-300 md:block">
                          0{index + 1}
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] border border-slate-200 bg-slate-50 text-slate-700 sm:h-10 sm:w-10">
                          <regType.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {regType.tagline}
                            </p>
                            {regType.popular ? (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                                Popular
                              </span>
                            ) : null}
                          </div>
                          <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base md:text-lg">
                            {regType.title}
                          </h3>
                        </div>
                      </div>

                      <div className="rounded-[0.85rem] border border-slate-200 bg-slate-50/80 px-2 py-1.5 text-right">
                        <p className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{regType.stats.value}</p>
                        <p className="hidden text-[9px] text-slate-500 sm:block">{regType.stats.label}</p>
                      </div>
                    </div>

                    <p className="min-h-8 text-[11px] leading-4 text-slate-600 sm:text-xs sm:leading-5 md:text-sm">
                      {regType.description}
                    </p>

                    <div className="mt-2 grid gap-1.5 sm:mt-3">
                      {regType.features.slice(0, 2).map((feature) => (
                        <div
                          key={feature}
                          className="hidden items-center gap-1.5 rounded-[0.8rem] border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5 text-[11px] text-slate-600 sm:flex"
                        >
                          <Sparkles className="h-3 w-3 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-2.5 sm:pt-3">
                      <Button
                        className="group/button h-8 rounded-full bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-white/75 hover:text-slate-900 sm:h-9 sm:px-4 sm:text-sm"
                        asChild
                      >
                        <Link href={`/register/${regType.type}`}>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-center">
                <Link href="/login" className="text-[11px] font-medium text-slate-500 transition-colors hover:text-emerald-700 sm:text-xs">
                  Already registered? Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
