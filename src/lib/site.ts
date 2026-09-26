export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paskatema.smktelkom-mlg.sch.id";

export const SITE_DESCRIPTION =
  "Paskatema adalah organisasi ekstrakurikuler SMK Telkom Malang — profil, struktur, divisi, anggota, event, dan pendaftaran.";

// Halaman publik yang di-index. Dipakai sitemap.ts.
export const PUBLIC_ROUTES = [
  "/",
  "/profil",
  "/struktur",
  "/divisi",
  "/berita",
  "/event",
  "/anggota",
  "/galeri",
  "/administrasi",
  "/pendaftaran",
  "/voting",
  "/developer",
] as const;
