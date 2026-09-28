"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { nextPathFromUrl } from "@/lib/roles";
import { AuthCard, authInputClass } from "@/components/auth/AuthCard";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function DaftarPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();
  const [nextQuery, setNextQuery] = useState("");
  // Calon anggota baru vs purna (alumni). ?as=purna memilih purna dari awal.
  const [asPurna, setAsPurna] = useState(false);
  const [claimAngkatan, setClaimAngkatan] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [claimNote, setClaimNote] = useState("");

  useEffect(() => {
    const next = nextPathFromUrl();
    /* eslint-disable react-hooks/set-state-in-effect -- baca URL hanya di client */
    if (next) setNextQuery(`?next=${encodeURIComponent(next)}`);
    if (new URLSearchParams(window.location.search).get("as") === "purna") setAsPurna(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sudah login: tampilkan pilihan lanjut / ganti akun, bukan dialihkan.
  const [justSignedIn, setJustSignedIn] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      setJustSignedIn(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        ...(asPurna && {
          purna: {
            angkatan: Number(claimAngkatan),
            graduationYear: graduationYear ? Number(graduationYear) : undefined,
            note: claimNote.trim() || undefined,
          },
        }),
      });
      router.push(nextPathFromUrl() ?? "/akun");
    } catch (err) {
      setJustSignedIn(false);
      setError(err instanceof Error ? err.message : "Gagal mendaftar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Buat Akun"
      subtitle={
        asPurna
          ? "Untuk purna (alumni) Paskatema. Admin akan memverifikasi angkatan Anda."
          : "Akun anggota Paskatema. Data angkatan diisi oleh admin."
      }
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href={`/login${nextQuery}`} className="font-semibold text-rose-600 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      {!isLoading && user && !justSignedIn ? (
        <AlreadySignedIn />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold" role="radiogroup" aria-label="Jenis pendaftar">
            {[
              { value: false, label: "Calon / anggota aktif" },
              { value: true, label: "Purna (alumni)" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={asPurna === option.value}
                onClick={() => setAsPurna(option.value)}
                className={`rounded-xl px-3 py-2 transition ${
                  asPurna === option.value ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Nama lengkap</span>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={authInputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              No. telepon <span className="text-slate-400">(opsional)</span>
            </span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={authInputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <PasswordInput
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
            <span className="text-xs text-slate-400">Minimal 8 karakter.</span>
          </label>

          {asPurna && (
            <div className="space-y-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Angkatan</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={999}
                    value={claimAngkatan}
                    onChange={(e) => setClaimAngkatan(e.target.value)}
                    placeholder="mis. 25"
                    className={authInputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Tahun lulus <span className="text-slate-400">(opsional)</span>
                  </span>
                  <input
                    type="number"
                    min={1980}
                    max={2100}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="mis. 2021"
                    className={authInputClass}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Catatan untuk admin <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  maxLength={300}
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder="mis. jabatan dulu, nama panggilan"
                  className={authInputClass}
                />
              </label>
              <p className="text-xs text-slate-500">
                Setelah diverifikasi admin, Anda tercatat sebagai Purna dan bisa masuk direktori, forum, dan jaringan alumni.
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Daftar"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
