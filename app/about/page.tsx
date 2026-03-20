import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Award, Zap, Leaf, Shield, Target, TrendingUp, Users, Heart, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "About Us | AMAC Green",
  description:
    "Learn about AMAC Green & Renewable Energy's mission to accelerate clean energy adoption across Kenya and East Africa.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SiteHeader />

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>About AMAC Green</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Powering Africa's
              <span className="block text-emerald-100">Clean Energy Future</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              AMAC Green & Renewable Energy connects businesses and individuals with verified clean‑energy suppliers, making
              sustainable power accessible and affordable across Kenya and East Africa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 px-8 py-6 text-lg font-semibold shadow-xl"
                asChild
              >
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-6 text-lg font-semibold shadow-lg"
                asChild
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To accelerate the adoption of renewable energy solutions across Kenya and East Africa by creating a trusted marketplace that connects quality suppliers with customers seeking sustainable energy alternatives.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-7 w-7 text-teal-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  A future where renewable energy is the primary power source for all Kenyans, driving economic growth, environmental sustainability, and energy independence across the region.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Our Values
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Drives Us Forward
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape our commitment to customers and partners
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600 leading-relaxed">
                Committed to environmental stewardship and promoting solutions that protect our planet for future generations.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                Honest communication, clear pricing, and transparent business practices that build lasting trust with our community.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Partnering only with verified suppliers who meet strict quality standards and provide reliable products.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                Dedicated to providing exceptional service and support at every touchpoint of your energy journey.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">
                Continuously seeking better ways to serve through technology and improved efficiency.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Striving for the highest standards in every aspect of our platform and service delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Making a difference in Kenya's renewable energy landscape
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">1,000+</div>
              <div className="text-emerald-100 text-lg">Verified Suppliers</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-emerald-100 text-lg">Happy Customers</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100MW</div>
              <div className="text-emerald-100 text-lg">Solar Capacity</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K</div>
              <div className="text-emerald-100 text-lg">Tons CO₂ Saved</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Our Team
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the experts driving Kenya's renewable energy transformation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300 overflow-hidden">
              <div className="relative h-72 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center p-8">
                <div className="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                  <Users className="w-20 h-20 text-white" />
                </div>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sarah Kimani</h3>
                <p className="text-emerald-600 font-semibold mb-3">Chief Executive Officer</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  15+ years in renewable energy sector, former World Bank energy consultant
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300 overflow-hidden">
              <div className="relative h-72 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 flex items-center justify-center p-8">
                <div className="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                  <Users className="w-20 h-20 text-white" />
                </div>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">David Ochieng</h3>
                <p className="text-emerald-600 font-semibold mb-3">Chief Technology Officer</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tech entrepreneur with expertise in marketplace platforms and clean energy
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300 overflow-hidden">
              <div className="relative h-72 bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400 flex items-center justify-center p-8">
                <div className="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                  <Users className="w-20 h-20 text-white" />
                </div>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grace Wanjiku</h3>
                <p className="text-emerald-600 font-semibold mb-3">Head of Operations</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Supply chain expert focused on quality assurance and vendor partnerships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
            <span>Join the AMAC Green movement</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to power Kenya&apos;s clean energy future?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Whether you&apos;re a supplier looking to reach more customers or a buyer seeking quality renewable energy
            products, AMAC Green is here to help you succeed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-6 text-lg font-semibold shadow-2xl"
              asChild
            >
              <Link href="/register">Join Our Platform</Link>
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-6 text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}