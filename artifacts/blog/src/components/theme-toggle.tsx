import { Moon, Sun } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative z-20 shrink-0 touch-manipulation"
      onClick={handleToggle}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
