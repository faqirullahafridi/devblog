import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function MobileDrawer({ open, onClose, children, className }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return () => {
      if (open) unlockBodyScroll();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop — always in DOM; pointer-events toggled (no Radix animate-out stuck state) */}
      <div
        aria-hidden={!open}
        className={cn(
          "fixed left-0 right-0 bottom-0 top-14 z-[100] bg-black/55 transition-opacity duration-300 ease-out md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 left-0 z-[101] flex w-[min(100vw-2rem,20rem)] max-w-[85vw] flex-col",
          "border-r-2 border-foreground bg-background outline-none md:hidden",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform",
          open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none",
          className,
        )}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

export function MobileDrawerTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-black uppercase tracking-wider">
      {children}
    </h2>
  );
}
