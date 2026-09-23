"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { AuthCard, authInputClass } from "@/components/auth/AuthCard";

export default function DaftarPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/akun");
    }
  }, [isLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
      router.push("/akun");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Buat Akun"
      subtitle="Akun anggota Paskatema. Data angkatan diisi oleh admin."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-rose-600 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
          />
          <span className="text-xs text-slate-400">Minimal 8 karakter.</span>
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
          {isSubmitting ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </AuthCard>
  );
}
