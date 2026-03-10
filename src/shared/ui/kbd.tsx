"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { formatShortcutDisplay } from "@/shared/lib/format-shortcut-display";

type KbdProps = React.HTMLAttributes<HTMLElement> & {
  combo: string;
};

export function Kbd({ combo, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-6 items-center rounded-md border border-border/65 bg-background px-2 py-1 font-mono text-[11px] font-medium text-muted-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {formatShortcutDisplay(combo)}
    </kbd>
  );
}
