import type { Metadata } from "next";
import { ArrowRight, CircleDot, Send } from "lucide-react";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Pendaftaran",
  description: "Informasi dan cara mendaftar menjadi anggota Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/pendaftaran" },
};

export default function PendaftaranPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden pb-24 pt-8 sm:pb-32">
        <div className="absolute inset-x-0 top-0 h-110 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/image1.jpeg')" }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.18),_transparent_35%)]" />
        </div>
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_30%)]" />

        <div className="mx-auto relative z-10 flex max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          <div className="flex-1 space-y-6 py-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-rose-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-rose-600 shadow-sm shadow-rose-100">
              <CircleDot size={16} /> Rekrutmen Angkatan 2024
            </div>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Formulir Pendaftaran
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Lengkapi data diri Anda dengan benar. Bergabunglah bersama kami untuk menjadi bagian dari PASKATEMA yang penuh disiplin, loyalitas, dan kehormatan.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="absolute right-6 top-6 hidden h-36 w-36 rounded-full bg-rose-100/80 blur-3xl lg:block" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-rose-600">Formulir Pendaftaran</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Lengkapi data diri Anda dengan benar.</h2>
              </div>
              <div className="hidden rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 lg:block">
                <p className="font-semibold uppercase tracking-[0.28em] text-slate-900">01</p>
                <p className="mt-4 leading-7">
                  Pastikan semua informasi sesuai data resmi sekolah. Info lengkap membantu kami memproses pendaftaran Anda lebih cepat.
                </p>
              </div>
            </div>

            <form className="mt-10 grid gap-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-3">
                  <span className="text-sm font-semibold text-slate-900">Nama Lengkap</span>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </label>

                <label className="space-y-3">
                  <span className="text-sm font-semibold text-slate-900">Nomor Induk Siswa (NIS)</span>
                  <input
                    type="text"
                    placeholder="Contoh: 123456"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-3">
                  <span className="text-sm font-semibold text-slate-900">Kelas</span>
                  <select className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100">
                    <option>Pilih kelas Anda</option>
                    <option>X RPL 1</option>
                    <option>X RPL 2</option>
                    <option>X RPL 3</option>
                    <option>X RPL 5</option>
                    <option>X RPL 6</option>
                    <option>X TKJ 1</option>
                    <option>X TKJ 2</option>
                    <option>X TKJ 3</option>
                    <option>X PG 1</option>
                    <option>X PG 2</option>
                    <option>X ICP RPL</option>
                    <option>X ICP TKJ</option>
                    <option>X ICP PG</option>
                  </select>
                </label>

                <label className="space-y-3">
                  <span className="text-sm font-semibold text-slate-900">No. WhatsApp</span>
                  <input
                    type="tel"
                    placeholder="+62 81234567890"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </label>
              </div>

              <label className="space-y-3">
                <span className="text-sm font-semibold text-slate-900">Alasan Bergabung PASKATEMA</span>
                <textarea
                  rows={5}
                  placeholder="Ceritakan motivasi Anda secara singkat..."
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-600">
                  Dengan mendaftar, Anda menyetujui komitmen kedisiplinan organisasi.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
                >
                  Kirim Pendaftaran
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
