import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto Paskatema SMK Telkom Malang dari setiap angkatan.",
  alternates: { canonical: "/galeri" },
};

export default function GaleriLayout({ children }: { children: React.ReactNode }) {
  return children;
}
