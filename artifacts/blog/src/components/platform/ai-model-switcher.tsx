import { forwardRef, useCallback, useState, type ComponentPropsWithoutRef } from "react";
import { Check, ChevronDown, Code2, Cpu, ImageIcon, MessageSquare, Sparkles } from "lucide-react";
import {
  AI_MODEL_AUTO,
  AI_MODEL_CATEGORY_CHAT,
  AI_MODEL_CATEGORY_CODE,
  AI_MODEL_CATEGORY_IMAGE,
  AI_MODEL_PICKER_OPTIONS,
  getStoredAiModelId,
  isValidPickerModelId,
  pickerLabel,
  setStoredAiModelId,
} from "@/lib/ai-model-prefs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AiModeId } from "@/components/platform/ai-config";

const OPTION_ICONS = {
  auto: Sparkles,
  [AI_MODEL_CATEGORY_CHAT]: MessageSquare,
  [AI_MODEL_CATEGORY_CODE]: Code2,
  [AI_MODEL_CATEGORY_IMAGE]: ImageIcon,
} as const;

type AiModelSwitcherProps = {
  mode: AiModeId;
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
  brutal?: boolean;
  compact?: boolean;
};

function ModelPickerOptions({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {AI_MODEL_PICKER_OPTIONS.map((option) => {
        const Icon = OPTION_ICONS[option.id as keyof typeof OPTION_ICONS] ?? Cpu;
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 pl-2 text-left text-[11px] leading-tight transition-colors",
              "touch-manipulation",
              selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/60 active:bg-accent/80",
            )}
          >
            <Icon className="mt-0.5 h-3 w-3 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{option.label}</span>
              <span className="block text-[9px] text-muted-foreground">{option.description}</span>
            </span>
            {selected && <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

const ModelPickerTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & {
    label: string;
    brutal?: boolean;
    compact?: boolean;
  }
>(({ label, brutal, compact, className, disabled, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    disabled={disabled}
    className={cn(
      "inline-flex min-w-0 items-center gap-1 border bg-card text-left shadow-sm transition-colors",
      "hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/25",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "touch-manipulation",
      compact ? "h-8 max-w-[9.5rem] rounded-md px-2 text-[11px]" : "h-8 max-w-[11rem] rounded-md px-2.5 text-[11px]",
      brutal ? "rounded-none border border-border font-semibold" : "border-border/70",
      className,
    )}
    aria-label="Choose AI mode"
    {...props}
  >
    <Cpu className="h-3 w-3 shrink-0 text-muted-foreground" />
    <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
    <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
  </button>
));
ModelPickerTrigger.displayName = "ModelPickerTrigger";

export function AiModelSwitcher({
  value,
  onChange,
  disabled,
  className,
  brutal,
  compact,
}: AiModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const effectiveValue = isValidPickerModelId(value) ? value : AI_MODEL_AUTO;
  const triggerLabel = pickerLabel(effectiveValue);

  const handleChange = (next: string) => {
    setStoredAiModelId(next);
    onChange(next);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <ModelPickerTrigger
          label={triggerLabel}
          disabled={disabled}
          brutal={brutal}
          compact={compact}
          className={className}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={6}
        collisionPadding={{ top: 12, right: 12, bottom: 12, left: 12 }}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "z-[200] w-[min(calc(100vw-1.5rem),15rem)] p-1",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "duration-150",
          brutal && "rounded-none border border-border",
        )}
      >
        <DropdownMenuLabel className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          Model
        </DropdownMenuLabel>
        <ModelPickerOptions value={effectiveValue} onSelect={handleChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useAiModelPreference() {
  const [modelId, setModelIdState] = useState(getStoredAiModelId);
  const setModelId = useCallback((id: string) => {
    setStoredAiModelId(id);
    setModelIdState(id);
  }, []);
  return { modelId, setModelId };
}
