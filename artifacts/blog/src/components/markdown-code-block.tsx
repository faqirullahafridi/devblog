import { lazy, Suspense, type CSSProperties } from "react";

const LazyHighlighter = lazy(async () => {
  const [{ Prism }, { vscDarkPlus }] = await Promise.all([
    import("react-syntax-highlighter"),
    import("react-syntax-highlighter/dist/esm/styles/prism"),
  ]);
  return {
    default: function Highlighter({
      language,
      code,
      className,
      customStyle,
    }: {
      language: string;
      code: string;
      className?: string;
      customStyle?: CSSProperties;
    }) {
      return (
        <Prism
          style={vscDarkPlus as Record<string, CSSProperties>}
          language={language}
          PreTag="div"
          className={className}
          customStyle={customStyle}
        >
          {code}
        </Prism>
      );
    },
  };
});

type MarkdownCodeBlockProps = {
  language: string;
  code: string;
  className?: string;
  customStyle?: CSSProperties;
};

export function MarkdownCodeBlock({ language, code, className, customStyle }: MarkdownCodeBlockProps) {
  return (
    <Suspense
      fallback={
        <pre className="markdown-pre overflow-x-auto p-5 text-sm">
          <code>{code}</code>
        </pre>
      }
    >
      <LazyHighlighter language={language} code={code} className={className} customStyle={customStyle} />
    </Suspense>
  );
}
