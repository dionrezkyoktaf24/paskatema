"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useQueryClient } from "@/hooks/useQueryClient";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = useQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
