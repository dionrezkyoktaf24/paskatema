"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, CircleDot, Loader2, Send } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/footer/Footer";
import { apiErrorMessage } from "@/lib/api-error";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  type FormField,
  type FormSetting,
  type RegistrationItem,
} from "@/services/organisasi";

const inputClass =
  "w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}) {
  const common = { id: `f-${field.key}`, required: field.required, value, className: inputClass };
  if (field.type === "textarea") {
    return <textarea {...common} rows={5} maxLength={5000} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "select") {
    return (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        <option value="">Pilih salah satu</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  return <input {...common} type={field.type} maxLength={field.type === "text" ? 500 : undefined} onChange={(e) => onChange(e.target.value)} />;
}

export default function PendaftaranPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useQuery({
    queryKey: ["form-active"],
    queryFn: async () => (await apiClient.get<FormSetting>("/form-setting/active")).data,
    retry: false,
  });

  const mine = useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => (await apiClient.get<RegistrationItem[]>("/registrations/me")).data,
    enabled: !!user,
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () =>
      (await apiClient.post("/registrations", { formId: form.data!.id, answers })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-registrations"] }),
    onError: (err) => setError(apiErrorMessage(err, "Gagal mengirim pendaftaran.")),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    submit.mutate();
  }

  const notOpen = form.isError && axios.isAxiosError(form.error) && form.error.response?.status === 404;
  const existing = form.data ? mine.data?.find((r) => r.form.id === form.data.id) : undefined;

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden pb-24 pt-8 sm:pb-32">
        <div className="absolute inset-x-0 top-0 h-110 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/image1.jpeg')" }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.18),_transparent_35%)]" />
        </div>
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_30%)]" />

        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          <div className="flex-1 space-y-6 py-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-rose-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-rose-600 shadow-sm shadow-rose-100">
              <CircleDot size={16} /> {form.data ? form.data.title : "Rekrutmen Anggota"}
            </div>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Formulir Pendaftaran</h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Lengkapi data diri Anda dengan benar. Bergabunglah bersama kami untuk menjadi bagian dari PASKATEMA yang penuh disiplin, loyalitas, dan kehormatan.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10">
            {form.isLoading && <p className="py-10 text-center text-sm text-slate-400">Memuat formulir...</p>}

            {notOpen && (
              <div className="py-10 text-center">
                <h2 className="text-2xl font-semibold text-slate-950">Pendaftaran belum dibuka</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                  Saat ini belum ada rekrutmen yang dibuka. Pantau{" "}
                  <Link href="/berita" className="font-semibold text-rose-600 hover:underline">
                    berita
                  </Link>{" "}
                  untuk info pembukaan berikutnya.
                </p>
              </div>
            )}
            {form.isError && !notOpen && (
              <p className="py-10 text-center text-sm text-rose-600">Gagal memuat formulir. Coba muat ulang halaman.</p>
            )}

            {form.data && (
              <>
                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.32em] text-rose-600">Formulir Pendaftaran</p>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{form.data.title}</h2>
                  </div>
                  <div className="hidden rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 lg:block">
                    <p className="font-semibold uppercase tracking-[0.28em] text-slate-900">Cara daftar</p>
                    <p className="mt-4 leading-7">
                      Buat akun atau masuk terlebih dahulu, lalu isi formulir ini. Status pendaftaran bisa dilihat kembali di halaman ini.
                    </p>
                  </div>
                </div>

                {authLoading ? null : !user ? (
                  <div className="mt-10 rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center">
                    <p className="text-base font-semibold text-slate-950">Masuk atau buat akun untuk mendaftar</p>
                    <p className="mt-2 text-sm text-slate-600">Akun dipakai untuk menyimpan pendaftaran dan melihat statusnya.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Link href="/daftar?next=/pendaftaran" className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
                        Buat Akun
                      </Link>
                      <Link href="/login?next=/pendaftaran" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600">
                        Masuk
                      </Link>
                    </div>
                  </div>
                ) : existing || submit.isSuccess ? (
                  <div className="mt-10 rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center">
                    <CheckCircle2 className="mx-auto text-emerald-600" size={32} />
                    <p className="mt-3 text-base font-semibold text-slate-950">Pendaftaran Anda sudah terkirim</p>
                    {existing && (
                      <p className="mt-3 text-sm text-slate-600">
                        Status:{" "}
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[existing.status]}`}>
                          {STATUS_LABEL[existing.status]}
                        </span>
                      </p>
                    )}
                    <p className="mt-3 text-sm text-slate-600">Pengurus akan meninjau pendaftaran Anda. Pantau halaman ini untuk statusnya.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-2">
                    {form.data.schema.map((field) => (
                      <label
                        key={field.key}
                        htmlFor={`f-${field.key}`}
                        className={`space-y-3 ${field.type === "textarea" ? "lg:col-span-2" : ""}`}
                      >
                        <span className="block text-sm font-semibold text-slate-900">
                          {field.label}
                          {field.required && <span className="text-rose-600"> *</span>}
                        </span>
                        <FieldInput
                          field={field}
                          value={answers[field.key] ?? ""}
                          onChange={(value) => setAnswers((prev) => ({ ...prev, [field.key]: value }))}
                        />
                      </label>
                    ))}

                    {error && <p className="text-sm text-rose-600 lg:col-span-2">{error}</p>}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
                      <p className="text-sm leading-6 text-slate-600">Dengan mendaftar, Anda menyetujui komitmen kedisiplinan organisasi.</p>
                      <button
                        type="submit"
                        disabled={submit.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        {submit.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Kirim Pendaftaran
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
