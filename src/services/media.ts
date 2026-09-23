import { apiClient } from "@/lib/api";

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

/** PDF (E-Book) punya endpoint sendiri; gambar lewat /media/upload. */
export async function uploadMedia(file: File): Promise<MediaItem> {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint =
    file.type === "application/pdf" ? "/media/upload-document" : "/media/upload";

  const response = await apiClient.post<MediaItem>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
