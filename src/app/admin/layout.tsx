"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { canOpenPanelPath, canUsePanel, homeForRole } from "@/lib/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading) return;

    const canPanel = canUsePanel(user?.role);

    if (!isLoginPage && !canPanel) {
      router.replace("/admin/login");
      return;
    }
    if (user && canPanel && (isLoginPage || !canOpenPanelPath(user.role, pathname))) {
      // Mis. bendahara membuka /admin → arahkan ke laporan keuangan.
      router.replace(homeForRole(user.role));
    }
  }, [isLoading, user, isLoginPage, pathname, router]);

  // Halaman login mengurus tampilannya sendiri (tanpa sidebar).
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user || !canOpenPanelPath(user.role, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
    </div>
  );
}
