"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { checkAdminAccess } from "@/app/actions/admin";
import { CenteredPanelSkeleton } from "@/components/loaders/page-skeletons";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const isAdmin = await checkAdminAccess(user.email || "");
      if (!isAdmin) {
        router.replace("/");
        return;
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <CenteredPanelSkeleton />;
  }

  return <>{children}</>;
}
