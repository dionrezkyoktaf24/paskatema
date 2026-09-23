import type { Metadata } from "next";

// Halaman akun tidak untuk di-index mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
