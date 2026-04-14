import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, ShieldCheck, Target, Users, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "About Us | AMAC Green",
  description:
    "Learn about AMAC Green & Renewable Energy's mission to accelerate clean energy adoption across Kenya and East Africa.",
}

export default function AboutPage() {
  const milestones = [
    {
      year: "2018",
      title: "Foundation in Nairobi",
      description:
        "AMAC Green was founded with one clear goal: make quality renewable energy products trusted and easy to access.",
    },
    {
      year: "2020",
      title: "Supplier Verification Framework",
      description:
        "We launched strict verification for vendors and professionals to improve reliability, safety, and customer trust.",
    },
    {
      year: "2022",
      title: "Regional Expansion",
      description:
        "Our marketplace and service network expanded across major counties, supporting both residential and commercial projects.",
    },
    {
      year: "Today",
      title: "Scaling Clean Energy Access",
      description:
        "AMAC Green continues to connect buyers, installers, and suppliers in one platform designed for long-term energy impact.",
    },
  ]

  const values = [
    {
      num: "01",
      icon: ShieldCheck,
      title: "Trust by Design",
      description: "Verified suppliers, transparent pricing, and dependable service standards on every order.",
    },
    {
      num: "02",
      icon: Leaf,
      title: "Sustainable Impact",
      description: "We champion practical renewable solutions that reduce costs and environmental footprint.",
    },
    {
      num: "03",
      icon: Target,
      title: "Customer-First Delivery",
      description: "Every product and partnership decision starts with real customer outcomes and long-term value.",
    },
  ]

  const stats = [
    { num: "01", icon: Users, value: "1,000+", label: "Verified Suppliers" },
    { num: "02", icon: Zap, value: "100MW", label: "Solar Capacity Supported" },
    { num: "03", icon: Leaf, value: "50K+", label: "Tons CO₂ Offset Potential" },
    { num: "04", icon: ShieldCheck, value: "50K+", label: "Customer Interactions" },
  ]

  const gallery = [
    {
      src: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1600&q=80",
      alt: "Solar panels installed on a commercial rooftop",
    },
    {
      src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80",
      alt: "Engineers inspecting renewable energy equipment",
    },
    {
      src: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80",
      alt: "Sustainable city energy infrastructure at sunset",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero — full-bleed dark image */}
      <section className="relative h-[100svh] min-h-[100svh] overflow-hidden -mt-20 pt-20">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2200&q=80"
          alt="Solar and renewable energy landscape"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl space-y-5">
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.35em]">
                About AMAC Green
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.04]">
                Powering Kenya&apos;s clean energy future.
              </h1>
              <p className="text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
                We connect trusted suppliers, skilled professionals, and customers to deliver reliable renewable energy for homes and businesses.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 rounded-full py-5"
                  asChild
                >
                  <Link href="/products">
                    Explore Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border border-white/20 bg-transparent text-white/70 hover:bg-white/5 hover:text-white px-8 rounded-full py-5"
                  asChild
                >
                  <Link href="/contact">Talk to Our Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story — white editorial split */}
      <section className="bg-white">
        <div className="absolute top-0 inset-x-0 h-px bg-gray-100" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.35em] mb-4">
                Our Story
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-[1.04]">
                From purpose<br />to platform.
              </h2>
            </div>
            <div className="md:max-w-sm space-y-4 text-gray-400 text-[15px] leading-relaxed md:text-right">
              <p>
                What started as a focused effort to solve trust and access challenges in renewable energy has grown into a complete marketplace ecosystem.
              </p>
              <p>
                Our work blends modern technology with practical on-the-ground energy needs across Kenya and East Africa.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery strip */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {gallery.map((item, i) => (
                <div key={i} className="relative h-64 sm:h-72 overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Milestones — dark editorial rows */}
      <section className="relative bg-[#0b1a10] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

        {/* Ghost watermark */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
          <span className="text-[20rem] font-black text-white/[0.025] tracking-tighter leading-none pr-4 whitespace-nowrap">
            2018
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.35em] mb-4">
                History & Heritage
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-none">
                Key milestones.
              </h2>
            </div>
            <p className="text-white/30 text-sm max-w-xs sm:text-right leading-relaxed">
              How AMAC Green evolved into a trusted clean-energy marketplace.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            {milestones.map((item, i) => (
              <div
                key={item.year}
                className={`relative group flex items-start gap-8 sm:gap-16 px-4 sm:px-6 lg:px-8 py-10 sm:py-12 overflow-hidden${i < milestones.length - 1 ? " border-b border-white/10" : ""}`}
              >
                {/* Year — monument anchor */}
                <div className="shrink-0 w-20 sm:w-28">
                  <span className="text-3xl sm:text-4xl font-bold text-emerald-400/60 tracking-tighter leading-none group-hover:text-emerald-300 transition-colors duration-500">
                    {item.year}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-[14px] leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
      </section>

      {/* Core Values — white editorial columns */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.35em] mb-4">
                What Defines Us
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-none">
                Our core principles.
              </h2>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {values.map((value) => (
                <div key={value.title} className="relative group px-6 py-10 sm:px-10 sm:py-14 overflow-hidden">
                  <span className="block text-[11px] font-medium text-gray-300 tracking-[0.3em] mb-5">
                    {value.num}
                  </span>
                  <value.icon className="w-4 h-4 text-emerald-500/60 mb-5" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tighter leading-tight mb-4 group-hover:text-emerald-700 transition-colors duration-500">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 text-[13px] tracking-wide leading-relaxed max-w-[26ch]">
                    {value.description}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-gray-100" />
      </section>

      {/* By The Numbers — dark monument columns */}
      <section className="relative bg-[#0b1a10] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

        {/* Ghost watermark */}
        <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden">
          <span className="text-[22rem] font-black text-white/[0.025] tracking-tighter leading-none">
            1K+
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.35em] mb-4">
                By The Numbers
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-none">
                Measured impact.
              </h2>
            </div>
            <p className="text-white/30 text-sm max-w-xs sm:text-right leading-relaxed">
              Every supplier, order, and installed system contributes to a cleaner energy future.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10">
              {stats.map((stat) => (
                <div key={stat.num} className="relative group px-6 py-10 sm:px-10 sm:py-14 overflow-hidden">
                  <span className="block text-[11px] font-medium text-white/20 tracking-[0.3em] mb-5">
                    {stat.num}
                  </span>
                  <stat.icon className="w-4 h-4 text-emerald-400/50 mb-5" />
                  <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-4 group-hover:text-emerald-300 transition-colors duration-500">
                    {stat.value}
                  </div>
                  <p className="text-white/45 text-[13px] tracking-wide leading-snug max-w-[16ch]">
                    {stat.label}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* CTA — inline at the bottom of the dark section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden">
          {/* Ghost watermark */}
          <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none overflow-hidden">
            <span className="text-[18rem] font-black text-white/[0.02] tracking-tighter leading-none pl-4 whitespace-nowrap">
              JOIN
            </span>
          </div>

          <div className="relative text-center">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.35em] mb-8">
              Next Chapter
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.04] mb-8">
              Join us in shaping<br className="hidden sm:block" /> Africa&apos;s renewable future.
            </h2>
            <p className="text-[15px] sm:text-lg text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
              Whether you are sourcing products, applying as a verified provider, or planning your next installation — AMAC Green gives you the platform to move confidently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-10 rounded-full py-6 text-base shadow-lg"
                asChild
              >
                <Link href="/register">
                  Join Our Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border border-white/20 text-white/60 hover:bg-white/5 hover:text-white px-10 rounded-full py-6 text-base"
                asChild
              >
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
      </section>

      <SiteFooter />
    </div>
  )
}
