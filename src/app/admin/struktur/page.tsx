"use client";

import { useState } from "react";

import { PeriodeTab } from "./PeriodeTab";
import { JabatanTab } from "./JabatanTab";
import { StrukturTab } from "./StrukturTab";
import { AnggotaTab } from "./AnggotaTab";

const tabs = [
  { key: "periode", label: "Periode" },
  { key: "jabatan", label: "Jabatan" },
  { key: "struktur", label: "Struktur" },
  { key: "anggota", label: "Anggota" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function AdminStrukturPage() {
  const [active, setActive] = useState<TabKey>("periode");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Struktur &amp; Periode</h1>
        <p className="text-sm text-slate-500">
          Kelola periode kepengurusan, jabatan, penempatan anggota, dan angkatan.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              active === tab.key
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "periode" && <PeriodeTab />}
      {active === "jabatan" && <JabatanTab />}
      {active === "struktur" && <StrukturTab />}
      {active === "anggota" && <AnggotaTab />}
    </div>
  );
}
