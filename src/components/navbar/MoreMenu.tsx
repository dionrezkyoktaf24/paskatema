"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { moreNavLinks } from "@/lib/constants";

/** Menu "Lainnya" di navbar desktop: halaman yang lebih jarang dibuka. */
export function MoreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = moreNavLinks.some((l) => pathname === l.href || pathname?.startsWith(`${l.href}/`));

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium transition ${
          isActive ? "text-rose-600" : "text-slate-700 hover:text-rose-600"
        }`}
      >
        Lainnya
        <ChevronDown size={15} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {moreNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                pathname === link.href ? "font-semibold text-rose-600" : "text-slate-700 hover:text-rose-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
