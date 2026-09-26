import { Play } from "lucide-react";

export interface ViewableMedia {
  url: string;
  mimeType: string;
}

export function isVideo(media: ViewableMedia): boolean {
  return media.mimeType.startsWith("video/");
}

/**
 * Gambar sampul video. Untuk video Cloudinary, frame pertama diambil sebagai
 * JPG (so_0) supaya grid tidak perlu memuat videonya. Video lokal: undefined
 * (browser menampilkan frame pertama lewat preload="metadata").
 */
export function videoPoster(url: string): string | undefined {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace(/\/video\/upload\/(f_auto,q_auto\/)?/, "/video/upload/so_0,f_jpg,q_auto/")
    .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
}

/** Thumbnail untuk grid: foto, atau sampul video dengan ikon play. */
export function MediaThumb({
  media,
  alt,
  className = "h-full w-full object-cover",
}: {
  media: ViewableMedia;
  alt: string;
  className?: string;
}) {
  if (!isVideo(media)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.url} alt={alt} loading="lazy" className={className} />;
  }
  const poster = videoPoster(media.url);
  return (
    <span className="relative block h-full w-full">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} loading="lazy" className={className} />
      ) : (
        <video src={media.url} muted playsInline preload="metadata" className={className} aria-label={alt} />
      )}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
          <Play size={20} className="ml-0.5" fill="currentColor" />
        </span>
      </span>
    </span>
  );
}

/** Tampilan penuh (lightbox / halaman detail): foto, atau pemutar video. */
export function MediaFull({
  media,
  alt,
  className = "max-h-[80vh] w-auto rounded-xl object-contain",
}: {
  media: ViewableMedia;
  alt: string;
  className?: string;
}) {
  if (isVideo(media)) {
    return (
      <video
        src={media.url}
        poster={videoPoster(media.url)}
        controls
        playsInline
        preload="metadata"
        className={className}
        aria-label={alt}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt={alt} className={className} />;
}
