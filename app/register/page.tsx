import { ArrowRight, Building2, Globe, Users, Truck, Sparkles, CheckCircle, Star, TrendingUp } from "lucide-react"
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
      tagline: "Grow Your Business",
      description: "List your renewable energy products and reach thousands of customers",
      icon: Building2,
      accent: "emerald",
      borderColor: "border-emerald-200/70",
      cardBg: "bg-white",
      headerBg: "bg-emerald-50",
      iconCircleBg: "bg-emerald-200/90",
      btnTheme: "bg-emerald-800 hover:bg-emerald-600 text-white",
      features: ["Unlimited product listings", "Advanced analytics dashboard", "Payment integration", "Marketing tools"],
      stats: { label: "Active Vendors", value: "500+" },
      popular: true,
    },
    {
      type: "professional",
      title: "Professional Account",
      tagline: "Wholesale & Installation",
      description: "For installers, distributors, and wholesale buyers",
      icon: Users,
      accent: "emerald",
      borderColor: "border-emerald-200/70",
      cardBg: "bg-white",
      headerBg: "bg-emerald-50",
      iconCircleBg: "bg-emerald-200/90",
      btnTheme: "bg-emerald-800 hover:bg-emerald-600 text-white",
      features: ["Bulk pricing discounts", "Priority support", "Extended payment terms", "Project management"],
      stats: { label: "Professionals", value: "300+" },
      popular: false,
    },
    {
      type: "customer",
      title: "Customer Account",
      tagline: "Easy Shopping",
      description: "Perfect for homes, schools, businesses, and institutions",
      icon: Globe,
      accent: "emerald",
      borderColor: "border-emerald-200/70",
      cardBg: "bg-white",
      headerBg: "bg-emerald-50",
      iconCircleBg: "bg-emerald-200/90",
      btnTheme: "bg-emerald-800 hover:bg-emerald-600 text-white",
      features: ["Competitive prices", "Installation support", "Green financing", "Easy tracking"],
      stats: { label: "Happy Customers", value: "10K+" },
      popular: false,
    },
    {
      type: "delivery",
      title: "Delivery Partner",
      tagline: "Earn with Us",
      description: "Join our delivery network and start earning today",
      icon: Truck,
      accent: "emerald",
      borderColor: "border-emerald-200/70",
      cardBg: "bg-white",
      headerBg: "bg-emerald-50",
      iconCircleBg: "bg-emerald-200/90",
      btnTheme: "bg-emerald-800 hover:bg-emerald-600 text-white",
      features: ["Flexible schedule", "Competitive rates", "Weekly payments", "GPS support"],
      stats: { label: "Drivers", value: "200+" },
      popular: false,
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SiteHeader />

      {/* Hero - aligned with app/page.tsx CTA / dark section style */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden -mt-20 pt-20 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/hero-renewable-energy.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/15 backdrop-blur-sm text-green-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Join the AMAC Green clean energy movement</span>
          </div>
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo/AMAC-Green-logo.png"
              alt="AMAC Green"
              width={200}
              height={56}
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 tracking-tighter">
            Start your journey with AMAC Green
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 tracking-tight">
            Choose your account type and join Kenya&apos;s leading renewable energy marketplace today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Quick setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Registration type cards - aligned with Solutions section card style */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Get Started
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tighter">
              Choose your account type
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {registrationTypes.map((regType) => (
              <div
                key={regType.type}
                className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-200/80 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {regType.popular && (
                  <div className="absolute top-5 right-5 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200/70 text-emerald-700 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Popular</span>
                    </div>
                  </div>
                )}

                <div className={`p-6 ${regType.headerBg} border-b border-gray-200/70`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`w-14 h-14 rounded-full ${regType.iconCircleBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <regType.icon className="w-7 h-7 text-emerald-700" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-gray-900 tracking-tighter">{regType.stats.value}</div>
                      <div className="text-xs text-gray-600 font-medium">{regType.stats.label}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">{regType.tagline}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tighter">{regType.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{regType.description}</p>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {regType.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 ${regType.btnTheme} text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300`}
                    asChild
                  >
                    <Link href={`/register/${regType.type}`}>
                      Create {regType.title}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm p-8 max-w-xl hover:border-emerald-200/80 transition-colors">
              <TrendingUp className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tighter">Already have an account?</h3>
              <p className="text-gray-600 text-sm mb-6 tracking-tight">Sign in to access your dashboard and continue where you left off.</p>
              <Button size="lg" className="bg-emerald-800 hover:bg-emerald-600 text-white px-8 py-6 text-base font-semibold rounded-full shadow-lg" asChild>
                <Link href="/login">Sign In Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip - match app/page.tsx stats section */}
      <section className="py-16 bg-gradient-to-br from-green-500 via-emerald-800 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-semibold mb-1 tracking-tighter">10K+</div>
              <div className="text-emerald-200/90 text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold mb-1 tracking-tighter">1K+</div>
              <div className="text-emerald-200/90 text-sm">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold mb-1 tracking-tighter">99%</div>
              <div className="text-emerald-200/90 text-sm">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold mb-1 tracking-tighter">24/7</div>
              <div className="text-emerald-200/90 text-sm">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
