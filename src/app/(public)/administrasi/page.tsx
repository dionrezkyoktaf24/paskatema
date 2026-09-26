"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark, Download, FileText } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Footer } from "@/components/footer/Footer";
import type { MediaItem } from "@/services/media";

interface EbookItem {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  file: MediaItem;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdministrasiPage() {
  const ebooks = useQuery({
    queryKey: ["public-ebooks"],
    queryFn: async () => (await apiClient.get<EbookItem[]>("/ebook")).data,
  });

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 px-6 py-10 shadow-sm sm:px-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 text-center">
            <div className="inline-flex items-center justify-center self-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-rose-600/20">
              PUSAT ADMINISTRASI
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">Dokumen &amp; Materi Anggota</p>
              <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600">
                Materi pelatihan, peraturan, dan dokumen resmi Paskatema dalam satu tempat. Kedisiplinan bermula dari administrasi yang rapi.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">
            <Bookmark size={18} className="text-rose-600" />
            Materi &amp; Dokumen
          </div>

          {ebooks.isLoading && <p className="py-10 text-center text-sm text-slate-400">Memuat dokumen...</p>}
          {ebooks.isError && (
            <p className="py-10 text-center text-sm text-rose-600">Gagal memuat dokumen. Coba muat ulang halaman.</p>
          )}
          {ebooks.isSuccess && ebooks.data.length === 0 && (
            <p className="rounded-[24px] border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
              Belum ada dokumen yang diunggah.
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ebooks.data?.map((ebook) => (
              <article key={ebook.id} className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-950">{ebook.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      PDF · {formatSize(ebook.file.size)} ·{" "}
                      {new Date(ebook.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {ebook.description && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{ebook.description}</p>
                )}
                <div className="mt-auto pt-6">
                  <a
                    href={ebook.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
                  >
                    <Download size={15} />
                    Baca / Unduh
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
