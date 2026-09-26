"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { eventCard } from "@/lib/constants";

export function EventSection() {
  return (
    <section id="event" className="relative overflow-hidden bg-[#FCF9F8] px-6 py-16 text-slate-950 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute -right-28 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-rose-100 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 rounded-[44px] border border-slate-200 bg-[#FCF9F8] p-6 shadow-[0_50px_120px_-38px_rgba(15,23,42,0.12)] sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-100 to-slate-200" />
          <div className="relative grid h-[420px] sm:h-[480px] gap-4 p-6 sm:p-8">
            <span className="absolute left-6 top-6 inline-flex rounded-full border border-rose-500/20 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600 shadow-lg shadow-rose-500/10">
              {eventCard.label}
            </span>
            <div className="grid h-full w-full grid-cols-2 gap-4 pt-10">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200 bg-white/85 p-4 shadow-sm transition hover:-translate-y-1">
                  <div className="h-24 rounded-[24px] bg-slate-200" />
                  <div className="space-y-3">
                    <div className="h-3 w-16 rounded-full bg-slate-300" />
                    <div className="h-3 w-24 rounded-full bg-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-between"
        >
          <div className="max-w-xl">
            <p className="mb-6 text-sm uppercase tracking-[0.35em] text-rose-500">{eventCard.label}</p>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{eventCard.title}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">{eventCard.description}</p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-4">
            {eventCard.stats.map((item) => (
              <div key={item.label} className="rounded-[28px] border border-slate-800 bg-slate-100 p-6 text-center shadow-sm transition hover:-translate-y-1">
                <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-rose-500 px-8 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600"
          >
            Masuk Portal Antareja
          </a>
          <Link
            href="/event"
            className="mt-4 inline-flex items-center justify-center text-sm font-semibold text-rose-600 hover:underline"
          >
            Lihat agenda &amp; dokumentasi event →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
