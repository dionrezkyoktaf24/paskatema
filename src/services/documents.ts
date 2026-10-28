export type DocumentCategory = "AD_ART" | "PERATURAN" | "MATERI" | "LAINNYA";

/** Urutan tampil di /administrasi: AD/ART paling atas. */
export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "AD_ART", label: "AD/ART" },
  { value: "PERATURAN", label: "Peraturan & Kode Etik" },
  { value: "MATERI", label: "Materi Diklat" },
  { value: "LAINNYA", label: "Dokumen Lainnya" },
];

export const DOCUMENT_CATEGORY_LABEL = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<DocumentCategory, string>;
