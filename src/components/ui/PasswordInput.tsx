"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Input password dengan tombol mata untuk menampilkan/menyembunyikan isinya.
 * `tone="dark"` untuk form berlatar gelap (login admin).
 */
export function PasswordInput({
  className = "",
  tone = "light",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { tone?: "light" | "dark" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition ${
          tone === "dark"
            ? "text-slate-400 hover:bg-slate-700 hover:text-white"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
