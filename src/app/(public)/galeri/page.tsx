"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { apiClient } from "@/lib/api";
import type { GalleryAngkatan, GalleryPhoto } from "@/services/gallery";
import { Footer } from "@/components/footer/Footer";
import { MediaFull, MediaThumb } from "@/components/ui/MediaView";

export default function GaleriPage() {
  // null = semua angkatan
  const [angkatan, setAngkatan] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const angkatanList = useQuery({
    queryKey: ["gallery-angkatan"],
    queryFn: async () =>
      (await apiClient.get<GalleryAngkatan[]>("/gallery/angkatan")).data,
  });

  const photos = useQuery({
    queryKey: ["gallery", angkatan],
    queryFn: async () =>
      (
        await apiClient.get<GalleryPhoto[]>("/gallery", {
          params: { angkatan: angkatan ?? undefined },
        })
      ).data,
  });

  const items = photos.data ?? [];
  const total = angkatanList.data?.reduce((sum, a) => sum + a.count, 0) ?? 0;
  const current = lightbox != null ? items[lightbox] : undefined;

  useEffect(() => {
    if (lightbox == null) return;
    const count = items.length;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((i) => (i == null ? i : (i - 1 + count) % count));
      if (e.key === "ArrowRight") setLightbox((i) => (i == null ? i : (i + 1) % count));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, items.length]);

  const chipClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active
        ? "border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-600/20"
        : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-600"
    }`;

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
          Galeri
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Foto &amp; Video Kegiatan Paskatema
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
          Dokumentasi dari setiap angkatan, ditambahkan langsung oleh anggota.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAngkatan(null)}
            className={chipClass(angkatan == null)}
          >
            Semua{total ? ` (${total})` : ""}
          </button>
          {angkatanList.data?.map((item) => (
            <button
              key={item.angkatan}
              type="button"
              onClick={() => setAngkatan(item.angkatan)}
              className={chipClass(angkatan === item.angkatan)}
            >
              Angkatan {item.angkatan} ({item.count})
            </button>
          ))}
        </div>

        {photos.isLoading && (
          <p className="mt-12 text-center text-sm text-slate-400">Memuat galeri...</p>
        )}
        {photos.isError && (
          <p className="mt-12 text-center text-sm text-rose-600">
            Gagal memuat galeri. Coba muat ulang halaman.
          </p>
        )}
        {photos.isSuccess && items.length === 0 && (
          <p className="mt-12 text-center text-sm text-slate-400">
            Belum ada foto atau video untuk ditampilkan.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 text-left"
            >
              <MediaThumb
                media={photo.image}
                alt={photo.caption ?? `Galeri angkatan ${photo.angkatan}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white">
                Angkatan {photo.angkatan}
                {photo.caption ? ` · ${photo.caption}` : ""}
              </span>
            </button>
          ))}
        </div>
      </section>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-800"
          >
            <X size={20} />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Sebelumnya"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i == null ? i : (i - 1 + items.length) % items.length));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Berikutnya"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i == null ? i : (i + 1) % items.length));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <MediaFull
              key={current.id}
              media={current.image}
              alt={current.caption ?? `Galeri angkatan ${current.angkatan}`}
            />
            <figcaption className="mt-3 text-center text-sm text-white">
              Angkatan {current.angkatan}
              {current.caption ? ` · ${current.caption}` : ""}
              {current.uploader ? ` · oleh ${current.uploader.name}` : ""}
            </figcaption>
          </figure>
        </div>
      )}

      <Footer />
    </main>
  );
}
