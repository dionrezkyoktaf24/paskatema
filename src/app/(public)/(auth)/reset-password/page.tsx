"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { AuthCard, authInputClass } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const { user, logout } = useAuth();
  // null = belum dibaca dari URL; "" = tidak ada token.
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- token dibaca dari URL di client
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const reset = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<{ message: string }>("/auth/reset-password", {
          token,
          newPassword: password,
          confirmNewPassword: confirm,
        })
      ).data,
    onSuccess: () => {
      // Semua sesi lama sudah tidak berlaku; bersihkan sesi di browser ini juga.
      if (user) logout();
    },
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengganti password.")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    reset.mutate();
  }

  const invalidLink = token !== null && !/^[a-f0-9]{64}$/.test(token);

  return (
    <AuthCard title="Buat password baru" subtitle="Masukkan password baru untuk akun Paskatema Anda.">
      {reset.isSuccess ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
          <p className="text-sm text-slate-700">{reset.data.message}</p>
          <Link
            href="/login"
            className="inline-block rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
          >
            Masuk
          </Link>
        </div>
      ) : invalidLink ? (
        <div className="space-y-4 text-center text-sm text-slate-600">
          <p>Link tidak lengkap atau tidak valid.</p>
          <Link href="/lupa-password" className="font-semibold text-rose-600 hover:underline">
            Minta link baru
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Password baru</span>
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
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Ulangi password baru</span>
            <PasswordInput
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={authInputClass}
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}{" "}
              {error.includes("kedaluwarsa") && (
                <Link href="/lupa-password" className="font-semibold underline">
                  Minta link baru
                </Link>
              )}
            </p>
          )}
          <button
            type="submit"
            disabled={reset.isPending || token === null}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
          >
            {reset.isPending && <Loader2 size={16} className="animate-spin" />}
            Simpan password
          </button>
        </form>
      )}
    </AuthCard>
  );
}
