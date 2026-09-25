"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/constants";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { AuthMenu, MobileAuthLinks } from "@/components/navbar/AuthMenu";

const links = navLinks;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
          <LogoBadge size={40} />
          PASKATEMA
        </Link>

        <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative whitespace-nowrap text-sm font-medium transition ${isActive ? "text-rose-600" : "text-slate-700 hover:text-rose-600"}`}
              >
                {item.label}
                {isActive ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-rose-600"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link href="/pendaftaran" className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-rose-600 bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
            Pendaftaran
          </Link>
          <AuthMenu />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 xl:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-t border-slate-200 bg-white px-6 pb-6 xl:hidden"
        >
          <div className="flex flex-col gap-4 py-4">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="text-base font-medium text-slate-700 hover:text-rose-600" onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/pendaftaran" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-rose-600 bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
              Pendaftaran
            </Link>
            <MobileAuthLinks onNavigate={() => setIsOpen(false)} />
          </div>
        </motion.div>
      ) : null}
    </motion.header>
  );
}
