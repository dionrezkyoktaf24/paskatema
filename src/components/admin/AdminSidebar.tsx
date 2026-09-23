"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Trophy,
  BookOpen,
  Wallet,
  Users2,
  ClipboardList,
  Vote,
  LogOut,
} from "lucide-react";

import type { AuthUser } from "@/lib/auth-storage";

const navGroups = [
  {
    title: "Utama",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Konten",
    items: [
      { href: "/admin/berita", label: "Berita", icon: Newspaper },
      { href: "/admin/event", label: "Event", icon: CalendarDays },
      { href: "/admin/prestasi", label: "Prestasi", icon: Trophy },
      { href: "/admin/ebook", label: "E-Book", icon: BookOpen },
    ],
  },
  {
    title: "Organisasi",
    items: [
      { href: "/admin/struktur", label: "Struktur & Periode", icon: Users2 },
      { href: "/admin/pendaftaran", label: "Pendaftaran", icon: ClipboardList },
      { href: "/admin/voting", label: "Voting", icon: Vote },
    ],
  },
  {
    title: "Keuangan",
    items: [{ href: "/admin/keuangan", label: "Laporan Keuangan", icon: Wallet }],
  },
];

export function AdminSidebar({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
          Paskatema
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">Panel Admin</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {group.title}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-rose-50 text-rose-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={17} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
