import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donasi & Pembayaran",
  description: "Donasi dan pembayaran untuk Paskatema SMK Telkom Malang melalui QRIS.",
  alternates: { canonical: "/qris" },
};

export default function QrisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
