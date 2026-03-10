import type { UseShortcutOptions, HandlerOptions } from "@remcostoeten/use-shortcut";

// Centralized shortcut definitions
export const SHORTCUTS = {
  // Navigation
  TOGGLE_SIDEBAR: "mod+/",
  OPEN_COMMAND_PALETTE: "mod+k",
  OPEN_SETTINGS: "mod+comma",
  FOCUS_SEARCH: "mod+f",

  // Journal
  NEW_JOURNAL_ENTRY: "alt+j",
  PREV_DAY: "alt+arrowleft",
  NEXT_DAY: "alt+arrowright",
  TODAY: "alt+t",

  // Notes
  NEW_NOTE: "alt+n",
  SAVE_NOTE: "mod+s",
  DELETE_NOTE: "mod+shift+backspace",

  // Editor modes
  TOGGLE_EDITOR_MODE: "mod+e",
  TOGGLE_RICH_TEXT: "mod+shift+e",

  // Views
  TOGGLE_DATABASE_VIEW: "mod+d",
  TOGGLE_STATS: "mod+shift+s",

  // Help
  SHOW_SHORTCUTS: "shift+/",
  ESCAPE: "escape",
} as const;

export type ShortcutKey = keyof typeof SHORTCUTS;

// Human-readable descriptions
export const SHORTCUT_DESCRIPTIONS: Record<ShortcutKey, string> = {
  TOGGLE_SIDEBAR: "Toggle sidebar",
  OPEN_COMMAND_PALETTE: "Open command palette",
  OPEN_SETTINGS: "Open settings",
  FOCUS_SEARCH: "Focus search",
  NEW_JOURNAL_ENTRY: "New journal entry",
  PREV_DAY: "Previous day",
  NEXT_DAY: "Next day",
  TODAY: "Go to today",
  NEW_NOTE: "New note",
  SAVE_NOTE: "Save note",
  DELETE_NOTE: "Delete note",
  TOGGLE_EDITOR_MODE: "Toggle editor mode",
  TOGGLE_RICH_TEXT: "Toggle rich text mode",
  TOGGLE_DATABASE_VIEW: "Toggle database view",
  TOGGLE_STATS: "Toggle statistics",
  SHOW_SHORTCUTS: "Show shortcuts",
  ESCAPE: "Escape",
};

// Scopes for different contexts
export const SHORTCUT_SCOPES = {
  GLOBAL: "global",
  JOURNAL: "journal",
  NOTES: "notes",
  EDITOR: "editor",
  MODAL: "modal",
} as const;

export type ShortcutScope = (typeof SHORTCUT_SCOPES)[keyof typeof SHORTCUT_SCOPES];

export const SHORTCUT_SCOPE_LABELS: Record<ShortcutScope, string> = {
  global: "Global",
  journal: "Journal",
  notes: "Notes",
  editor: "Editor",
  modal: "Modal",
};

// Scope assignments for each shortcut
export const SHORTCUT_SCOPES_MAP: Record<ShortcutKey, ShortcutScope[]> = {
  TOGGLE_SIDEBAR: [SHORTCUT_SCOPES.GLOBAL],
  OPEN_COMMAND_PALETTE: [SHORTCUT_SCOPES.GLOBAL],
  OPEN_SETTINGS: [SHORTCUT_SCOPES.GLOBAL],
  FOCUS_SEARCH: [SHORTCUT_SCOPES.GLOBAL],
  NEW_JOURNAL_ENTRY: [SHORTCUT_SCOPES.GLOBAL, SHORTCUT_SCOPES.JOURNAL],
  PREV_DAY: [SHORTCUT_SCOPES.JOURNAL],
  NEXT_DAY: [SHORTCUT_SCOPES.JOURNAL],
  TODAY: [SHORTCUT_SCOPES.JOURNAL],
  NEW_NOTE: [SHORTCUT_SCOPES.GLOBAL, SHORTCUT_SCOPES.NOTES],
  SAVE_NOTE: [SHORTCUT_SCOPES.NOTES, SHORTCUT_SCOPES.EDITOR],
  DELETE_NOTE: [SHORTCUT_SCOPES.NOTES],
  TOGGLE_EDITOR_MODE: [SHORTCUT_SCOPES.EDITOR],
  TOGGLE_RICH_TEXT: [SHORTCUT_SCOPES.EDITOR],
  TOGGLE_DATABASE_VIEW: [SHORTCUT_SCOPES.JOURNAL],
  TOGGLE_STATS: [SHORTCUT_SCOPES.JOURNAL],
  SHOW_SHORTCUTS: [SHORTCUT_SCOPES.GLOBAL],
  ESCAPE: [SHORTCUT_SCOPES.GLOBAL, SHORTCUT_SCOPES.MODAL],
};

// Default options for useShortcut hook
export const DEFAULT_SHORTCUT_OPTIONS: UseShortcutOptions = {
  ignoreInputs: true,
  conflictWarnings: true,
  sequenceTimeout: 800,
};

// Default handler options
export const DEFAULT_HANDLER_OPTIONS: Partial<HandlerOptions> = {
  preventDefault: true,
  except: "typing",
};

// Helper to get combo string for display
export function getShortcutCombo(key: ShortcutKey): string {
  return SHORTCUTS[key];
}

// Helper to get description
export function getShortcutDescription(key: ShortcutKey): string {
  return SHORTCUT_DESCRIPTIONS[key];
}

// Helper to get scopes
export function getShortcutScopes(key: ShortcutKey): ShortcutScope[] {
  return SHORTCUT_SCOPES_MAP[key];
}
