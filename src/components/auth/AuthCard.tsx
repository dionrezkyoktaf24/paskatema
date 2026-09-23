import type { ReactNode } from "react";

export const authInputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
          Paskatema
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </main>
  );
}
