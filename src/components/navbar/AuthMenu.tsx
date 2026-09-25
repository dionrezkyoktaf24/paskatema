"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { canUsePanel, homeForRole, panelLabel } from "@/lib/roles";

const itemClass =
  "block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-rose-600";

export function AuthMenu() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (isLoading) return <div className="h-10 w-24" aria-hidden />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
      >
        <LogIn size={16} /> Masuk
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex max-w-44 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      >
        <span className="truncate">{user.name}</span>
        <ChevronDown size={16} className="shrink-0" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link href="/akun" className={itemClass} onClick={() => setOpen(false)}>
            Akun Saya
          </Link>
          {canUsePanel(user.role) && (
            <Link href={homeForRole(user.role)} className={itemClass} onClick={() => setOpen(false)}>
              {panelLabel(user.role)}
            </Link>
          )}
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              logout();
              router.push("/");
            }}
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const linkClass = "text-base font-medium text-slate-700 hover:text-rose-600";

  if (isLoading) return null;

  if (!user) {
    return (
      <>
        <Link href="/login" className={linkClass} onClick={onNavigate}>
          Masuk
        </Link>
        <Link href="/daftar" className={linkClass} onClick={onNavigate}>
          Buat Akun
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/akun" className={linkClass} onClick={onNavigate}>
        Akun Saya
      </Link>
      {canUsePanel(user.role) && (
        <Link href={homeForRole(user.role)} className={linkClass} onClick={onNavigate}>
          {panelLabel(user.role)}
        </Link>
      )}
      <button
        type="button"
        className={`${linkClass} text-left`}
        onClick={() => {
          onNavigate();
          logout();
          router.push("/");
        }}
      >
        Keluar
      </button>
    </>
  );
}
