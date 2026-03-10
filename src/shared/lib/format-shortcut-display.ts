import { formatShortcut } from "@remcostoeten/use-shortcut";

export function formatShortcutDisplay(combo: string) {
  return combo
    .split(/\s+\/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => formatShortcut(part))
    .join(" / ");
}
