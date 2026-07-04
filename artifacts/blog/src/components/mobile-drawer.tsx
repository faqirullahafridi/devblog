import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { forceUnlockBodyScroll } from "@/lib/body-scroll-lock";

const PANEL_MS = 200;

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function MobileDrawer({ open, onClose, children, className }: MobileDrawerProps) {
  const [render, setRender] = useState(open);
  const [entered, setEntered] = useState(false);

  // Stay mounted through the close animation, then tear down.
  useEffect(() => {
    if (open) {
      setRender(true);
      return;
    }

    const id = window.setTimeout(() => {
      setRender(false);
      setEntered(false);
      forceUnlockBodyScroll();
      document.documentElement.style.overflow = "";
    }, PANEL_MS);

    return () => window.clearTimeout(id);
  }, [open]);

  // Slide-in: mount off-screen first, then animate in on the next frame.
  useEffect(() => {
    if (!render || !open) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [render, open]);

  // Light scroll lock — avoid position:fixed on body (causes iOS stuck scroll).
  useEffect(() => {
    if (!render) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [render]);

  if (typeof document === "undefined" || !render) return null;

  const shown = open && entered;

  return createPortal(
    <>
      <div
        aria-hidden={!shown}
        className={cn(
          "fixed inset-x-0 bottom-0 top-14 z-[90] bg-black/50 md:hidden",
          "transition-opacity duration-200 ease-out",
          shown ? "opacity-100" : "opacity-0",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!shown}
        className={cn(
          "fixed bottom-0 left-0 top-14 z-[95] flex w-[min(100vw-2rem,20rem)] max-w-[85vw] flex-col",
          "border-r-2 border-foreground bg-background outline-none md:hidden",
          "transform-gpu transition-transform duration-200 ease-out",
          shown ? "translate-x-0" : "-translate-x-full",
          open ? "pointer-events-auto" : "pointer-events-none",
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
    <h2 className="text-base font-semibold ">
      {children}
    </h2>
  );
}
