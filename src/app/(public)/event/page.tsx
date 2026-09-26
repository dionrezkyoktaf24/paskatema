"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, PlayCircle } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Footer } from "@/components/footer/Footer";
import { formatEventDate, type PublicEvent } from "@/services/event";

function EventCard({ event }: { event: PublicEvent }) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
    >
      <div className="relative aspect-[16/10] bg-slate-100">
        {event.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.poster.url} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
        {event.video && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            <PlayCircle size={14} />
            Video
          </span>
        )}
      </div>
      <div className="space-y-2 p-5">
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={13} />
          {formatEventDate(event.date)}
        </p>
        <h2 className="text-lg font-semibold text-slate-950 group-hover:text-rose-600">{event.title}</h2>
        {event.location && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={13} />
            {event.location}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function EventPage() {
  const upcoming = useQuery({
    queryKey: ["events-upcoming"],
    queryFn: async () => (await apiClient.get<PublicEvent[]>("/events/upcoming")).data,
  });
  const past = useQuery({
    queryKey: ["events-past"],
    queryFn: async () => (await apiClient.get<PublicEvent[]>("/events/past")).data,
  });

  const isLoading = upcoming.isLoading || past.isLoading;
  const isError = upcoming.isError || past.isError;
  const empty = !isLoading && !isError && !upcoming.data?.length && !past.data?.length;

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Event</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Agenda &amp; Dokumentasi Kegiatan
        </h1>

        {isLoading && <p className="mt-12 text-center text-sm text-slate-400">Memuat event...</p>}
        {isError && (
          <p className="mt-12 text-center text-sm text-rose-600">Gagal memuat event. Coba muat ulang halaman.</p>
        )}
        {empty && <p className="mt-12 text-center text-sm text-slate-400">Belum ada event.</p>}

        {!!upcoming.data?.length && (
          <>
            <h2 className="mt-12 text-xl font-semibold text-slate-950">Akan Datang</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.data.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}

        {!!past.data?.length && (
          <>
            <h2 className="mt-14 text-xl font-semibold text-slate-950">Dokumentasi Kegiatan</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.data.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
