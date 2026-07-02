import { Link } from "wouter";
import { AI_MODES, AI_SPECIAL_MODES, ALL_AI_MODES, getAiMode, type AiModeConfig } from "@/components/platform/ai-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function ModeMenuItem({ mode, active, compact = false }: { mode: AiModeConfig; active: boolean; compact?: boolean }) {
  const Icon = mode.icon;
  return (
    <DropdownMenuItem asChild className="cursor-pointer p-0 focus:bg-accent">
      <Link
        href={mode.href}
        className={cn("flex w-full items-center", compact ? "gap-2 px-2 py-1.5" : "gap-3 px-2.5 py-2.5")}
      >
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md ring-1 ring-border/50",
            compact ? "h-6 w-6" : "h-8 w-8 rounded-lg",
            mode.iconBg,
          )}
        >
          <Icon className={cn(compact ? "h-3 w-3" : "h-4 w-4", mode.accent)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("flex items-center gap-1.5 font-semibold", compact ? "text-xs" : "text-sm")}>
            {mode.label}
            {active && <Check className={cn("text-primary", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />}
          </span>
          {!compact && (
            <span className="block text-xs text-muted-foreground line-clamp-1">{mode.description}</span>
          )}
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function CoreTab({ mode, active }: { mode: AiModeConfig; active: boolean }) {
  const Icon = mode.icon;
  return (
    <Link
      href={mode.href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-primary/10 text-primary ring-1 ring-primary/25"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {mode.label}
    </Link>
  );
}

export function AiModeSwitcher({ activeHref }: { activeHref: string }) {
  const current = ALL_AI_MODES.find((m) => m.href === activeHref) ?? getAiMode("chat");
  const CurrentIcon = current.icon;
  const isSpecial = AI_SPECIAL_MODES.some((m) => m.href === activeHref);

  return (
    <div className="min-w-0 flex-1">
      {/* Mobile + narrow: single dropdown */}
      <div className="md:hidden">
        <ModeDropdown current={current} activeHref={activeHref} className="w-full" />
      </div>

      {/* Desktop: core tabs + More menu */}
      <div className="hidden md:flex md:items-center md:gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {AI_MODES.map((mode) => (
            <CoreTab key={mode.id} mode={mode} active={mode.href === activeHref} />
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSpecial && "border-primary/30 bg-primary/5 text-primary",
            )}
          >
            {isSpecial ? (
              <>
                <CurrentIcon className="h-3.5 w-3.5" />
                {current.label}
              </>
            ) : (
              "More"
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </DropdownMenuTrigger>
          <ModeDropdownContent activeHref={activeHref} modes={AI_SPECIAL_MODES} label="Specialized" />
        </DropdownMenu>
      </div>
    </div>
  );
}

function ModeDropdownContent({
  activeHref,
  modes,
  label,
  includeCore = false,
  compact = false,
}: {
  activeHref: string;
  modes?: AiModeConfig[];
  label?: string;
  includeCore?: boolean;
  compact?: boolean;
}) {
  return (
    <DropdownMenuContent
      align={compact ? "center" : "end"}
      className={cn(
        compact
          ? "max-h-[min(14rem,42dvh)] w-[min(calc(100vw-2rem),15rem)] overflow-y-auto overscroll-contain p-1"
          : "w-[min(100vw-2rem,20rem)]",
      )}
    >
      {includeCore && (
        <>
          <DropdownMenuLabel className={cn("text-muted-foreground", compact ? "px-2 py-1 text-[10px]" : "text-xs")}>
            Core modes
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {AI_MODES.map((mode) => (
              <ModeMenuItem key={mode.id} mode={mode} active={mode.href === activeHref} compact={compact} />
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )}
      {label && (
        <DropdownMenuLabel className={cn("text-muted-foreground", compact ? "px-2 py-1 text-[10px]" : "text-xs")}>
          {label}
        </DropdownMenuLabel>
      )}
      <DropdownMenuGroup>
        {(modes ?? [...AI_MODES, ...AI_SPECIAL_MODES]).map((mode) => (
          <ModeMenuItem key={mode.id} mode={mode} active={mode.href === activeHref} compact={compact} />
        ))}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}

function ModeDropdown({
  current,
  activeHref,
  className,
}: {
  current: AiModeConfig;
  activeHref: string;
  className?: string;
}) {
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          className,
        )}
      >
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-border/50", current.iconBg)}>
          <CurrentIcon className={cn("h-4 w-4", current.accent)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{current.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{current.description}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <ModeDropdownContent activeHref={activeHref} includeCore label="Specialized" modes={AI_SPECIAL_MODES} compact />
    </DropdownMenu>
  );
}
