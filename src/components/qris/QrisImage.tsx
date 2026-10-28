"use client";

import { useEffect, useState } from "react";

/** Gambar QR dari teks payload (dibuat di browser). */
export function QrisImage({ payload, size = 280, alt }: { payload: string; size?: number; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(payload, { width: size * 2, margin: 2, errorCorrectionLevel: "M" }).then((url) => {
        if (!cancelled) setSrc(url);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={size} height={size} className="rounded-2xl" style={{ width: size, height: size }} />
  ) : (
    <div className="animate-pulse rounded-2xl bg-slate-100" style={{ width: size, height: size }} aria-hidden />
  );
}

/** Unduh QR sebagai PNG. */
export async function downloadQris(payload: string, fileName: string) {
  const { default: QRCode } = await import("qrcode");
  const url = await QRCode.toDataURL(payload, { width: 1024, margin: 4, errorCorrectionLevel: "M" });
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}
