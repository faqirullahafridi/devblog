import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildImageSrcSet, isDirectImageUrl, optimizeImageUrl, normalizeImageUrl } from "@/lib/image-url";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** Request a smaller CDN variant when supported (e.g. Unsplash, Supabase). */
  width?: number;
  sizes?: string;
  priority?: boolean;
};

function shouldAvoidOriginalFallback(src: string): boolean {
  const normalized = normalizeImageUrl(src);
  if (!normalized) return false;
  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    if (host.endsWith(".supabase.co")) return true;
    if (host === "unsplash.com") return true;
  } catch {
    return false;
  }
  return false;
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  width,
  sizes,
  priority = false,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);
  const normalizedSrc = useMemo(() => normalizeImageUrl(src), [src]);
  const optimizedSrc = useMemo(
    () => (width ? optimizeImageUrl(normalizedSrc, width) : normalizedSrc),
    [normalizedSrc, width],
  );
  const srcSet = useMemo(
    () => (width && isDirectImageUrl(normalizedSrc) ? buildImageSrcSet(normalizedSrc, width) : undefined),
    [normalizedSrc, width],
  );
  const displaySrc = useOriginal || !width ? normalizedSrc : optimizedSrc;

  if (failed || !normalizedSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground",
          wrapperClassName,
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="h-10 w-10 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      srcSet={useOriginal ? undefined : srcSet}
      alt={alt}
      className={className}
      width={width}
      height={width ? Math.round(width * 0.625) : undefined}
      sizes={sizes ?? (width ? `${width}px` : undefined)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer"
      onError={() => {
        if (
          !useOriginal &&
          optimizedSrc &&
          optimizedSrc !== normalizedSrc &&
          !shouldAvoidOriginalFallback(normalizedSrc)
        ) {
          setUseOriginal(true);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
