import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
  minHeight?: string;
  readOnly?: boolean;
  placeholder?: string;
};

export function CodeEditor({
  value,
  onChange,
  language,
  className,
  minHeight = "min-h-[240px]",
  readOnly,
  placeholder,
}: CodeEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      spellCheck={false}
      data-language={language}
      placeholder={placeholder}
      className={cn("font-mono text-sm leading-relaxed resize-y", minHeight, className)}
    />
  );
}
