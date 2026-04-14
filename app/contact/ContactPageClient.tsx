"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Zap,
  MessageSquare,
  Send,
  HelpCircle,
  ArrowRight,
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
      setFormData({ name: "", email: "", phone: "", subject: "", category: "", message: "" })
      setSubmitStatus("idle")
    }, 3000)
  }

  const channels = [
    {
      num: "01",
      icon: Phone,
      title: "Call Us",
      primary: "+254 700 123 456",
      secondary: "Mon–Fri: 8AM–6PM EAT",
    },
    {
      num: "02",
      icon: Mail,
      title: "Email Us",
      primary: "hello@amacgreen.energy",
      secondary: "support@amacgreen.energy",
    },
    {
      num: "03",
      icon: MapPin,
      title: "Visit Us",
      primary: "Westlands, Nairobi",
      secondary: "Kenya",
    },
  ]

  const faqs = [
    {
      q: "How do I become a verified vendor?",
      a: "Register as a vendor, submit required documents, and our team will review your application within 5–7 business days.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept M-Pesa, bank transfers, and major credit cards for secure transactions.",
    },
    {
      q: "Do you provide installation services?",
      a: "Yes, we connect you with certified professionals for installation and maintenance.",
    },
  ]

  const quickLinks = [
    { label: "Become a Supplier", href: "/register/vendor", icon: Users },
    { label: "Browse Products", href: "/products", icon: Zap },
    { label: "Professional Services", href: "/register/professional", icon: MessageSquare },
  ]

  return (
    <>
      {/* Hero — dark monument */}
      <div className="relative bg-[#0b1a10] overflow-hidden py-28 sm:py-36">
        <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

        {/* Ghost watermark */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
          <span className="text-[20rem] font-black text-white/[0.025] tracking-tighter leading-none pr-4 whitespace-nowrap">
            Hi.
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.35em] mb-6">
            Get in Touch
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.04] mb-6">
            We&apos;re here<br />to help.
          </h1>
          <p className="text-[15px] sm:text-lg text-white/40 max-w-xl leading-relaxed">
            Have questions about renewable energy solutions? Need support with your order? Our team is ready to assist every step of the way.
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
      </div>

      {/* Contact channels — editorial columns */}
      <section className="relative bg-[#0b1a10] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {channels.map((ch) => (
              <div key={ch.num} className="relative group px-6 py-10 sm:px-10 sm:py-14 overflow-hidden">
                <span className="block text-[11px] font-medium text-white/20 tracking-[0.3em] mb-5">
                  {ch.num}
                </span>
                <ch.icon className="w-4 h-4 text-emerald-400/50 mb-5" />
                <div className="text-3xl sm:text-4xl font-bold text-white tracking-tighter leading-none mb-4 group-hover:text-emerald-300 transition-colors duration-500">
                  {ch.title}
                </div>
                <p className="text-white/70 text-sm font-medium">{ch.primary}</p>
                <p className="text-white/30 text-[13px] mt-1">{ch.secondary}</p>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 ease-out" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
      </section>

      {/* Form + Info — white editorial layout */}
      <section className="bg-white">
        {/* Section header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.35em] mb-4">
                Message Us
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-none">
                Send a message.
              </h2>
            </div>
            <p className="text-gray-400 text-[14px] max-w-xs sm:text-right leading-relaxed">
              We&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_360px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

              {/* Form */}
              <div className="py-14 lg:pr-14">
                {submitStatus === "success" ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full border border-emerald-200 flex items-center justify-center mb-6">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Message sent.</h3>
                    <p className="text-gray-400 text-sm">Our team will respond within 24 hours.</p>
                  </div>
                ) : submitStatus === "error" ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full border border-red-200 flex items-center justify-center mb-6">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Something went wrong.</h3>
                    <p className="text-gray-400 text-sm">Please try again or email us directly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                          placeholder="Your full name"
                          className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+254 700 000 000"
                          className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Category</Label>
                        <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                          <SelectTrigger className="border-0 border-b border-gray-200 rounded-none px-0 focus:ring-0 focus-visible:ring-0 shadow-none">
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

                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                        placeholder="Brief description of your inquiry"
                        className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors placeholder:text-gray-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                        placeholder="Please provide details about your inquiry..."
                        rows={5}
                        className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors resize-none placeholder:text-gray-300"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="bg-[#0b1a10] hover:bg-emerald-800 text-white px-10 rounded-full py-6 text-sm tracking-wide transition-colors"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sidebar */}
              <div className="py-14 lg:pl-14 space-y-12">

                {/* Hours */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Business Hours
                  </p>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {[
                      { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
                      { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
                      { day: "Sunday", hours: "Closed" },
                    ].map((row) => (
                      <div key={row.day} className="flex justify-between items-center py-3">
                        <span className="text-[13px] text-gray-500">{row.day}</span>
                        <span className={`text-[13px] font-medium ${row.hours === "Closed" ? "text-gray-300" : "text-gray-900"}`}>
                          {row.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[12px] text-emerald-600 font-medium">
                    Emergency support available 24/7
                  </p>
                </div>

                {/* FAQs */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Common Questions
                  </p>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {faqs.map((faq, i) => (
                      <div key={i} className="py-4">
                        <p className="text-[13px] font-semibold text-gray-900 mb-1">{faq.q}</p>
                        <p className="text-[13px] text-gray-400 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/faq"
                    className="mt-4 inline-flex items-center text-[12px] font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    View all FAQs
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Quick links */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-6">
                    Quick Actions
                  </p>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between py-4 hover:text-emerald-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <link.icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-[13px] font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
