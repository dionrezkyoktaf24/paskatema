"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL, canUsePanel, homeForRole, nextPathFromUrl, panelLabel } from "@/lib/roles";

/**
 * Ditampilkan di halaman login/daftar bila browser ini sudah login (sesi
 * tersimpan di browser, jadi berlaku di semua tab). Daripada langsung
 * dialihkan, pengguna memilih: lanjut dengan akun ini, atau ganti akun.
 */
export function AlreadySignedIn({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const destination = nextPathFromUrl() ?? homeForRole(user.role);
  const continueLabel = nextPathFromUrl()
    ? "Lanjutkan"
    : canUsePanel(user.role)
      ? `Buka ${panelLabel(user.role)}`
      : "Buka Akun Saya";
  const dark = tone === "dark";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl px-4 py-3 text-sm ${dark ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-700"}`}>
        Anda sudah masuk sebagai <b className={dark ? "text-white" : "text-slate-950"}>{user.name}</b>
        <span className={dark ? "text-slate-400" : "text-slate-500"}> ({ROLE_LABEL[user.role]})</span>
        <span className={`mt-0.5 block text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{user.email}</span>
      </div>
      <Link
        href={destination}
        className="flex w-full items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
      >
        {continueLabel}
      </Link>
      <button
        type="button"
        onClick={logout}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
          dark
            ? "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
            : "border-slate-200 text-slate-700 hover:border-slate-300"
        }`}
      >
        <LogOut size={15} />
        Masuk dengan akun lain
      </button>
      <p className={`text-center text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
        Satu browser hanya bisa memakai satu akun sekaligus; ganti akun akan mengeluarkan akun ini di semua tab.
      </p>
    </div>
  );
}
