"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, ImageOff } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Modal } from "@/components/admin/Modal";
import type { MediaItem } from "@/services/media";

export function MediaGalleryModal({
  onSelect,
  onClose,
}: {
  onSelect: (media: MediaItem) => void;
  onClose: () => void;
}) {
  const gallery = useQuery({
    queryKey: ["media-gallery"],
    queryFn: async () => (await apiClient.get<MediaItem[]>("/media")).data,
  });

  return (
    <Modal title="Pilih dari Galeri" onClose={onClose}>
      {gallery.isLoading && (
        <p className="py-8 text-center text-sm text-slate-400">Memuat galeri...</p>
      )}

      {gallery.data?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
          <ImageOff size={28} />
          <p className="text-sm">Belum ada file yang pernah diunggah.</p>
        </div>
      )}

      {gallery.data && gallery.data.length > 0 && (
        <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {gallery.data.map((item) => {
            const isImage = item.mimeType.startsWith("image/");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                title={item.fileName}
                className="group flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-rose-400 hover:ring-2 hover:ring-rose-100"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 px-2 text-center">
                    <FileText size={22} className="text-slate-400" />
                    <span className="line-clamp-2 text-[10px] text-slate-500">
                      {item.fileName}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
