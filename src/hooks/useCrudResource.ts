"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

/**
 * Pola CRUD generik dipakai lintas modul admin (Berita, Event, Prestasi,
 * E-Book, dst.) yang bentuk API-nya seragam: GET/POST endpoint, PATCH/DELETE
 * endpoint/:id. Modul dengan bentuk berbeda (mis. Voting, Registration)
 * tidak memakai hook ini.
 */
export function useCrudResource<TItem, TCreate = Partial<TItem>, TUpdate = Partial<TItem>>(
  queryKey: string,
  endpoint: string,
) {
  const queryClient = useQueryClient();

  const list = useQuery<TItem[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await apiClient.get<TItem[]>(endpoint);
      return response.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const create = useMutation({
    mutationFn: async (data: TCreate) => {
      const response = await apiClient.post<TItem>(endpoint, data);
      return response.data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TUpdate }) => {
      const response = await apiClient.patch<TItem>(`${endpoint}/${id}`, data);
      return response.data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${endpoint}/${id}`);
    },
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
}
