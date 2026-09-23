"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { uploadMedia } from "@/services/media";
import type { GalleryPhoto } from "@/services/gallery";
import { authInputClass } from "@/components/auth/AuthCard";

/**
 * Anggota menambah/menghapus foto galeri untuk angkatannya sendiri. Angkatan
 * diisi admin; tanpa itu form dinonaktifkan (backend juga menolak).
 */
export function MemberGallery({ angkatan }: { angkatan: number | null }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const mine = useQuery({
    queryKey: ["gallery-mine"],
    queryFn: async () => (await apiClient.get<GalleryPhoto[]>("/gallery/mine")).data,
  });

  function refreshGallery() {
    queryClient.invalidateQueries({ queryKey: ["gallery-mine"] });
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
    queryClient.invalidateQueries({ queryKey: ["gallery-angkatan"] });
  }

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/gallery/${id}`);
    },
    onSuccess: refreshGallery,
  });

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    setMessage(null);
    let uploaded = 0;
    try {
      for (const file of files) {
        const media = await uploadMedia(file);
        await apiClient.post("/gallery", {
          imageId: media.id,
          caption: caption.trim() || undefined,
        });
        uploaded += 1;
      }
      setCaption("");
      setMessage({ type: "ok", text: `${uploaded} foto berhasil ditambahkan.` });
    } catch {
      setMessage({
        type: "error",
        text:
          uploaded > 0
            ? `${uploaded} foto berhasil, sisanya gagal. Format JPG/PNG/WEBP, maks 5MB.`
            : "Gagal menambahkan foto. Format JPG/PNG/WEBP, maks 5MB.",
      });
    } finally {
      setIsUploading(false);
      refreshGallery();
    }
  }

  const canUpload = angkatan != null;

  return (
    <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Foto Galeri Angkatan</h2>
        <p className="mt-1 text-sm text-slate-500">
          {canUpload
            ? `Foto yang Anda tambahkan tampil di galeri publik pada Angkatan ${angkatan}.`
            : "Angkatan Anda belum diisi admin, jadi belum bisa menambah foto. Hubungi pengurus untuk verifikasi."}
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Keterangan <span className="text-slate-400">(opsional, untuk semua foto yang dipilih)</span>
        </span>
        <input
          value={caption}
          maxLength={300}
          disabled={!canUpload || isUploading}
          onChange={(e) => setCaption(e.target.value)}
          className={authInputClass}
        />
      </label>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={handleFiles}
      />
      <button
        type="button"
        disabled={!canUpload || isUploading}
        onClick={() => fileInput.current?.click()}
        className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        {isUploading ? "Mengunggah..." : "Pilih & Unggah Foto"}
      </button>

      {message && (
        <p
          role={message.type === "error" ? "alert" : undefined}
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
          }`}
        >
          {message.text}
        </p>
      )}

      {mine.data && mine.data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {mine.data.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image.url}
                alt={photo.caption ?? "Foto galeri"}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label="Hapus foto"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Hapus foto ini dari galeri?")) remove.mutate(photo.id);
                }}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-slate-600 shadow transition hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
