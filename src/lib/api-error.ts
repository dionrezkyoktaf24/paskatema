import axios from "axios";

/** Pesan error dari backend (NestJS), atau fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) return "Terlalu banyak kiriman. Tunggu sebentar lalu coba lagi.";
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (message) return message;
  }
  return fallback;
}
