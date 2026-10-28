"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark, Download, FileText, ShieldCheck } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Footer } from "@/components/footer/Footer";
import type { MediaItem } from "@/services/media";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/services/documents";

interface EbookItem {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  category: DocumentCategory;
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
  const adArt = (ebooks.data ?? []).filter((e) => e.category === "AD_ART");

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

        {ebooks.isLoading && <p className="py-10 text-center text-sm text-slate-400">Memuat dokumen...</p>}
        {ebooks.isError && (
          <p className="py-10 text-center text-sm text-rose-600">Gagal memuat dokumen. Coba muat ulang halaman.</p>
        )}

        {ebooks.isSuccess && (
          <section id="ad-art" className="mt-10 rounded-[28px] border-2 border-rose-200 bg-rose-50/50 p-6 sm:p-8">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-rose-700">
              <ShieldCheck size={18} />
              AD/ART Paskatema
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Anggaran Dasar dan Anggaran Rumah Tangga: aturan dasar organisasi yang wajib dipahami setiap anggota.
            </p>
            {adArt.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-white p-6 text-center text-sm text-slate-500">
                Dokumen AD/ART belum diunggah.
              </p>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {adArt.map((ebook) => (
                  <DocumentCard key={ebook.id} ebook={ebook} highlight />
                ))}
              </div>
            )}
          </section>
        )}

        {DOCUMENT_CATEGORIES.filter((c) => c.value !== "AD_ART").map((category) => {
          const items = (ebooks.data ?? []).filter((e) => e.category === category.value);
          if (items.length === 0) return null;
          return (
            <section key={category.value} className="mt-10 space-y-6">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">
                <Bookmark size={18} className="text-rose-600" />
                {category.label}
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((ebook) => (
                  <DocumentCard key={ebook.id} ebook={ebook} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <Footer />
    </main>
  );
}

function DocumentCard({ ebook, highlight = false }: { ebook: EbookItem; highlight?: boolean }) {
  return (
    <article className={`flex flex-col rounded-[28px] border bg-white p-6 shadow-sm ${highlight ? "border-rose-200" : "border-slate-200"}`}>
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
      {ebook.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{ebook.description}</p>}
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
  );
}
