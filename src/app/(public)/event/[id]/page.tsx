"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Footer } from "@/components/footer/Footer";
import { MediaFull } from "@/components/ui/MediaView";
import { formatEventDate, type PublicEvent } from "@/services/event";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const event = useQuery({
    queryKey: ["event", id],
    queryFn: async () => (await apiClient.get<PublicEvent>(`/events/${id}`)).data,
    retry: false,
  });

  const notFound = event.isError && axios.isAxiosError(event.error) && event.error.response?.status === 404;
  const data = event.data;

  return (
    <main className="bg-white">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-14">
        <Link href="/event" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600">
          <ArrowLeft size={15} />
          Semua event
        </Link>

        {event.isLoading && <p className="mt-12 text-center text-sm text-slate-400">Memuat event...</p>}
        {notFound && <p className="mt-12 text-center text-sm text-slate-500">Event tidak ditemukan.</p>}
        {event.isError && !notFound && (
          <p className="mt-12 text-center text-sm text-rose-600">Gagal memuat event. Coba muat ulang halaman.</p>
        )}

        {data && (
          <>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{data.title}</h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} />
                {formatEventDate(data.date)}
              </span>
              {data.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  {data.location}
                </span>
              )}
            </div>

            {data.video && (
              <div className="mt-8 overflow-hidden rounded-[24px] bg-black">
                <MediaFull media={data.video} alt={`Video ${data.title}`} className="aspect-video w-full" />
              </div>
            )}
            {data.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.poster.url} alt="" className="mt-8 w-full rounded-[24px] border border-slate-200 object-cover" />
            )}

            <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">{data.description}</p>
          </>
        )}
      </article>
      <Footer />
    </main>
  );
}
