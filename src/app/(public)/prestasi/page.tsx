"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Footer } from "@/components/footer/Footer";
import type { MediaItem } from "@/services/media";

interface AchievementItem {
  id: string;
  title: string;
  year: number;
  description: string | null;
  image: MediaItem | null;
}

export default function PrestasiPage() {
  const achievements = useQuery({
    queryKey: ["public-achievements"],
    queryFn: async () => (await apiClient.get<AchievementItem[]>("/achievement")).data,
  });

  // Dikelompokkan per tahun, terbaru di atas.
  const byYear = useMemo(() => {
    const map = new Map<number, AchievementItem[]>();
    for (const item of achievements.data ?? []) {
      map.set(item.year, [...(map.get(item.year) ?? []), item]);
    }
    return [...map.entries()].sort(([a], [b]) => b - a);
  }, [achievements.data]);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Prestasi</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Jejak Prestasi Paskatema
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
          Penghargaan dan lomba yang pernah diikuti Paskatema SMK Telkom Malang.
        </p>

        {achievements.isLoading && <p className="mt-12 text-center text-sm text-slate-400">Memuat prestasi...</p>}
        {achievements.isError && (
          <p className="mt-12 text-center text-sm text-rose-600">Gagal memuat prestasi. Coba muat ulang halaman.</p>
        )}
        {achievements.isSuccess && achievements.data.length === 0 && (
          <p className="mt-12 text-center text-sm text-slate-400">Belum ada data prestasi.</p>
        )}

        <div className="mt-10 space-y-12">
          {byYear.map(([year, items]) => (
            <div key={year}>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-950">
                <span className="rounded-full bg-rose-600 px-4 py-1 text-base text-white">{year}</span>
                <span className="text-sm font-normal text-slate-400">{items.length} prestasi</span>
              </h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex aspect-[16/10] items-center justify-center bg-slate-100">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <Trophy size={40} className="text-amber-400" />
                      )}
                    </div>
                    <div className="space-y-2 p-5">
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      {item.description && (
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.description}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
