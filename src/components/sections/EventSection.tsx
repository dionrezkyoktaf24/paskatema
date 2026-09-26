"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { eventCard } from "@/lib/constants";
import { formatEventDate, type PublicEvent } from "@/services/event";

export function EventSection() {
  const events = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => (await apiClient.get<PublicEvent[]>("/events")).data,
  });
  // Empat event terbaru yang punya poster.
  const latest = (events.data ?? [])
    .filter((e) => e.poster)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

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
          <span className="absolute left-6 top-6 z-10 inline-flex rounded-full border border-rose-500/20 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600 shadow-lg shadow-rose-500/10">
            {latest.length > 0 ? "EVENT TERBARU" : eventCard.label}
          </span>
          {latest.length > 0 ? (
            <div className={`grid h-[420px] gap-4 p-6 pt-20 sm:h-[480px] sm:p-8 sm:pt-20 ${latest.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {latest.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={event.poster!.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-left text-white">
                    <span className="block truncate text-sm font-semibold">{event.title}</span>
                    <span className="block text-[11px] opacity-80">{formatEventDate(event.date)}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            // Belum ada event berposter: pakai foto kegiatan Paskatema.
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/image1.jpeg" alt="Kegiatan Paskatema" className="h-[420px] w-full object-cover sm:h-[480px]" />
          )}
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

          <Link
            href="/event"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-rose-500 px-8 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600"
          >
            Lihat Agenda &amp; Dokumentasi Event
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
