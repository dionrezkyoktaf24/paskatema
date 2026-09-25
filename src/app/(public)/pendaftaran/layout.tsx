import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendaftaran",
  description: "Informasi dan cara mendaftar menjadi anggota Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/pendaftaran" },
};

export default function PendaftaranLayout({ children }: { children: React.ReactNode }) {
  return children;
}
