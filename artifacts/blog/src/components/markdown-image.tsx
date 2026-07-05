import { useMemo, useState } from "react";
import { IMAGE_WIDTHS, buildImageSrcSet, normalizeImageUrl, optimizeImageUrl } from "@/lib/image-url";

type MarkdownImageProps = {
  src?: string;
  alt?: string;
};

export function MarkdownImage({ src, alt }: MarkdownImageProps) {
  const [useOriginal, setUseOriginal] = useState(false);
  const normalized = useMemo(() => normalizeImageUrl(src), [src]);
  const optimized = useMemo(
    () => (normalized ? optimizeImageUrl(normalized, IMAGE_WIDTHS.article) : ""),
    [normalized],
  );
  const srcSet = useMemo(
    () => (normalized && !useOriginal ? buildImageSrcSet(normalized, IMAGE_WIDTHS.article) : undefined),
    [normalized, useOriginal],
  );
  const displaySrc = useOriginal ? normalized : optimized;

  if (!displaySrc) return null;

  return (
    <img
      src={displaySrc}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, 800px"
      width={IMAGE_WIDTHS.article}
      height={Math.round(IMAGE_WIDTHS.article * 0.625)}
      alt={alt ?? ""}
      className="markdown-img"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!useOriginal && optimized && optimized !== normalized) {
          setUseOriginal(true);
        }
      }}
    />
  );
}
