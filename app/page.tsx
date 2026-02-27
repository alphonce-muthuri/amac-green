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

export default function LandingPage() {
  const [showTop, setShowTop] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

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
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const heroSlides = [
    {
      id: 1,
      tag: "SOLAR ENERGY",
      title: "Power Your Future",
      subtitle: "with Premium Solar Solutions",
      description: "Complete solar systems, inverters, and batteries with professional installation. Join the solar revolution today.",
      image: "/images/hero-renewable-energy.png",
      gradient: "from-yellow-500/20 via-orange-500/20 to-red-500/20",
      icon: Sun,
      link: "/products?category=solar",
      buttonText: "Explore Solar",
    },
    {
      id: 2,
      tag: "LPG SOLUTIONS",
      title: "Clean Cooking Energy",
      subtitle: "for Every Home & Business",
      description: "Safe, efficient LPG cylinders, regulators, and stoves. Nationwide distribution with guaranteed quality.",
      image: "/lpg.png",
      gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
      icon: Flame,
      link: "/products?category=lpg",
      buttonText: "Shop LPG",
    },
    {
      id: 3,
      tag: "ECO BRIQUETTES",
      title: "Sustainable Heating",
      subtitle: "that Protects Our Planet",
      description: "Premium biomass briquettes for efficient cooking. Eco-friendly, long-burning, and cost-effective solutions.",
      image: "/briquettes.png",
      gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
      icon: Leaf,
      link: "/products?category=briquettes",
      buttonText: "Buy Briquettes",
    },
  ]

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
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      link: "/products?category=solar",
    },
    {
      icon: Flame,
      title: "LPG Solutions",
      description: "Quality LPG cylinders, regulators, stoves, and nationwide distribution services for safe cooking.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      link: "/products?category=lpg",
    },
    {
      icon: Leaf,
      title: "Eco Briquettes",
      description: "Sustainable charcoal and biomass briquettes for efficient cooking with minimal environmental impact.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
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
    { label: "Active Suppliers", value: "1,000+", icon: Users },
    { label: "Happy Customers", value: "50K+", icon: Sparkles },
    { label: "Products Listed", value: "10K+", icon: TrendingUp },
    { label: "Success Rate", value: "99%", icon: Award },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section - Redesigned with Modern Aesthetic */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {heroSlides[currentSlide].tag}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                    {heroSlides[currentSlide].title}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                      {heroSlides[currentSlide].subtitle}
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                    {heroSlides[currentSlide].description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    asChild
                  >
                    <Link href={heroSlides[currentSlide].link}>
                      {heroSlides[currentSlide].buttonText}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg"
                    asChild
                  >
                    <Link href="/register/vendor">Become a Supplier</Link>
                  </Button>
                </div>

                {/* Slide Indicators */}
                <div className="flex gap-2 justify-center lg:justify-start pt-4">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? "w-12 bg-emerald-600" 
                          : "w-6 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column - Image/Visual */}
              <div className="relative hidden lg:block">
                <div className="relative w-full h-[600px]">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-all duration-700 ${
                        index === currentSlide 
                          ? "opacity-100 scale-100" 
                          : "opacity-0 scale-95"
                      }`}
                    >
                      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} mix-blend-overlay`}></div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Floating Icon */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-2xl flex items-center justify-center animate-float">
                    {(() => {
                      const Icon = heroSlides[currentSlide].icon
                      return <Icon className="w-12 h-12 text-white" />
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section - Redesigned */}
        <section className="py-16 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                Trusted Partners
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Working with Kenya's Leading Companies
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section - Redesigned with Cards */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                Our Solutions
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Clean Energy for Everyone
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive renewable energy products and services tailored to your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <Link
                  key={index}
                  href={solution.link}
                  className="group"
                >
                  <Card className={`h-full border-2 ${solution.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white`}>
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl ${solution.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <solution.icon className={`w-8 h-8 ${solution.color}`} />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {solution.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {solution.description}
                      </p>
                      <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                        Learn more
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - New Addition */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Our Impact in Numbers
              </h2>
              <p className="text-xl text-emerald-100">
                Growing every day to serve you better
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-emerald-100 text-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Redesigned */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                Why Choose Us
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Built for Your Success
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Redesigned */}
        <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/hero-renewable-energy.png"
              alt="Background"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Join Thousands of Happy Customers</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Power Your Future?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Start your clean energy journey today. Browse products, compare prices, and get the best deals from verified suppliers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-6 text-lg shadow-2xl"
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
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-6 text-lg"
                asChild
              >
                <Link href="/register/vendor">Become a Supplier</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Redesigned */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">EVEREADY ICEP</span>
                  <span className="block text-xs text-gray-400">Clean Energy Platform</span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Kenya's premier renewable energy marketplace connecting suppliers with customers. Making clean energy accessible and affordable for everyone.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://tiktok.com" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-gray-400 hover:text-emerald-400 transition-colors">Products</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-emerald-400 transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* For Suppliers */}
            <div>
              <h4 className="font-bold text-lg mb-4">For Suppliers</h4>
              <ul className="space-y-3">
                <li><Link href="/register/vendor" className="text-gray-400 hover:text-emerald-400 transition-colors">Become a Supplier</Link></li>
                <li><Link href="/register/professional" className="text-gray-400 hover:text-emerald-400 transition-colors">Professional Services</Link></li>
              </ul>
              
              <div className="mt-6">
                <h4 className="font-bold text-lg mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>+254 700 123 456</li>
                  <li>info@evereadyicep.co.ke</li>
                  <li>Nairobi, Kenya</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; 2025 EVEREADY ICEP. All rights reserved. Built with 💚 in Kenya.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110"
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
      `}</style>
    </div>
  )
}