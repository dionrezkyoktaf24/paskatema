import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Struktur Organisasi",
  description: "Struktur kepengurusan Paskatema SMK Telkom Malang: komandan, pembina, dan jajaran pengurus.",
  alternates: { canonical: "/struktur" },
};

export default function StrukturLayout({ children }: { children: React.ReactNode }) {
  return children;
}
