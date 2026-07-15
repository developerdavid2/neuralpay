"use client";

import { useEffect, useState } from "react";
import { Button } from "@neuralpay/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {!mounted ? (
            // Static icon that won't cause hydration mismatch
            // Shows something reasonable before JS loads
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : resolvedTheme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
