"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { nextPathFromUrl } from "@/lib/roles";
import { AuthCard, authInputClass } from "@/components/auth/AuthCard";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AngkatanField } from "@/components/auth/AngkatanField";

type RegisterKind = "calon" | "aktif" | "purna";

const KIND_OPTIONS: { value: RegisterKind; label: string }[] = [
  { value: "calon", label: "Calon anggota baru" },
  { value: "aktif", label: "Anggota aktif" },
  { value: "purna", label: "Purna (alumni)" },
];

const KIND_SUBTITLE: Record<RegisterKind, string> = {
  calon: "Buat akun untuk mengikuti rekrutmen anggota baru Paskatema.",
  aktif: "Untuk anggota Paskatema saat ini. Admin akan memverifikasi angkatan Anda.",
  purna: "Untuk purna (alumni) Paskatema. Admin akan memverifikasi angkatan Anda.",
};

export default function DaftarPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();
  const [nextQuery, setNextQuery] = useState("");
  // Jenis pendaftar. ?as=aktif / ?as=purna / ?as=calon memilih dari awal.
  const [kind, setKind] = useState<RegisterKind>("calon");
  const isMember = kind !== "calon";
  const [claimAngkatan, setClaimAngkatan] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [claimNote, setClaimNote] = useState("");

  useEffect(() => {
    const next = nextPathFromUrl();
    /* eslint-disable react-hooks/set-state-in-effect -- baca URL hanya di client */
    if (next) setNextQuery(`?next=${encodeURIComponent(next)}`);
    const as = new URLSearchParams(window.location.search).get("as");
    if (as === "aktif" || as === "purna" || as === "calon") setKind(as);
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
        ...(isMember && {
          membership: {
            status: kind === "purna" ? "PURNA" : "AKTIF",
            angkatan: Number(claimAngkatan),
            graduationYear: kind === "purna" && graduationYear ? Number(graduationYear) : undefined,
            note: claimNote.trim() || undefined,
          },
        }),
      });
      // Calon anggota langsung ke formulir rekrutmen.
      router.push(nextPathFromUrl() ?? (kind === "calon" ? "/pendaftaran" : "/akun"));
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
      subtitle={KIND_SUBTITLE[kind]}
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
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-semibold sm:text-sm" role="radiogroup" aria-label="Jenis pendaftar">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={kind === option.value}
                onClick={() => setKind(option.value)}
                className={`rounded-xl px-2 py-2 leading-tight transition ${
                  kind === option.value ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
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

          {kind === "calon" && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              Setelah akun dibuat, Anda diarahkan ke formulir pendaftaran anggota baru (bila rekrutmen sedang dibuka).
            </p>
          )}

          {isMember && (
            <div className="space-y-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
              <div className={`grid gap-3 ${kind === "purna" ? "grid-cols-2" : "grid-cols-1"}`}>
                <AngkatanField
                  status={kind === "purna" ? "PURNA" : "AKTIF"}
                  value={claimAngkatan}
                  onChange={setClaimAngkatan}
                  className={authInputClass}
                />
                {kind === "purna" && (
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
                )}
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Catatan untuk admin <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  maxLength={300}
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder={kind === "purna" ? "mis. jabatan dulu, nama panggilan" : "mis. jabatan saat ini, nama panggilan"}
                  className={authInputClass}
                />
              </label>
              <p className="text-xs text-slate-500">
                Setelah diverifikasi admin, Anda tercatat sebagai {kind === "purna" ? "Purna" : "anggota Aktif"} dan bisa
                memakai forum, galeri angkatan, direktori, dan pemilihan.
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
