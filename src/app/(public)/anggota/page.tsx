"use client";

import { Footer } from "@/components/footer/Footer";
import { profileCards } from "@/lib/profileData";
import Image from "next/image";
import { useMemo, useState } from "react";

export default function AnggotaPage() {
  const batches = useMemo(() => {
    const set = new Set(profileCards.map((p) => p.batch));
    return ["Semua Angkatan", ...Array.from(set)];
  }, []);

  const [selected, setSelected] = useState<string>(batches[0]);

  const members = useMemo(() => {
    if (selected === "Semua Angkatan") return profileCards;
    return profileCards.filter((p) => p.batch === selected);
  }, [selected]);

  return (
    <main className="min-h-screen bg-white px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold">Anggota</h1>
        <p className="mt-2 text-slate-600">Pilih angkatan untuk melihat daftar anggota.</p>

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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => (
            <article key={m.title} className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Image src={m.image} alt={m.title} width={96} height={96} className="object-cover" />
                ) : (
                  <span className="text-slate-400">👤</span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-slate-900">{m.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{m.batch} — {m.role}</p>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}

