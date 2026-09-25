"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Vote } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Footer } from "@/components/footer/Footer";
import {
  structurePhoto,
  type PeriodItem,
  type StructureItem,
  type VotingItem,
} from "@/services/organisasi";

const divisionCards = [
  {
    title: "Divisi Latihan",
    abbreviation: "DIKLAT",
    description:
      "Bertanggung jawab atas kurikulum pelatihan fisik, PBB (Peraturan Baris Berbaris), dan pembentukan mental anggota baru.",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
  },
  {
    title: "Hubungan Masyarakat",
    abbreviation: "HUMAS",
    description:
      "Mengelola komunikasi eksternal, sosial media, dokumentasi kegiatan, dan menjaga citra positif PASKATEMA di mata publik.",
    accent: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    title: "Perlengkapan",
    abbreviation: "DANLOG",
    description:
      "Inventarisasi, pemeliharaan atribut seragam, bendera, dan persiapan logistik teknis untuk setiap upacara maupun perlombaan.",
    accent: "bg-slate-100 border-slate-200 text-slate-700",
  },
  {
    title: "Kedisiplinan",
    abbreviation: "PROVOS",
    description:
      "Menegakkan aturan organisasi, memantau absensi, dan memastikan kode etik dijunjung tinggi oleh seluruh anggota.",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
  },
];

function Photo({ item, size }: { item: StructureItem; size: number }) {
  const url = structurePhoto(item);
  return (
    <div
      className="mx-auto overflow-hidden rounded-full border border-slate-200 bg-slate-100"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={item.user.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-rose-600">
          {item.user.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function PersonCard({ item, tier }: { item: StructureItem; tier: 0 | 1 | 2 }) {
  const styles = [
    { box: "border-rose-200 bg-rose-50 px-10 py-9", photo: 112, name: "text-2xl" },
    { box: "border-slate-200 bg-white px-8 py-8", photo: 96, name: "text-xl" },
    { box: "border-slate-200 bg-white p-7", photo: 80, name: "text-lg" },
  ][tier];
  return (
    <div className={`w-full max-w-xs rounded-[32px] border text-center shadow-sm ${styles.box}`}>
      <Photo item={item} size={styles.photo} />
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
        {item.position.name}
      </p>
      <h3 className={`mt-3 font-semibold tracking-tight text-slate-950 ${styles.name}`}>{item.user.name}</h3>
      {item.user.angkatan !== null && (
        <p className="mt-1 text-xs text-slate-400">Angkatan {item.user.angkatan}</p>
      )}
    </div>
  );
}

export default function StrukturPage() {
  const periods = useQuery({
    queryKey: ["public-periods"],
    queryFn: async () => (await apiClient.get<PeriodItem[]>("/period")).data,
  });
  const structures = useQuery({
    queryKey: ["public-structures"],
    queryFn: async () => (await apiClient.get<StructureItem[]>("/structure")).data,
  });
  const activeVoting = useQuery({
    queryKey: ["voting-active"],
    queryFn: async () => (await apiClient.get<VotingItem>("/voting/active")).data,
    retry: false,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const periodList = periods.data ?? [];
  // Default: periode aktif, atau periode pertama bila belum ada yang aktif.
  const periodId =
    selected ?? periodList.find((p) => p.isActive)?.id ?? periodList[0]?.id ?? null;

  // Kelompokkan per level jabatan (1 = paling atas).
  const tiers = useMemo(() => {
    const rows = (structures.data ?? []).filter((s) => s.period.id === periodId);
    const byLevel = new Map<number, StructureItem[]>();
    for (const row of rows) {
      byLevel.set(row.position.level, [...(byLevel.get(row.position.level) ?? []), row]);
    }
    return [...byLevel.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, items]) => items.sort((a, b) => a.position.name.localeCompare(b.position.name)));
  }, [structures.data, periodId]);

  const isLoading = periods.isLoading || structures.isLoading;

  return (
    <main className="min-h-screen bg-[#FCF9F8] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Struktur Komando</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Hirarki Kepengurusan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Bagan organisasi PASKATEMA yang terstruktur memastikan koordinasi, disiplin, dan eksekusi program kerja berjalan dengan presisi tinggi.
          </p>
        </section>

        {activeVoting.data && (
          <Link
            href="/voting"
            className="mx-auto mb-8 flex max-w-3xl items-center gap-4 rounded-[24px] border border-rose-200 bg-white p-5 shadow-sm transition hover:border-rose-400"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white">
              <Vote size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Pemilihan sedang berlangsung</p>
              <p className="truncate font-semibold text-slate-950">{activeVoting.data.title}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-rose-600">Pilih sekarang →</span>
          </Link>
        )}

        {periodList.length > 1 && (
          <div className="mb-8 flex justify-center">
            <label className="flex items-center gap-3 text-sm text-slate-600">
              Periode
              <select
                value={periodId ?? ""}
                onChange={(e) => setSelected(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-rose-400"
              >
                {periodList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.isActive ? " (aktif)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-rose-50/90 to-transparent" />
          <div className="relative z-10">
            {isLoading && <p className="py-16 text-center text-sm text-slate-400">Memuat struktur...</p>}
            {(periods.isError || structures.isError) && (
              <p className="py-16 text-center text-sm text-rose-600">Gagal memuat struktur. Coba muat ulang halaman.</p>
            )}
            {!isLoading && !periods.isError && !structures.isError && tiers.length === 0 && (
              <p className="py-16 text-center text-sm text-slate-400">
                Struktur kepengurusan untuk periode ini belum diisi.
              </p>
            )}

            {tiers.map((items, index) => (
              <div key={index}>
                {index > 0 && (
                  <div className="flex justify-center py-6">
                    <div className="h-10 w-px rounded-full bg-slate-200" />
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-6">
                  {items.map((item) => (
                    <PersonCard key={item.id} item={item} tier={Math.min(index, 2) as 0 | 1 | 2} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 py-16 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Divisi Operasional</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Roda penggerak organisasi yang terbagi dalam bidang spesialisasi untuk memastikan setiap program berjalan maksimal.
            </h2>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {divisionCards.map((division) => (
              <article key={division.title} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className={`inline-flex rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${division.accent}`}>
                  {division.abbreviation}
                </div>
                <div className="mt-6 space-y-4">
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{division.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{division.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
