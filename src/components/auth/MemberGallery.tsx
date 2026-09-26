"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { apiClient } from "@/lib/api";
import { IMAGE_MAX_MB, VIDEO_MAX_MB, uploadMedia } from "@/services/media";
import { apiErrorMessage } from "@/lib/api-error";
import { MediaThumb } from "@/components/ui/MediaView";
import type { GalleryPhoto } from "@/services/gallery";
import { authInputClass } from "@/components/auth/AuthCard";

/**
 * Anggota menambah/menghapus foto galeri untuk angkatannya sendiri. Angkatan
 * diisi admin; tanpa itu form dinonaktifkan (backend juga menolak).
 */
const FORMAT_HINT = `Foto JPG/PNG/WEBP maks ${IMAGE_MAX_MB} MB, video MP4/WEBM/MOV maks ${VIDEO_MAX_MB} MB.`;

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
      setMessage({ type: "ok", text: `${uploaded} file berhasil ditambahkan.` });
    } catch (err) {
      const reason = apiErrorMessage(err, FORMAT_HINT);
      setMessage({
        type: "error",
        text: uploaded > 0 ? `${uploaded} file berhasil, sisanya gagal: ${reason}` : `Gagal menambahkan: ${reason}`,
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
        <h2 className="text-lg font-semibold text-slate-950">Foto &amp; Video Galeri Angkatan</h2>
        <p className="mt-1 text-sm text-slate-500">
          {canUpload
            ? `Foto dan video yang Anda tambahkan tampil di galeri publik pada Angkatan ${angkatan}. ${FORMAT_HINT}`
            : "Angkatan Anda belum diisi admin, jadi belum bisa menambah foto atau video. Hubungi pengurus untuk verifikasi."}
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Keterangan <span className="text-slate-400">(opsional, untuk semua file yang dipilih)</span>
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
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
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
        {isUploading ? "Mengunggah..." : "Pilih & Unggah Foto/Video"}
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
              <MediaThumb media={photo.image} alt={photo.caption ?? "Galeri"} />
              <button
                type="button"
                aria-label="Hapus"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Hapus dari galeri?")) remove.mutate(photo.id);
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
