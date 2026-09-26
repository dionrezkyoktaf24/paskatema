"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { structurePhoto, type PeriodItem, type StructureItem } from "@/services/organisasi";

/** Pengurus periode aktif (dari data Struktur), urut level jabatan. */
export function ProfileSection() {
  const periods = useQuery({
    queryKey: ["public-periods"],
    queryFn: async () => (await apiClient.get<PeriodItem[]>("/period")).data,
  });
  const structures = useQuery({
    queryKey: ["public-structures"],
    queryFn: async () => (await apiClient.get<StructureItem[]>("/structure")).data,
  });

  const active = periods.data?.find((p) => p.isActive) ?? null;
  const pengurus = (structures.data ?? [])
    .filter((s) => active && s.period.id === active.id)
    .sort((a, b) => a.position.level - b.position.level || a.position.name.localeCompare(b.position.name));

  const isLoading = periods.isLoading || structures.isLoading;

  return (
    <section id="pengurus" className="bg-[#FCF9F8] px-6 pb-16 pt-10 lg:px-10 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-600">PROFIL ORGANISASI</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Mengenal Lebih Dekat Keluarga PASKATEMA
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Di balik seragam putih dan langkah tegas, terdapat individu-individu yang mendedikasikan diri untuk kehormatan, kedisiplinan, dan loyalitas tanpa batas.
            {active && ` Berikut pengurus periode ${active.name}.`}
          </p>
        </div>

        {isLoading && <p className="py-10 text-center text-sm text-slate-400">Memuat pengurus...</p>}
        {!isLoading && pengurus.length === 0 && (
          <p className="rounded-[24px] border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
            Data pengurus periode ini belum diisi.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pengurus.map((item) => {
            const photo = structurePhoto(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <Link
                  href={`/anggota/${item.user.id}`}
                  className="group block overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={item.user.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-3xl font-semibold text-rose-600">{item.user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">{item.position.name}</p>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-rose-600">
                    {item.user.name}
                  </h3>
                  {item.user.angkatan !== null && (
                    <p className="mt-1 text-sm text-slate-500">Angkatan {item.user.angkatan}</p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/struktur"
            className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
          >
            Lihat struktur lengkap
          </Link>
          <Link
            href="/anggota"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
          >
            Semua anggota &amp; purna
          </Link>
        </div>
      </div>
    </section>
  );
}
