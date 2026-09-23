import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita",
  description: "Kabar dan kegiatan terbaru Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/berita" },
};

export default function BeritaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
