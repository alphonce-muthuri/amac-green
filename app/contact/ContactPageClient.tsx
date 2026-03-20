"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
  Zap,
  HelpCircle,
  Send,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

export function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSubmitStatus("success")
    setIsSubmitting(false)

    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
      })
      setSubmitStatus("idle")
    }, 3000)
  }

  return (
    <>
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
              <MessageSquare className="w-4 h-4" />
              <span>Get in Touch</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              We're Here to Help
            </h1>
            
            <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              Have questions about renewable energy solutions? Need support with your order? Our team is ready to assist you every step of the way.
            </p>
          </div>
        </div>
      </div>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Call Us</h3>
                <p className="text-gray-600 mb-4">Speak directly with our renewable energy experts</p>
                <div className="space-y-2">
                  <p className="font-semibold text-lg text-emerald-600">+254 700 123 456</p>
                  <p className="text-sm text-gray-500">Mon-Fri: 8AM-6PM EAT</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Email Us</h3>
                <p className="text-gray-600 mb-4">We'll respond within 24 hours</p>
                <div className="space-y-2">
                  <p className="font-semibold text-teal-600">hello@amacgreen.energy</p>
                  <p className="text-sm text-gray-500">support@amacgreen.energy</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-cyan-100 hover:border-cyan-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Visit Us</h3>
                <p className="text-gray-600 mb-4">See our renewable energy showcase</p>
                <div className="space-y-2">
                  <p className="font-semibold text-cyan-600">Westlands, Nairobi</p>
                  <p className="text-sm text-gray-500">Kenya</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-2 border-gray-200 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {submitStatus === "success" ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h3>
                    <p className="text-gray-600">Thank you for contacting us. Our team will respond within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                          placeholder="Your full name"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+254 700 000 000"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="product">Product Information</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="vendor">Become a Supplier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-gray-700 font-medium">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                        placeholder="Brief description of your inquiry"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-gray-700 font-medium">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                        placeholder="Please provide details about your inquiry..."
                        rows={5}
                        className="mt-1.5"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg shadow-lg" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border-2 border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                  <CardTitle className="flex items-center text-gray-900">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Saturday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Sunday</span>
                    <span className="text-gray-500">Closed</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm bg-emerald-50 p-3 rounded-lg">
                      <Sparkles className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0" />
                      <span className="text-emerald-700 font-medium">Emergency support available 24/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                  <CardTitle className="flex items-center text-gray-900">
                    <HelpCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How do I become a verified vendor?</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Register as a vendor, submit required documents, and our team will review your application within 5-7 business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We accept M-Pesa, bank transfers, and major credit cards for secure transactions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Do you provide installation services?</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Yes, we connect you with certified professionals for installation and maintenance services.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-2 hover:border-purple-300 hover:bg-purple-50" asChild>
                    <Link href="/faq">View All FAQs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200">
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start border-2 hover:border-emerald-300 hover:bg-emerald-50" asChild>
                    <Link href="/register/vendor">
                      <Users className="h-4 w-4 mr-2" />
                      Become a Supplier
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-2 hover:border-emerald-300 hover:bg-emerald-50" asChild>
                    <Link href="/products">
                      <Zap className="h-4 w-4 mr-2" />
                      Browse Products
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-2 hover:border-emerald-300 hover:bg-emerald-50" asChild>
                    <Link href="/register/professional">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Professional Services
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is provided by the page layout */}
    </>
  )
}