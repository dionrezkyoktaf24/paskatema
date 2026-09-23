"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { formatNewsDate, newsExcerpt, type NewsArticle } from "@/services/news";
import { Footer } from "@/components/footer/Footer";

export default function BeritaPage() {
  const news = useQuery({
    queryKey: ["news-public"],
    queryFn: async () => (await apiClient.get<NewsArticle[]>("/news")).data,
  });

  const items = news.data ?? [];

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
          Berita
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Kabar Terbaru Paskatema
        </h1>

        {news.isLoading && (
          <p className="mt-12 text-center text-sm text-slate-400">Memuat berita...</p>
        )}
        {news.isError && (
          <p className="mt-12 text-center text-sm text-rose-600">
            Gagal memuat berita. Coba muat ulang halaman.
          </p>
        )}
        {news.isSuccess && items.length === 0 && (
          <p className="mt-12 text-center text-sm text-slate-400">Belum ada berita.</p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/berita/${item.slug}`}
              className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
            >
              <div className="aspect-[16/10] bg-slate-100">
                {item.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="space-y-2 p-5">
                <p className="text-xs text-slate-400">{formatNewsDate(item.createdAt)}</p>
                <h2 className="text-lg font-semibold text-slate-950 group-hover:text-rose-600">
                  {item.title}
                </h2>
                <p className="text-sm leading-6 text-slate-600">{newsExcerpt(item.content)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
