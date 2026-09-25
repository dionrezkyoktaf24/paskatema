/** Role akun (sama dengan enum Role di backend). USER = anggota biasa. */
export type UserRole = "USER" | "ADMIN" | "BENDAHARA";

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  BENDAHARA: "Bendahara",
  USER: "Anggota",
};

/**
 * Halaman panel admin yang boleh dibuka tiap role. `null` = semua halaman.
 * Bendahara hanya mengelola laporan keuangan.
 */
const PANEL_PATHS: Partial<Record<UserRole, string[] | null>> = {
  ADMIN: null,
  BENDAHARA: ["/admin/keuangan"],
};

export function canUsePanel(role: UserRole | undefined): boolean {
  return role !== undefined && role in PANEL_PATHS;
}

export function canOpenPanelPath(role: UserRole | undefined, pathname: string): boolean {
  if (!role || !(role in PANEL_PATHS)) return false;
  const allowed = PANEL_PATHS[role];
  return allowed === null || allowed === undefined
    ? true
    : allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Halaman tujuan setelah login / tombol "Panel" untuk tiap role. */
export function homeForRole(role: UserRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "BENDAHARA") return "/admin/keuangan";
  return "/akun";
}

export function panelLabel(role: UserRole): string {
  return role === "BENDAHARA" ? "Panel Bendahara" : "Panel Admin";
}

/**
 * Tujuan `?next=` setelah login/daftar (mis. kembali ke /pendaftaran).
 * Hanya path relatif di situs ini yang diterima, supaya tidak bisa dipakai
 * untuk mengarahkan ke situs lain.
 */
export function nextPathFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
