"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Mail, Store, Wrench, Truck, User } from "lucide-react"
import { Button } from "@/components/ui/button"

const roleConfig: Record<string, {
  label: string
  headline: string
  sub: string
  steps: { title: string; desc: string }[]
  icon: React.ReactNode
}> = {
  vendor: {
    label: "Vendor Application",
    headline: "You're on your way.",
    sub: "Your application is in our queue. We'll review your documents and get back to you after the review is complete.",
    icon: <Store className="h-6 w-6 text-emerald-300" />,
    steps: [
      { title: "Verify your email", desc: "Click the link we just sent to activate your account." },
      { title: "Application review", desc: "Our team verifies your business documents." },
      { title: "Start selling", desc: "List your products and reach thousands of buyers." },
    ],
  },
  professional: {
    label: "Professional Application",
    headline: "Credentials received.",
    sub: "We've got your application. Our team will verify your credentials and reach out after the review is complete.",
    icon: <Wrench className="h-6 w-6 text-emerald-300" />,
    steps: [
      { title: "Verify your email", desc: "Click the link we just sent to activate your account." },
      { title: "Credentials review", desc: "We verify your licenses and professional standing." },
      { title: "Access your dashboard", desc: "Browse jobs, submit bids, and grow your business." },
    ],
  },
  delivery: {
    label: "Delivery Partner Application",
    headline: "Welcome to the fleet.",
    sub: "Your application has been submitted. We'll review your documents and be in touch after the review is complete.",
    icon: <Truck className="h-6 w-6 text-emerald-300" />,
    steps: [
      { title: "Verify your email", desc: "Click the link we just sent to activate your account." },
      { title: "Background check", desc: "We review your driving history and submitted documents." },
      { title: "Start delivering", desc: "Accept assignments and earn on your schedule." },
    ],
  },
  customer: {
    label: "Customer Account",
    headline: "Account created.",
    sub: "One last step — verify your email and you'll be ready to explore Kenya's leading clean energy marketplace.",
    icon: <User className="h-6 w-6 text-emerald-300" />,
    steps: [
      { title: "Verify your email", desc: "Click the link we just sent to your inbox." },
      { title: "Complete your profile", desc: "Add your delivery address and preferences." },
      { title: "Start shopping", desc: "Browse solar, gas, and renewable energy products." },
    ],
  },
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "customer"
  const config = roleConfig[role] ?? roleConfig.customer

  return (
    <div className="relative h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/70 pointer-events-none" />

      <header className="relative z-10 flex justify-center px-6 pt-5 pb-2">
        <Link href="/">
          <Image
            src="/images/logo/AMAC-Green-logo.png"
            alt="AMAC Green"
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
          />
        </Link>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-3.75rem)] items-center justify-center px-4 py-4 sm:px-6">
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/72 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-slate-200 bg-slate-50">
                  {config.icon}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {config.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400/90" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {config.headline}
                  </h1>
                </div>
                <p className="pl-[48px] text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {config.sub}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(250px,0.85fr)]">
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/75 p-3">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    What Happens Next
                  </p>
                  <div className="space-y-2">
                    {config.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-[0.95rem] border border-slate-200/80 bg-white/80 px-3 py-2.5">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                          <span className="text-[10px] font-semibold text-emerald-700">{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-slate-900 sm:text-sm">{step.title}</p>
                            {i === 0 ? (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                                Action Required
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 sm:text-xs">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50/80 p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.8rem] border border-amber-200 bg-white/80">
                        <Mail className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">Check your inbox now</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                          We sent a verification link to your email address. Your account won&apos;t be active until you click it.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/75 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Need Help?
                    </p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                      Didn&apos;t receive the email? You can sign in later and request another verification link.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 pt-2 sm:flex-row">
                <Button
                  className="group/button h-10 rounded-full bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-white/75 hover:text-slate-900"
                  asChild
                >
                  <Link href="/login">
                    Continue to Sign In
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full border border-slate-200 bg-white/55 px-4 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-white hover:text-slate-900"
                  asChild
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">
            Didn&apos;t receive the email?{" "}
            <Link href="/login" className="text-slate-700 underline underline-offset-2 transition-colors hover:text-emerald-700">
              Sign in to resend it
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
