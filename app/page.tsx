"use client"

import {
  ArrowRight,
  CheckCircle,
  Globe,
  Shield,
  Truck,
  Users,
  Zap,
  ArrowUp,
  Sun,
  Flame,
  Leaf,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LandingPage() {
  const [showTop, setShowTop] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      id: 1,
      tag: "AMAC GREEN • SOLAR",
      title: "Powering cities & communities",
      subtitle: "with premier solar infrastructure",
      description:
        "Flagship solar systems, inverters, and storage deployed with certified engineering teams. Designed for landmark projects and everyday homes alike.",
      image: "/images/hero-renewable-energy.png",
      link: "/products?category=solar",
      buttonText: "Explore solar solutions",
    },
    {
      id: 2,
      tag: "AMAC GREEN • LPG",
      title: "Clean cooking for all",
      subtitle: "from homes to mega kitchens",
      description:
        "Safe, efficient LPG cylinders, regulators, and stoves with managed distribution. Built for households, estates, and large-scale catering.",
      image: "/lpg.png",
      link: "/products?category=lpg",
      buttonText: "Shop LPG",
    },
    {
      id: 3,
      tag: "AMAC GREEN • BIO ENERGY",
      title: "Sustainable heat & power",
      subtitle: "that protects our planet",
      description:
        "Premium biomass briquettes and eco–fuels for efficient heating. Cleaner combustion, longer burn times, and lower emissions.",
      image: "/briquettes.png",
      link: "/products?category=briquettes",
      buttonText: "Buy briquettes",
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 200)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-rotate hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
      description: "Complete solar panel systems with inverters, batteries, and professional installation for homes and businesses.",
      color: "text-yellow-600",
      cardBg: "bg-yellow-50",
      headerBg: "bg-yellow-100",
      iconCircleBg: "bg-yellow-200/90",
      borderColor: "border-yellow-200/70",
      titleHover: "group-hover:text-yellow-600",
      btnTheme: "border-yellow-600 text-yellow-600 hover:bg-yellow-100 hover:border-yellow-700 hover:text-yellow-700",
      link: "/products?category=solar",
    },
    {
      icon: Flame,
      title: "LPG Solutions",
      description: "Quality LPG cylinders, regulators, stoves, and nationwide distribution services for safe cooking.",
      color: "text-orange-600",
      cardBg: "bg-orange-50",
      headerBg: "bg-orange-100",
      iconCircleBg: "bg-orange-200/90",
      borderColor: "border-orange-200/70",
      titleHover: "group-hover:text-orange-600",
      btnTheme: "border-orange-600 text-orange-600 hover:bg-orange-100 hover:border-orange-700 hover:text-orange-700",
      link: "/products?category=lpg",
    },
    {
      icon: Leaf,
      title: "Eco Briquettes",
      description: "Sustainable charcoal and biomass briquettes for efficient cooking with minimal environmental impact.",
      color: "text-green-600",
      cardBg: "bg-green-50",
      headerBg: "bg-green-100",
      iconCircleBg: "bg-green-200/90",
      borderColor: "border-green-200/70",
      titleHover: "group-hover:text-green-600",
      btnTheme: "border-green-600 text-green-600 hover:bg-green-100 hover:border-green-700 hover:text-green-700",
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
    { label: "Households & Businesses Served", value: "50K+", icon: Sparkles },
    { label: "Energy Products Deployed", value: "10K+", icon: TrendingUp },
    { label: "On‑Time Project Delivery", value: "99%", icon: Award },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section - 60vh, extends behind header, left-aligned */}
        <section className="relative min-h-[40vh] flex items-center overflow-hidden -mt-20 pt-20">
          {/* Background image (changes with slide, smooth cross-fade + slight zoom) */}
          <div className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transform transition-[opacity,transform] duration-700 ease-out ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
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
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/75" />

          {/* Hero Content - left-aligned, space on the right */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-left">
            <div key={currentSlide} className="space-y-6 animate-fade-in-up max-w-2xl">
              {/* Carousel indicators - aligned with hero text */}
              <div className="flex gap-2 ml-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-[2px] w-[8px] rounded-full transition-all duration-500 ${
                      index === currentSlide ? "bg-white" : "bg-white/25"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-emerald-200 uppercase ml-2">
                {heroSlides[currentSlide].tag}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-white leading-tight tracking-tighter">
                {heroSlides[currentSlide].title}
                <span className="block text-emerald-200 text-lg sm:text-xl md:text-2xl mt-2 font-semibold tracking-tighter">
                  {heroSlides[currentSlide].subtitle}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/90 min-h-[72px]">
                {heroSlides[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start pt-2">
                <Button
                  size="lg"
                  className="bg-emerald-800 hover:bg-emerald-600 text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] rounded-full"
                  asChild
                >
                  <Link href={heroSlides[currentSlide].link}>
                    {heroSlides[currentSlide].buttonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-base min-w-[200px] rounded-full hover:text-white"
                  asChild
                >
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section - Redesigned */}
        <section className="my-16 border-b border-gray-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-6">
                Our Trusted Partners
              </p>
              <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 tracking-tighter max-w-5xl mx-auto !leading-[1.6] pb-10">
                Working with Kenya's leading companies to serve more than 55,000 homes and businesses.
              </h2>
            </div>
            
            <div className="mt-4 border-t border-gray-200/70 pt-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 items-center">
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center group"
                  >
                    {partner.name === "Jinko" ? (
                      <div className="w-20 h-20 flex items-center justify-center rounded-full border border-emerald-900/7 transition-transform duration-300 group-hover:scale-105 shrink-0">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          width={80}
                          height={80}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={160}
                        height={80}
                        className="max-h-16 w-auto object-contain opacity-100 transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section - Redesigned with Cards */}
        <section className="pb-[120px] pt-10 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-6">
                Our Solutions
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 tracking-tighter">
                Clean energy for everyone
              </h2>
              <p className="text-lg tracking-tight text-gray-600 max-w-3xl mx-auto pb-10">
                Comprehensive renewable energy products and services tailored to your specific needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <Link
                  key={index}
                  href={solution.link}
                  className="group block h-full"
                >
                  <Card className={`rounded-xl h-full flex flex-col border-2 ${solution.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${solution.cardBg}`}>
                    <CardHeader className={`py-4 px-6 ${solution.headerBg}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full ${solution.iconCircleBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                          <solution.icon className={`w-7 h-7 ${solution.color}`} />
                        </div>
                        <CardTitle className={`text-xl font-bold transition-colors leading-tight tracking-tighter ${solution.color} ${solution.titleHover}`}>
                          {solution.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col pt-5 pb-6 px-6">
                      <p className="text-black/65 font-medium tracking-tight leading-relaxed mb-16">
                        {solution.description}
                      </p>
                      <span
                        className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-colors group-hover:translate-x-0.5 ${solution.btnTheme}`}
                      >
                        Learn more
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - New Addition */}
        <section className="py-[120px] bg-gradient-to-br from-green-500 via-emerald-800 to-emerald-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 pb-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 tracking-tighter">
                Our impact in numbers
              </h2>
              <p className="text-xl text-white/70 tracking-tight">
                Growing every day to serve you better
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400/10 border border-green-400/15 backdrop-blur-sm rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-semibold text-white mb-2 tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-base tracking-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Redesigned */}
        <section className="py-[120px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 pb-10">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                Why Choose Us
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 tracking-tighter">
                Built for your success
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 px-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start justify-start"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 border border-green-600/15 backdrop-blur-sm rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tighter">
                    {feature.title}
                  </h3>
                  <div className="w-full h-[1px] bg-emerald-600/35 mb-6"></div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Redesigned */}
        <section className="py-[120px] bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/hero-renewable-energy.png"
              alt="Background"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/15 backdrop-blur-sm text-green-400 text-sm font-medium mb-16">
              <Sparkles className="w-4 h-4" />
              <span>Join the AMAC Green clean energy movement</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-semibold text-white mb-6 tracking-tighter">
              Ready to power the next chapter of energy?
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto tracking-tight">
              Partner with AMAC Green to plan, procure, and deploy world‑class renewable energy projects — from individual rooftops to flagship national programs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-10">
              <Button
                size="lg"
                className="bg-emerald-800 hover:bg-emerald-600 text-white px-10 rounded-full py-6 text-lg shadow-2xl"
                asChild
              >
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white/80 hover:bg-white/10 hover:text-white px-10 rounded-full py-6 text-lg"
                asChild
              >
                <Link href="/register/vendor">Become a Supplier</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-900/35 border border-green-400/15 text-white shadow-2xl hover:bg-emerald-600 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 rounded-full"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(0, 20px) scale(1);
          }
          75% {
            transform: translate(-20px, -15px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}