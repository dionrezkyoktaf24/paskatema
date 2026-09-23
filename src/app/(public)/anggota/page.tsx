"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/footer/Footer";
import { apiClient } from "@/lib/api";

interface PublicMember {
  id: string;
  name: string;
  angkatan: number;
  avatarUrl: string | null;
  position: string | null;
}

export default function AnggotaPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-members"],
    queryFn: async () => (await apiClient.get<PublicMember[]>("/user/public")).data,
  });

  const members = useMemo(() => data ?? [], [data]);

  const batches = useMemo(() => {
    const set = new Set(members.map((m) => `Angkatan ${m.angkatan}`));
    return ["Semua Angkatan", ...Array.from(set).sort().reverse()];
  }, [members]);

  const [selected, setSelected] = useState<string>("Semua Angkatan");

  const filtered = useMemo(() => {
    if (selected === "Semua Angkatan") return members;
    return members.filter((m) => `Angkatan ${m.angkatan}` === selected);
  }, [members, selected]);

  return (
    <main className="min-h-screen bg-white px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold">Anggota</h1>
        <p className="mt-2 text-slate-600">Pilih angkatan untuk melihat daftar anggota.</p>

        {!isLoading && members.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {batches.map((b) => (
              <button
                key={b}
                onClick={() => setSelected(b)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selected === b ? "border-rose-600 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-600"}`}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <p className="mt-10 text-center text-sm text-slate-400">Memuat data anggota...</p>
        )}

        {!isLoading && members.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-400">
            Belum ada data anggota yang ditampilkan.
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <article
              key={m.id}
              className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {m.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-slate-400">👤</span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-slate-900">{m.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Angkatan {m.angkatan} — {m.position ?? "Anggota"}
              </p>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
