import { apiClient } from "@/lib/api";

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<MediaItem>(
    "/media/upload-document",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
}
