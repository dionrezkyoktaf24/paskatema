import { apiClient } from "@/lib/api";

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

/** Batas ukuran sama dengan backend (multer config). */
export const IMAGE_MAX_MB = 5;
export const VIDEO_MAX_MB = 100;

/** Endpoint per jenis file: PDF (E-Book), video, atau gambar. */
export async function uploadMedia(file: File): Promise<MediaItem> {
  const isVideo = file.type.startsWith("video/");
  const maxMb = isVideo ? VIDEO_MAX_MB : IMAGE_MAX_MB;
  if (file.type !== "application/pdf" && file.size > maxMb * 1024 * 1024) {
    throw new Error(`Ukuran ${isVideo ? "video" : "foto"} maksimal ${maxMb} MB.`);
  }

  const formData = new FormData();
  formData.append("file", file);

  const endpoint =
    file.type === "application/pdf"
      ? "/media/upload-document"
      : isVideo
        ? "/media/upload-video"
        : "/media/upload";

  const response = await apiClient.post<MediaItem>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
