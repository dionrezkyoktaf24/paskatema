import { apiClient } from "@/lib/api";

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  angkatan: string;
}

export async function submitRegistration(payload: RegistrationPayload) {
  const response = await apiClient.post("/registration", payload);
  return response.data;
}
