"use client";

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useQueryClient() {
  const [queryClient] = useState(() => new QueryClient());
  return queryClient;
}
