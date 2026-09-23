export interface GalleryPhoto {
  id: string;
  angkatan: number;
  caption: string | null;
  createdAt: string;
  image: { id: string; url: string; fileName: string; mimeType: string };
  uploader: { id: string; name: string } | null;
}

export interface GalleryAngkatan {
  angkatan: number;
  count: number;
}
