"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { homeForRole, nextPathFromUrl } from "@/lib/roles";
import { AuthCard, authInputClass } from "@/components/auth/AuthCard";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [nextQuery, setNextQuery] = useState("");

  useEffect(() => {
    const next = nextPathFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- baca URL hanya di client
    if (next) setNextQuery(`?next=${encodeURIComponent(next)}`);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sudah login (sesi tersimpan di browser, berlaku di semua tab): jangan
  // langsung dialihkan, tampilkan pilihan lanjut / ganti akun.
  const [justSignedIn, setJustSignedIn] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      setJustSignedIn(true);
      const loggedIn = await login(email, password);
      router.push(nextPathFromUrl() ?? homeForRole(loggedIn.role));
    } catch (err) {
      setJustSignedIn(false);
      setError(err instanceof Error ? err.message : "Gagal login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Masuk"
      subtitle="Untuk anggota dan admin Paskatema."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={`/daftar${nextQuery}`} className="font-semibold text-rose-600 hover:underline">
            Buat akun
          </Link>
        </>
      }
    >
      {!isLoading && user && !justSignedIn ? (
        <AlreadySignedIn />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <PasswordInput
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </label>

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
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
