"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Images } from "lucide-react";

import { uploadMedia, type MediaItem } from "@/services/media";
import { MediaGalleryModal } from "@/components/admin/MediaGalleryModal";

export function MediaPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MediaItem | null;
  onChange: (media: MediaItem | null) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const media = await uploadMedia(file);
      onChange(media);
    } catch {
      setError("Gagal upload file. Coba lagi.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleGallerySelect(media: MediaItem) {
    onChange(media);
    setIsGalleryOpen(false);
  }

  const isImage = value?.mimeType.startsWith("image/");

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        {value && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.url}
            alt=""
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
          />
        ) : value ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-1 text-center text-[10px] text-slate-500">
            {value.fileName}
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300">
            <ImagePlus size={20} />
          </div>
        )}

        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              {isUploading && <Loader2 size={14} className="animate-spin" />}
              {value ? "Ganti file" : "Upload baru"}
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Images size={14} />
              Pilih dari Galeri
            </button>
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-rose-600 hover:underline"
            >
              Hapus pilihan
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}

      {isGalleryOpen && (
        <MediaGalleryModal
          onSelect={handleGallerySelect}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
}
