"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MailCheck } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { AuthCard, authInputClass } from "@/components/auth/AuthCard";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => (await apiClient.post<{ message: string }>("/auth/forgot-password", { email: email.trim() })).data,
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengirim. Coba lagi beberapa saat.")),
  });

  return (
    <AuthCard
      title="Lupa password"
      subtitle="Masukkan email akun Anda. Kami kirim link untuk membuat password baru."
      footer={
        <>
          Ingat password?{" "}
          <Link href="/login" className="font-semibold text-rose-600 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      {send.isSuccess ? (
        <div className="space-y-3 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">
          <MailCheck size={22} />
          <p>{send.data.message}</p>
          <p className="text-emerald-700">Link berlaku 1 jam. Tidak menerima email? Coba lagi beberapa menit kemudian.</p>
        </div>
      ) : (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            setError(null);
            send.mutate();
          }}
          className="space-y-4"
        >
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
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={send.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
          >
            {send.isPending && <Loader2 size={16} className="animate-spin" />}
            Kirim link
          </button>
          <p className="text-xs text-slate-400">
            Email akun sudah tidak aktif (mis. email sekolah yang dihapus)? Hubungi admin Paskatema.
          </p>
        </form>
      )}
    </AuthCard>
  );
}
