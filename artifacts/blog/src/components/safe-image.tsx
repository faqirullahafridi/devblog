import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { optimizeImageUrl, normalizeImageUrl } from "@/lib/image-url";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** Request a smaller CDN variant when supported (e.g. Unsplash). */
  width?: number;
  sizes?: string;
  priority?: boolean;
};

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
  const normalizedSrc = useMemo(() => normalizeImageUrl(src), [src]);
  const optimizedSrc = useMemo(
    () => (width ? optimizeImageUrl(normalizedSrc, width) : normalizedSrc),
    [normalizedSrc, width],
  );

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
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={width}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer-when-downgrade"
      onError={() => setFailed(true)}
    />
  );
}
