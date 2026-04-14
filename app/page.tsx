"use client"

import {
  ArrowRight,
  Shield,
  Truck,
  Users,
  ArrowUp,
  Sun,
  Flame,
  Leaf,
  TrendingUp,
  Award,
  Clock,
  Search,
  Headset,
  ChevronDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LandingPage() {
  const [showTop, setShowTop] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      id: 1,
      tag: "AMAC GREEN · SOLAR",
      title: "Powering cities &\ncommunities",
      subtitle: "with premier solar infrastructure",
      description:
        "Flagship solar systems, inverters, and storage deployed with certified engineering teams. Designed for landmark projects and everyday homes alike.",
      image: "/images/hero-renewable-energy.png",
      link: "/products?category=solar",
      buttonText: "Explore solar solutions",
    },
    {
      id: 2,
      tag: "AMAC GREEN · LPG",
      title: "Clean cooking\nfor all",
      subtitle: "from homes to mega kitchens",
      description:
        "Safe, efficient LPG cylinders, regulators, and stoves with managed distribution. Built for households, estates, and large-scale catering.",
      image: "/lpg.png",
      link: "/products?category=lpg",
      buttonText: "Shop LPG",
    },
    {
      id: 3,
      tag: "AMAC GREEN · BIO ENERGY",
      title: "Sustainable heat\n& power",
      subtitle: "that protects our planet",
      description:
        "Premium biomass briquettes and eco–fuels for efficient heating. Cleaner combustion, longer burn times, and lower emissions.",
      image: "/briquettes.png",
      link: "/products?category=briquettes",
      buttonText: "Buy briquettes",
    },
  ]

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 200)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  const partners = [
    { name: "Blaze", logo: "/images/blazerounded.png" },
    { name: "KCB", logo: "/images/kcbrounded.png" },
    { name: "National", logo: "/images/nationalrounded.png" },
    { name: "Jinko", logo: "/images/jinkorounded.png" },
    { name: "Huawei", logo: "/images/huaweirounded.png" },
  ]

  const solutions = [
    {
      icon: Sun,
      title: "Solar Energy",
      eyebrow: "For homes and enterprises",
      description: "High-efficiency panels, storage, and installation for dependable day-to-night power.",
      link: "/products?category=solar",
    },
    {
      icon: Flame,
      title: "LPG Solutions",
      eyebrow: "For modern kitchens",
      description: "Safe LPG cylinders, accessories, and refill distribution designed for reliable everyday use.",
      link: "/products?category=lpg",
    },
    {
      icon: Leaf,
      title: "Eco Briquettes",
      eyebrow: "For sustainable heating",
      description: "Long-burning biomass fuel with cleaner combustion and lower environmental footprint.",
      link: "/products?category=briquettes",
    },
  ]

  const features = [
    {
      icon: Shield,
      title: "Verified Quality",
      description: "All products from certified suppliers with quality guarantees and comprehensive warranties.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Nationwide delivery with real-time tracking. Get your products when and where you need them.",
    },
    {
      icon: Award,
      title: "Best Prices",
      description: "Competitive pricing from multiple vendors. Compare and choose the best deals for your needs.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service. We're always here to help you with any questions or issues.",
    },
  ]

  const stats = [
    { label: "Clean Energy Partners", value: "1,000+", icon: Users },
    { label: "Households & Businesses Served", value: "50K+", icon: Leaf },
    { label: "Energy Products Deployed", value: "10K+", icon: TrendingUp },
    { label: "On‑Time Project Delivery", value: "99%", icon: Award },
  ]

  const quickActions = [
    {
      title: "Browse products",
      description: "Compare energy products across trusted vendors.",
      href: "/products",
      icon: Search,
    },
    {
      title: "Request consultation",
      description: "Get guidance on solar, LPG, or briquette solutions.",
      href: "/contact",
      icon: Headset,
    },
    {
      title: "Track your orders",
      description: "View status, delivery updates, and order history.",
      href: "/customer/orders",
      icon: Truck,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteHeader />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative h-[100svh] min-h-[600px] overflow-hidden -mt-20 pt-20">
          {/* Slide images */}
          <div className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Gradient overlay — deeper on left for legibility, fades to transparent right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
          {/* Bottom gradient vignette */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10 h-full w-full flex flex-col">
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center">
              <div key={currentSlide} className="animate-fade-in-up max-w-2xl w-full space-y-6 py-10">

                {/* Slide indicators */}
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        index === currentSlide
                          ? "w-8 bg-emerald-400"
                          : "w-4 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Tag */}
                <p className="text-[10px] sm:text-xs font-bold tracking-[0.4em] text-emerald-300 uppercase">
                  {heroSlides[currentSlide].tag}
                </p>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.06] tracking-tight whitespace-pre-line">
                  {heroSlides[currentSlide].title}
                </h1>

                {/* Subtitle */}
                <p className="text-emerald-200 text-lg sm:text-xl font-medium tracking-tight -mt-2">
                  {heroSlides[currentSlide].subtitle}
                </p>

                {/* Description */}
                <p className="text-white/70 text-sm sm:text-[15px] leading-relaxed max-w-lg">
                  {heroSlides[currentSlide].description}
                </p>

                {/* Primary CTA split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-full h-12 text-sm font-semibold shadow-lg shadow-emerald-900/40 transition-all duration-300 w-full"
                    asChild
                  >
                    <Link href={heroSlides[currentSlide].link}>
                      Shop products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    className="bg-white/15 border border-white/35 text-white backdrop-blur-sm hover:bg-white/25 hover:border-white/55 px-8 rounded-full h-12 text-sm font-semibold w-full transition-all duration-300"
                    asChild
                  >
                    <Link href="/contact">
                      Get a custom quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Scroll cue */}
            <div className="relative z-10 flex justify-center pb-8 animate-bounce-slow">
              <div className="flex flex-col items-center gap-1.5 text-white/40">
                <span className="text-[10px] tracking-[0.3em] uppercase font-medium">Scroll</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-5 px-6 py-6 sm:px-8 sm:py-7 hover:bg-gray-50/70 transition-colors duration-200"
                >
                  <div className="shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-emerald-400 group-hover:text-emerald-600 transition-all duration-200">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{action.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Partners marquee ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-14">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] text-center mb-10">
            Trusted Partners
          </p>

          {/* Marquee track — single row with 2× items, loops at -50% */}
          <div className="relative overflow-hidden">
            {/* Left & right fade masks */}
            <div className="pointer-events-none absolute left-0 inset-y-0 w-32 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 inset-y-0 w-32 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[...partners, ...partners, ...partners, ...partners].map((partner, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center justify-center mx-14 opacity-55 hover:opacity-100 transition-opacity duration-300"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Solutions ── */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.4em] mb-4">
                  Our Solutions
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-gray-900 tracking-tight leading-[1.06]">
                  Minimal by design.
                  <span className="block text-emerald-700">Powerful in impact.</span>
                </h2>
              </div>
              <p className="text-gray-400 text-sm max-w-xs md:text-right leading-relaxed">
                Three product lines. One clean experience. Built to help you choose fast and deploy with confidence.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100">
            {solutions.map((solution, index) => (
              <Link
                key={index}
                href={solution.link}
                className="group block border-b border-gray-100 hover:bg-gray-50/60 transition-colors duration-200"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="flex items-center gap-5 sm:gap-10">
                    <span className="text-[10px] font-medium text-gray-200 tracking-[0.35em] shrink-0 hidden sm:block w-6 tabular-nums">
                      0{index + 1}
                    </span>
                    <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-emerald-300 group-hover:text-emerald-600 transition-all duration-300 shrink-0">
                      <solution.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-400 tracking-[0.25em] uppercase mb-1">
                        {solution.eyebrow}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight group-hover:text-emerald-800 transition-colors duration-300">
                        {solution.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-sm hidden md:block">
                      {solution.description}
                    </p>
                    <div className="shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── How It Works ── dark monument */}
        <section className="relative bg-[#0a1a0f] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-white/[0.07]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4">
              Simple Process
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-none">
              Three steps to<br />clean energy.
            </h2>
          </div>

          <div className="border-t border-white/[0.07]">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
                {[
                  { num: "01", title: "Discover", text: "Search products by category, price, and supplier confidence." },
                  { num: "02", title: "Compare", text: "Review specs, pricing, and delivery options before checkout." },
                  { num: "03", title: "Receive", text: "Track orders in real time and get support when you need it." },
                ].map((step) => (
                  <div key={step.num} className="relative group px-6 py-12 sm:px-10 sm:py-16 overflow-hidden">
                    <span className="block text-[10px] font-medium text-white/20 tracking-[0.35em] mb-6 tabular-nums">
                      {step.num}
                    </span>
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-5 group-hover:text-emerald-300 transition-colors duration-500">
                      {step.title}
                    </div>
                    <p className="text-white/35 text-sm leading-relaxed max-w-[22ch]">
                      {step.text}
                    </p>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.07]" />
        </section>

        {/* ── Stats ── */}
        <section className="relative bg-[#0a1a0f] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_60%)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-white/[0.07]" />

          {/* Ghost watermark */}
          <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden">
            <span className="text-[22rem] font-black text-white/[0.02] tracking-tighter leading-none">
              99%
            </span>
          </div>

          <div className="pt-16 pb-10 border-b border-white/[0.07]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4">
                    Our Impact
                  </p>
                  <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-none">
                    In numbers.
                  </h2>
                </div>
                <p className="text-white/35 text-sm max-w-xs sm:text-right leading-relaxed">
                  Growing every day — serving homes, businesses, and communities across Kenya.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.07]">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative group px-6 py-10 sm:px-10 sm:py-14 overflow-hidden"
                >
                  <span className="block text-[10px] font-medium text-white/20 tracking-[0.35em] mb-5 tabular-nums">
                    0{index + 1}
                  </span>
                  <stat.icon className="w-4 h-4 text-emerald-400/40 mb-5" />
                  <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-4 group-hover:text-emerald-300 transition-colors duration-500">
                    {stat.value}
                  </div>
                  <p className="text-white/40 text-xs leading-snug max-w-[14ch] tracking-wide">
                    {stat.label}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.07]" />
        </section>

        {/* ── Features ── */}
        <section className="relative bg-white overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gray-100" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.4em] mb-4">
              Why Choose Us
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-none">
              Built for your success.
            </h2>
          </div>

          <div className="border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
                {features.map((feature, index) => (
                  <div key={index} className="relative group px-6 py-10 sm:px-8 sm:py-12 overflow-hidden">
                    <span className="block text-[10px] font-medium text-gray-200 tracking-[0.35em] mb-5 tabular-nums">
                      0{index + 1}
                    </span>
                    <feature.icon className="w-4 h-4 text-emerald-500/50 mb-5" />
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tighter leading-tight mb-3 group-hover:text-emerald-700 transition-colors duration-400">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-[13px] leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-gray-100" />
        </section>

        {/* ── CTA ── */}
        <section className="relative bg-[#0a1a0f] overflow-hidden py-28 sm:py-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-white/[0.07]" />

          {/* Ghost watermark */}
          <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none overflow-hidden">
            <span className="text-[18rem] font-black text-white/[0.025] tracking-tighter leading-none pl-4 whitespace-nowrap">
              AMAC
            </span>
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-8">
              Join the movement
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.06] mb-8">
              Ready to power the<br className="hidden sm:block" /> next chapter of energy?
            </h2>
            <p className="text-sm sm:text-base text-white/40 mb-12 max-w-xl mx-auto leading-relaxed">
              Partner with AMAC Green to plan, procure, and deploy world‑class renewable energy projects — from individual rooftops to flagship national programs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 rounded-full h-12 text-sm font-semibold shadow-lg shadow-emerald-900/40 transition-all duration-300"
                asChild
              >
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border border-white/20 text-white/60 hover:bg-white/5 hover:text-white hover:border-white/40 px-10 rounded-full h-12 text-sm font-medium transition-all duration-300"
                asChild
              >
                <Link href="/register/vendor">Become a Supplier</Link>
              </Button>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.07]" />
        </section>
      </main>

      <SiteFooter />

      {/* Back to top */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3.5 bg-emerald-700/90 backdrop-blur-sm border border-emerald-600/40 text-white shadow-xl hover:bg-emerald-600 transition-all duration-300 hover:scale-105 rounded-full"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
