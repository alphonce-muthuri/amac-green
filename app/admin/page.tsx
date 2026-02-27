import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getDashboardStats } from "@/app/actions/admin";

export default async function AdminPage() {
  const statsResult = await getDashboardStats();
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <AdminAuthGuard>
      <AdminDashboard initialStats={stats} />
    </AdminAuthGuard>
  );
}
