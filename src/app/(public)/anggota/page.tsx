"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Footer } from "@/components/footer/Footer";
import { apiClient } from "@/lib/api";
import { MEMBER_STATUS_CLASS, MEMBER_STATUS_LABEL, type MemberStatus } from "@/services/member";

interface PublicMember {
  id: string;
  name: string;
  // Backend hanya mengembalikan anggota dengan angkatan terisi (lihat
  // findPublicDirectory di user.service.ts), tapi tipe kolomnya sendiri
  // nullable — jaga null di sini juga supaya perubahan filter di backend
  // nanti tidak diam-diam nampilkan "Angkatan null" ke publik.
  angkatan: number | null;
  memberStatus: MemberStatus;
  avatarUrl: string | null;
  position: string | null;
}

const chipClass = (active: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-rose-600 bg-rose-50 text-rose-600"
      : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-600"
  }`;

export default function AnggotaPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-members"],
    queryFn: async () => (await apiClient.get<PublicMember[]>("/user/public")).data,
  });

  const members = useMemo(
    () => (data ?? []).filter((m): m is PublicMember & { angkatan: number } => m.angkatan !== null),
    [data],
  );
  const angkatanNumbers = useMemo(
    () => Array.from(new Set(members.map((m) => m.angkatan))).sort((a, b) => b - a),
    [members],
  );

  const [angkatan, setAngkatan] = useState<number | null>(null);
  const [status, setStatus] = useState<MemberStatus | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter(
      (m) =>
        (angkatan === null || m.angkatan === angkatan) &&
        (status === null || m.memberStatus === status) &&
        (!q || m.name.toLowerCase().includes(q)),
    );
  }, [members, angkatan, status, search]);

  return (
    <main className="min-h-screen bg-white px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Jaringan Paskatema</p>
        <h1 className="mt-2 text-3xl font-semibold">Anggota &amp; Purna</h1>
        <p className="mt-2 text-slate-600">
          Kenali anggota aktif dan purna Paskatema dari setiap angkatan. Masuk sebagai anggota untuk melihat profil lengkap.
        </p>

        {!isLoading && !isError && members.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama..."
                  className="w-full rounded-full border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <button onClick={() => setStatus(null)} className={chipClass(status === null)}>Semua status</button>
              <button onClick={() => setStatus("AKTIF")} className={chipClass(status === "AKTIF")}>Aktif</button>
              <button onClick={() => setStatus("PURNA")} className={chipClass(status === "PURNA")}>Purna</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setAngkatan(null)} className={chipClass(angkatan === null)}>
                Semua Angkatan
              </button>
              {angkatanNumbers.map((n) => (
                <button key={n} onClick={() => setAngkatan(n)} className={chipClass(angkatan === n)}>
                  Angkatan {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && <p className="mt-10 text-center text-sm text-slate-400">Memuat data anggota...</p>}
        {!isLoading && isError && (
          <p className="mt-10 text-center text-sm text-rose-500">Gagal memuat data anggota. Coba muat ulang halaman.</p>
        )}
        {!isLoading && !isError && members.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-400">Belum ada data anggota yang ditampilkan.</p>
        )}
        {members.length > 0 && filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-400">Tidak ada anggota yang cocok dengan filter.</p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/anggota/${m.id}`}
              className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {m.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-2xl font-semibold text-rose-600">{m.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-rose-600">{m.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Angkatan {m.angkatan}
                {m.position ? ` — ${m.position}` : ""}
              </p>
              <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${MEMBER_STATUS_CLASS[m.memberStatus]}`}>
                {MEMBER_STATUS_LABEL[m.memberStatus]}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
