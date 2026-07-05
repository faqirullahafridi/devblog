import { useMemo, useState } from "react";
import { IMAGE_WIDTHS, normalizeImageUrl, optimizeImageUrl } from "@/lib/image-url";

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
  const displaySrc = useOriginal ? normalized : optimized;

  if (!displaySrc) return null;

  return (
    <img
      src={displaySrc}
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
