import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactPageClient } from "./ContactPageClient"

export const metadata = {
  title: "Contact Us | AMAC Green",
  description:
    "Get in touch with AMAC Green & Renewable Energy for clean energy solutions, support, or partnership opportunities.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />
      <ContactPageClient />
      <SiteFooter />
    </div>
  )
}
