"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/components/ui/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useAppTheme();

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {!mounted ? <span className="h-4 w-4" /> : theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
