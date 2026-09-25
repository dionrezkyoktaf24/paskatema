"use client";

import { useState } from "react";

import { PendaftarTab } from "./PendaftarTab";
import { FormulirTab } from "./FormulirTab";

const tabs = [
  { key: "pendaftar", label: "Pendaftar" },
  { key: "formulir", label: "Formulir" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function AdminPendaftaranPage() {
  const [active, setActive] = useState<TabKey>("pendaftar");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Pendaftaran</h1>
        <p className="text-sm text-slate-500">
          Tinjau pendaftar dan atur formulir pendaftaran yang tampil di halaman publik.
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

      {active === "pendaftar" && <PendaftarTab />}
      {active === "formulir" && <FormulirTab />}
    </div>
  );
}
