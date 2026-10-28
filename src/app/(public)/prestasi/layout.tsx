import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prestasi",
  description: "Prestasi dan riwayat lomba Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/prestasi" },
};

export default function PrestasiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
