import { SiteHeader } from "@/components/site-header"
import { ContactPageClient } from "./ContactPageClient"

export const metadata = {
  title: "Contact Us | EVEREADY ICEP",
  description: "Get in touch with EVEREADY ICEP for renewable energy solutions, support, or partnership opportunities.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <ContactPageClient />
    </div>
  )
}
