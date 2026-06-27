import type { CSSProperties, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";
import { CodeBlockCopyButton } from "@/components/code-block-copy";
import { IMAGE_WIDTHS, optimizeImageUrl } from "@/lib/image-url";

type MarkdownContentProps = {
  content: string;
  className?: string;
  size?: "default" | "sm";
};

function headingId(children: ReactNode): string {
  const text = typeof children === "string"
    ? children
    : Array.isArray(children)
      ? children.map((c) => (typeof c === "string" ? c : "")).join("")
      : String(children ?? "");
  return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="markdown-h1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 id={headingId(children)} className="markdown-h2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 id={headingId(children)} className="markdown-h3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="markdown-h4">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="markdown-p">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="markdown-a" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="markdown-ul">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="markdown-ol">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="markdown-li">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="markdown-blockquote">{children}</blockquote>
  ),
  hr: () => <hr className="markdown-hr" />,
  strong: ({ children }) => (
    <strong className="markdown-strong">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="markdown-em">{children}</em>
  ),
  del: ({ children }) => (
    <del className="markdown-del">{children}</del>
  ),
  table: ({ children }) => (
    <div className="markdown-table-wrap">
      <table className="markdown-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
  th: ({ children }) => <th className="markdown-th">{children}</th>,
  td: ({ children }) => <td className="markdown-td">{children}</td>,
  img: ({ src, alt }) => (
    <img
      src={optimizeImageUrl(src, IMAGE_WIDTHS.article)}
      alt={alt ?? ""}
      className="markdown-img"
      loading="lazy"
      decoding="async"
    />
  ),
  pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const code = String(children).replace(/\n$/, "");

    if (match) {
      return (
        <div className="relative group markdown-code-block-wrap">
          <CodeBlockCopyButton code={code} />
          <SyntaxHighlighter
            style={vscDarkPlus as Record<string, CSSProperties>}
            language={match[1]}
            PreTag="div"
            className="markdown-code-block"
            customStyle={{ margin: 0, padding: "1.25rem", paddingRight: "3rem", background: "transparent" }}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code className="markdown-inline-code" {...props}>
        {children}
      </code>
    );
  },
};

export function MarkdownContent({ content, className, size = "default" }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "markdown-content",
        size === "sm" && "markdown-content-sm",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
