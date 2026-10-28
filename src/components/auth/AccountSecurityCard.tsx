"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Mail } from "lucide-react";

import { apiClient } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error";
import { getToken, setAuth } from "@/lib/auth-storage";
import { useAuth } from "@/contexts/AuthContext";
import { authInputClass } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/ui/PasswordInput";

/** Email sekolah dihapus setelah lulus: sarankan ganti ke email pribadi. */
function isSchoolEmail(email: string) {
  return email.toLowerCase().endsWith("smktelkom-mlg.sch.id");
}

export function AccountSecurityCard({ email }: { email: string }) {
  const [open, setOpen] = useState<"email" | "password" | null>(null);

  return (
    <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
      <h2 className="text-lg font-semibold text-slate-950">Keamanan akun</h2>

      {isSchoolEmail(email) && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Anda masih memakai <b>email sekolah</b>. Email sekolah akan dihapus setelah lulus, jadi ganti ke email pribadi
          (mis. Gmail) supaya akun tetap bisa dipakai sebagai purna.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === "email" ? null : "email")}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
        >
          <Mail size={15} />
          Ganti email
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "password" ? null : "password")}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
        >
          <KeyRound size={15} />
          Ganti password
        </button>
      </div>

      {open === "email" && <ChangeEmailForm currentEmail={email} onDone={() => setOpen(null)} />}
      {open === "password" && <ChangePasswordForm onDone={() => setOpen(null)} />}
    </section>
  );
}

function ChangeEmailForm({ currentEmail, onDone }: { currentEmail: string; onDone: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: async () =>
      (await apiClient.patch<{ user: { email: string } }>("/auth/update-email", { email: email.trim(), password })).data,
    onSuccess: (data) => {
      // Email di navbar/menu dibaca dari penyimpanan browser: ikut diperbarui.
      const token = getToken();
      if (token && user) setAuth(token, { ...user, email: data.user.email });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setMessage({ ok: true, text: `Email diganti menjadi ${data.user.email}. Gunakan email ini saat login berikutnya.` });
      setPassword("");
      setTimeout(onDone, 2500);
    },
    onError: (err) => setMessage({ ok: false, text: apiErrorMessage(err, "Gagal mengganti email.") }),
  });

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setMessage(null);
        save.mutate();
      }}
      className="space-y-3 rounded-2xl bg-slate-50 p-4"
    >
      <p className="text-xs text-slate-500">Email sekarang: {currentEmail}</p>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Email baru</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Password saat ini</span>
        <PasswordInput required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} />
      </label>
      {message && (
        <p className={`rounded-xl px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={save.isPending}
        className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
      >
        {save.isPending && <Loader2 size={15} className="animate-spin" />}
        Simpan email
      </button>
    </form>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: async () =>
      (
        await apiClient.patch("/auth/change-password", {
          oldPassword,
          newPassword,
          confirmNewPassword: confirm,
        })
      ).data,
    onSuccess: () => {
      setMessage({ ok: true, text: "Password berhasil diganti." });
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      setTimeout(onDone, 2000);
    },
    onError: (err) => setMessage({ ok: false, text: apiErrorMessage(err, "Gagal mengganti password.") }),
  });

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (newPassword !== confirm) {
          setMessage({ ok: false, text: "Konfirmasi password baru tidak sama." });
          return;
        }
        save.mutate();
      }}
      className="space-y-3 rounded-2xl bg-slate-50 p-4"
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Password saat ini</span>
        <PasswordInput required autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={authInputClass} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Password baru</span>
        <PasswordInput required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={authInputClass} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Ulangi password baru</span>
        <PasswordInput required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={authInputClass} />
      </label>
      {message && (
        <p className={`rounded-xl px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={save.isPending}
        className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
      >
        {save.isPending && <Loader2 size={15} className="animate-spin" />}
        Simpan password
      </button>
    </form>
  );
}
