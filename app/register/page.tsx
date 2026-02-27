import { ArrowRight, Building2, Globe, Users, Zap, Truck, Sparkles, CheckCircle, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import Image from "next/image"

export default function RegisterPage() {
  const registrationTypes = [
    {
      type: "vendor",
      title: "Supplier Account",
      tagline: "Grow Your Business",
      description: "List your renewable energy products and reach thousands of customers",
      icon: Building2,
      gradient: "from-orange-500 via-red-500 to-pink-500",
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
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
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
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
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
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      features: ["Flexible schedule", "Competitive rates", "Weekly payments", "GPS support"],
      stats: { label: "Drivers", value: "200+" },
      popular: false,
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-renewable-energy.png"
            alt="Background"
            fill
            className="object-cover opacity-10"
          />
        </div>
        
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-300 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Join 10,000+ Users</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Start Your Journey with<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              EVEREADY ICEP
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose your account type and join Kenya's leading renewable energy marketplace today
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Quick setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {registrationTypes.map((regType) => (
              <div
                key={regType.type}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {regType.popular && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="flex items-center gap-1 px-4 py-2 rounded-full bg-yellow-400 text-gray-900 text-sm font-bold shadow-lg">
                      <Star className="w-4 h-4 fill-current" />
                      <span>Popular</span>
                    </div>
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${regType.gradient}`}></div>

                <div className={`relative bg-gradient-to-br ${regType.gradient} p-8 text-white`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <regType.icon className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{regType.stats.value}</div>
                      <div className="text-sm text-white/80">{regType.stats.label}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-white/80 mb-2">{regType.tagline}</div>
                    <h3 className="text-3xl font-extrabold mb-3">{regType.title}</h3>
                    <p className="text-white/90 leading-relaxed">{regType.description}</p>
                  </div>
                </div>

                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {regType.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${regType.gradient} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-14 bg-gradient-to-r ${regType.gradient} hover:opacity-90 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group`}
                    asChild
                  >
                    <Link href={`/register/${regType.type}`}>
                      <span>Create {regType.title}</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-white rounded-2xl shadow-xl p-8 max-w-2xl">
              <TrendingUp className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Already have an account?</h3>
              <p className="text-gray-600 mb-6">Sign in to access your dashboard and continue where you left off</p>
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-6 text-lg font-bold rounded-xl shadow-lg">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-emerald-200">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1K+</div>
              <div className="text-emerald-200">Products Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-emerald-200">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-emerald-200">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
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
                Kenya's premier renewable energy marketplace connecting suppliers with customers.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-gray-400 hover:text-emerald-400 transition-colors">Products</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>+254 700 123 456</li>
                <li>info@evereadyicep.co.ke</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; 2025 EVEREADY ICEP. All rights reserved. Built with 💚 in Kenya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}