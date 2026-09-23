"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, CalendarDays, Trophy, BookOpen } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const quickLinks = [
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/event", label: "Event", icon: CalendarDays },
  { href: "/admin/prestasi", label: "Prestasi", icon: Trophy },
  { href: "/admin/ebook", label: "E-Book", icon: BookOpen },
];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const { data: summary } = useQuery({
    queryKey: ["transaction-summary"],
    queryFn: async () => {
      const response = await apiClient.get<TransactionSummary>("/transaction/summary");
      return response.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-slate-500">Selamat datang,</p>
        <h1 className="text-2xl font-semibold text-slate-950">{user?.name}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total Pemasukan
          </p>
          <p className="mt-3 text-2xl font-semibold text-emerald-600">
            {summary ? formatRupiah(summary.totalIncome) : "—"}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total Pengeluaran
          </p>
          <p className="mt-3 text-2xl font-semibold text-rose-600">
            {summary ? formatRupiah(summary.totalExpense) : "—"}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Saldo Kas
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {summary ? formatRupiah(summary.balance) : "—"}
          </p>
          <Link
            href="/admin/keuangan"
            className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline"
          >
            Lihat laporan keuangan →
          </Link>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">Kelola Konten</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-slate-800">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
