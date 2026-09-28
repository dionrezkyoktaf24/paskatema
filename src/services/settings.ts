"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

export const ACTIVE_ANGKATAN_KEY = ["active-angkatan"];

/** Angkatan yang masih anggota aktif (diatur admin), urut naik. */
export function useActiveAngkatan() {
  return useQuery({
    queryKey: ACTIVE_ANGKATAN_KEY,
    queryFn: async () =>
      (await apiClient.get<{ angkatan: number[] }>("/settings/active-angkatan")).data.angkatan,
    staleTime: 5 * 60_000,
  });
}

/** Angkatan purna terakhir (mis. aktif 33–35 → 32), atau null bila belum diatur. */
export function lastPurnaAngkatan(active: number[] | undefined): number | null {
  return active && active.length > 0 ? Math.min(...active) - 1 : null;
}
