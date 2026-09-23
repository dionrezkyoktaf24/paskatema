import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/globals.css";
import { Providers } from "@/components/layout/Providers";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Paskatema",
  alternateName: "Pasukan Khusus Telkom Malang",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  parentOrganization: { "@type": "EducationalOrganization", name: "SMK Telkom Malang" },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Paskatema — Pasukan Khusus Telkom Malang",
    template: "%s | Paskatema",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Paskatema",
    "Paskibra",
    "SMK Telkom Malang",
    "Pasukan Khusus Telkom Malang",
    "ekstrakurikuler SMK Telkom Malang",
  ],
  applicationName: "Paskatema",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Paskatema",
    title: "Paskatema — Pasukan Khusus Telkom Malang",
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo.png", alt: "Logo Paskatema" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paskatema — Pasukan Khusus Telkom Malang",
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
