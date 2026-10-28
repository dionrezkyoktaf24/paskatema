import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchandise",
  description: "Merchandise resmi Paskatema SMK Telkom Malang.",
  alternates: { canonical: "/merchandise" },
};

export default function MerchandiseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
