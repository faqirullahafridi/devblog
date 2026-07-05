import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_INSET = "calc(3.5rem + env(safe-area-inset-bottom))";
const DRAWER_ID = "mobile-nav-drawer";

/** Blur focus trapped inside the drawer so aria-hidden/inert can apply safely. */
export function releaseMobileDrawerFocus(returnFocusTo?: HTMLElement | null) {
  const drawer = document.getElementById(DRAWER_ID);
  const active = document.activeElement;
  if (drawer && active instanceof HTMLElement && drawer.contains(active)) {
    active.blur();
  }
  returnFocusTo?.focus({ preventScroll: true });
}

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

/** Fixed drawer — no portal; blur focus before hide to avoid aria-hidden violations. */
export function MobileDrawer({ open, onClose, children, className }: MobileDrawerProps) {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    if (open) {
      el.removeAttribute("inert");
    } else {
      el.setAttribute("inert", "");
    }
  }, [open]);

  const handleBackdropClose = () => {
    releaseMobileDrawerFocus();
    onClose();
  };

  return (
    <>
      <div
        aria-hidden="true"
        style={{ bottom: BOTTOM_NAV_INSET }}
        onClick={handleBackdropClose}
        className={cn(
          "fixed inset-x-0 top-14 z-[90] bg-black/50 md:hidden",
          "transition-opacity duration-150 ease-linear",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      <aside
        ref={asideRef}
        id={DRAWER_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        style={{ bottom: BOTTOM_NAV_INSET }}
        className={cn(
          "fixed left-0 top-14 z-[95] flex w-[min(100vw-2rem,20rem)] max-w-[85vw] flex-col md:hidden",
          "border-r border-border bg-background shadow-lg",
          "transition-transform duration-150 ease-out",
          open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none",
          className,
        )}
      >
        {children}
      </aside>
    </>
  );
}

export function MobileDrawerTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold">{children}</h2>;
}
