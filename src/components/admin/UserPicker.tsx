"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { apiClient } from "@/lib/api";

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface UserListResponse {
  data: UserOption[];
  meta: { total: number };
}

export function UserPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: UserOption | null;
  onChange: (user: UserOption | null) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useQuery({
    queryKey: ["user-picker-search", query],
    queryFn: async () =>
      (
        await apiClient.get<UserListResponse>("/user", {
          params: { search: query, limit: 8 },
        })
      ).data,
    enabled: query.trim().length > 1,
  });

  if (value) {
    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">{value.name}</p>
            <p className="text-xs text-slate-500">{value.email}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Ganti"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {query.trim().length > 1 && (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {results.isFetching && (
            <p className="px-4 py-3 text-sm text-slate-400">Mencari...</p>
          )}
          {results.data?.data.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">Tidak ada hasil.</p>
          )}
          {results.data?.data.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                onChange(user);
                setQuery("");
              }}
              className="block w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{user.name}</span>
              <span className="block text-xs text-slate-500">{user.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
