"use client";

import { lastPurnaAngkatan, useActiveAngkatan } from "@/services/settings";

/**
 * Isian angkatan untuk pengajuan keanggotaan. Anggota aktif memilih dari
 * angkatan aktif (dropdown); purna mengetik angkatan di bawah angkatan aktif.
 * Backend memvalidasi aturan yang sama.
 */
export function AngkatanField({
  status,
  value,
  onChange,
  className,
}: {
  status: "AKTIF" | "PURNA";
  value: string;
  onChange: (value: string) => void;
  className: string;
}) {
  const { data: active } = useActiveAngkatan();
  const maxPurna = lastPurnaAngkatan(active);

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">Angkatan</span>
      {status === "AKTIF" && active && active.length > 0 ? (
        <select required value={value} onChange={(e) => onChange(e.target.value)} className={className}>
          <option value="">Pilih angkatan</option>
          {active.map((n) => (
            <option key={n} value={n}>
              Angkatan {n}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          required
          min={1}
          max={status === "PURNA" && maxPurna ? maxPurna : 999}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={status === "PURNA" ? `mis. ${maxPurna ?? 25}` : "mis. 34"}
          className={className}
        />
      )}
      {status === "PURNA" && maxPurna && (
        <span className="block text-xs text-slate-400">Purna: angkatan {maxPurna} ke bawah.</span>
      )}
    </label>
  );
}
