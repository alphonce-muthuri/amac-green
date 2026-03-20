import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | AMAC Green",
  description: "Sign in to your AMAC Green account to access the renewable energy marketplace.",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
