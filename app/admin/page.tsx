import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getDashboardStats } from "@/app/actions/admin"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const { section = "" } = await searchParams
  const statsResult = await getDashboardStats()
  const stats = statsResult.success ? statsResult.data : null

  return <AdminDashboard initialStats={stats} activeSection={section} />
}
