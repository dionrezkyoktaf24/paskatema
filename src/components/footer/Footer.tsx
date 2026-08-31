import { footerLinks, contactInfo } from "@/lib/constants";
import Link from "next/link";
import { LogoBadge } from "@/components/ui/LogoBadge";

export function Footer() {
  return (
    <footer className="bg-white px-6 py-14 text-slate-700 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="space-y-4">
          <LogoBadge size={40} />
          <p className="max-w-md text-sm leading-7 text-slate-600">{contactInfo.headline} Kedisiplinan, Loyalitas, dan Kehormatan adalah nafas kami.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-900">Tautan Cepat</h3>
          <div className="mt-6 flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-slate-600 transition hover:text-rose-600">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-900">Kontak</h3>
          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-600">{contactInfo.address}</p>
        </div>
      </div>
      <div className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-500">
        © 2024 PASKATEMA. All Rights Reserved.
      </div>
    </footer>
  );
}
