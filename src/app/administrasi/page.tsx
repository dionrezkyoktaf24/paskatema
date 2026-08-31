import Image from "next/image";
import { ArrowRight, Bookmark, ShieldCheck, FileText } from "lucide-react";
import { Footer } from "@/components/footer/Footer";

export default function AdministrasiPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 px-6 py-10 shadow-sm sm:px-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-rose-600/20">
              PUSAT ADMINISTRASI
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">Dokumen & Layanan Anggota</p>
              <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600">
                Akses materi pelatihan, pantau keuangan, dan ajukan perizinan dalam satu portal terintegrasi. Kedisiplinan bermula dari administrasi yang rapi.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">
              <Bookmark size={18} className="text-rose-600" />
              Materi Diklat
            </div>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700">
              Lihat Semua
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="relative h-[320px]">
                <Image src="/image1.jpeg" alt="Modul Utama" fill className="object-cover" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Modu Utama
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    EDISI 2024
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Modul Utama</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Buku Saku Praktis Gelombang I. Panduan komprehensif berisi tata tertib dasar, sejarah organisasi, pengenalan baris-berbaris (PBB) dasar, dan lagu wajib untuk anggota baru Paskatema.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">PDF</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">46 Mnt Baca</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">12k Unduhan</span>
                </div>
                <button className="mt-8 inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
                  Baca Sekarang
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-rose-600">
                    <FileText size={18} />
                  </span>
                  Protokoler Upacara
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Tata cara formasi dan manajemen lapangan saat pengibaran bendera.
                </p>
                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700">
                  Akses Dokumen
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 shadow-sm text-white">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-white">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-600 text-white">
                    <ShieldCheck size={18} />
                  </span>
                  Kode Etik Anggota
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  Aturan kedisiplinan bagi seluruh tingkat kepengurusan.
                </p>
                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-rose-200">
                  Akses Dokumen
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 font-semibold text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white">
                <Bookmark size={18} />
              </span>
              <div className="text-sm uppercase tracking-[0.28em]">Kas & Tabungan</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-rose-600 bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20">
                Kas & Tabungan
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
                Formulir Perizinan
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-slate-200 bg-gradient-to-b from-rose-50 to-white p-8 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">Total Saldo Kas Anda</div>
              <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">Rp 125.000</p>
              <p className="mt-3 text-sm text-slate-600">Status: Aman (Lunas s/d Bulan Ini)</p>
              <div className="mt-8 grid gap-3 rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <span>Iuran Bulanan</span>
                  <span className="font-semibold">Rp 15.000/bln</span>
                </div>
              </div>
              <button className="mt-8 inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
                Bayar via QRIS
              </button>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-900">Riwayat Pembayaran</p>
                  <p className="mt-2 text-sm text-slate-600">Tahun Ajaran 2023/2024</p>
                </div>
                <select className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-rose-600">
                  <option>Tahun Ajaran 2023/2024</option>
                </select>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Bulan</th>
                      <th className="px-5 py-4">Tanggal Bayar</th>
                      <th className="px-5 py-4">Nominal</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200 bg-white">
                      <td className="px-5 py-4">Agustus 2023</td>
                      <td className="px-5 py-4">05 Agu 2023</td>
                      <td className="px-5 py-4">Rp 15.000</td>
                      <td className="px-5 py-4 text-emerald-600">Lunas</td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td className="px-5 py-4">September 2023</td>
                      <td className="px-5 py-4">10 Sep 2023</td>
                      <td className="px-5 py-4">Rp 15.000</td>
                      <td className="px-5 py-4 text-emerald-600">Lunas</td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-white">
                      <td className="px-5 py-4">Oktober 2023</td>
                      <td className="px-5 py-4">05 Okt 2023</td>
                      <td className="px-5 py-4">Rp 15.000</td>
                      <td className="px-5 py-4 text-amber-600">Menunggu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
