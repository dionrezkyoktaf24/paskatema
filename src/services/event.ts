import type { MediaItem } from "@/services/media";

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string | null;
  poster: MediaItem | null;
  video: MediaItem | null;
}

export function formatEventDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
