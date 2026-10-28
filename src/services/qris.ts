"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

export interface QrisSetting {
  payload: string;
  merchantName: string;
  note: string | null;
}

export const QRIS_KEY = ["qris"];

export function useQris() {
  return useQuery({
    queryKey: QRIS_KEY,
    queryFn: async () => (await apiClient.get<{ qris: QrisSetting | null }>("/settings/qris")).data.qris,
  });
}
