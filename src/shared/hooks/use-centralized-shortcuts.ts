"use client";

import { useShortcut, type ShortcutResult } from "@remcostoeten/use-shortcut";
import { useCallback, useEffect, useMemo } from "react";
import type { ShortcutKey, ShortcutScope } from "@/shared/lib/shortcuts";
import {
  SHORTCUTS,
  SHORTCUT_SCOPES,
  DEFAULT_SHORTCUT_OPTIONS,
  DEFAULT_HANDLER_OPTIONS,
  getShortcutCombo,
  getShortcutDescription,
  getShortcutScopes,
} from "@/shared/lib/shortcuts";

// Type for shortcut handler functions
export type ShortcutHandler = () => void;

// Type for handler registry
export type ShortcutHandlers = Partial<Record<ShortcutKey, ShortcutHandler>>;

// Type for hook options
export interface UseCentralizedShortcutsOptions {
  handlers: ShortcutHandlers;
  activeScopes?: ShortcutScope[];
  disabled?: boolean;
  debug?: boolean;
}

/**
 * Centralized hook for managing keyboard shortcuts across the app
 * 
 * Usage:
 * ```tsx
 * const handlers = {
 *   OPEN_COMMAND_PALETTE: () => setOpen(true),
 *   NEW_NOTE: () => createNote(),
 *   SAVE_NOTE: () => saveCurrentNote(),
 * };
 * 
 * useCentralizedShortcuts({ handlers, activeScopes: ["editor"] });
 * ```
 */
export function useCentralizedShortcuts({
  handlers,
  activeScopes = [],
  disabled = false,
  debug = false,
}: UseCentralizedShortcutsOptions) {
  // Initialize useShortcut with default options
  const $ = useShortcut({
    ...DEFAULT_SHORTCUT_OPTIONS,
    activeScopes,
    disabled,
    debug,
  });

  // Memoize enabled shortcuts for current scopes
  const enabledShortcuts = useMemo(() => {
    if (activeScopes.length === 0) {
      // If no scopes specified, enable all shortcuts
      return Object.keys(SHORTCUTS) as ShortcutKey[];
    }

    return (Object.keys(SHORTCUTS) as ShortcutKey[]).filter(key => {
      const shortcutScopes = getShortcutScopes(key);
      return shortcutScopes.some(scope => activeScopes.includes(scope));
    });
  }, [activeScopes]);

  // Register shortcuts
  useEffect(() => {
    if (disabled) return;

    const bindings: ShortcutResult[] = [];

    // Global shortcuts
    if (handlers.OPEN_COMMAND_PALETTE) {
      bindings.push(
        $.mod.key("k").on(handlers.OPEN_COMMAND_PALETTE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.GLOBAL],
          description: getShortcutDescription("OPEN_COMMAND_PALETTE"),
        }),
      );
      bindings.push(
        $.mod.shift.key("p").on(handlers.OPEN_COMMAND_PALETTE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.GLOBAL],
          description: getShortcutDescription("OPEN_COMMAND_PALETTE"),
        }),
      );
    }

    if (handlers.OPEN_SETTINGS) {
      bindings.push(
        $.mod.key("comma").on(handlers.OPEN_SETTINGS, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.GLOBAL],
          description: getShortcutDescription("OPEN_SETTINGS"),
        }),
      );
    }

    if (handlers.TOGGLE_SIDEBAR) {
      bindings.push(
        $.mod.key("/").on(handlers.TOGGLE_SIDEBAR, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.GLOBAL],
          description: getShortcutDescription("TOGGLE_SIDEBAR"),
        }),
      );
    }

    if (handlers.ESCAPE) {
      bindings.push(
        $.key("escape").on(handlers.ESCAPE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.GLOBAL, SHORTCUT_SCOPES.MODAL],
          description: getShortcutDescription("ESCAPE"),
        }),
      );
    }

    // Journal shortcuts
    if (handlers.NEW_JOURNAL_ENTRY && activeScopes.includes(SHORTCUT_SCOPES.JOURNAL)) {
      bindings.push(
        $.alt.key("j").on(handlers.NEW_JOURNAL_ENTRY, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.JOURNAL],
          description: getShortcutDescription("NEW_JOURNAL_ENTRY"),
        }),
      );
    }

    if (handlers.PREV_DAY && activeScopes.includes(SHORTCUT_SCOPES.JOURNAL)) {
      bindings.push(
        $.alt.key("arrowleft").on(handlers.PREV_DAY, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.JOURNAL],
          description: getShortcutDescription("PREV_DAY"),
        }),
      );
    }

    if (handlers.NEXT_DAY && activeScopes.includes(SHORTCUT_SCOPES.JOURNAL)) {
      bindings.push(
        $.alt.key("arrowright").on(handlers.NEXT_DAY, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.JOURNAL],
          description: getShortcutDescription("NEXT_DAY"),
        }),
      );
    }

    if (handlers.TODAY && activeScopes.includes(SHORTCUT_SCOPES.JOURNAL)) {
      bindings.push(
        $.alt.key("t").on(handlers.TODAY, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.JOURNAL],
          description: getShortcutDescription("TODAY"),
        }),
      );
    }

    // Notes shortcuts
    if (handlers.NEW_NOTE && activeScopes.includes(SHORTCUT_SCOPES.NOTES)) {
      bindings.push(
        $.alt.key("n").on(handlers.NEW_NOTE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: getShortcutScopes("NEW_NOTE"),
          description: getShortcutDescription("NEW_NOTE"),
        }),
      );
    }

    if (
      handlers.SAVE_NOTE &&
      (activeScopes.includes(SHORTCUT_SCOPES.NOTES) || activeScopes.includes(SHORTCUT_SCOPES.EDITOR))
    ) {
      bindings.push(
        $.mod.key("s").on(handlers.SAVE_NOTE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: getShortcutScopes("SAVE_NOTE"),
          description: getShortcutDescription("SAVE_NOTE"),
        }),
      );
    }

    if (handlers.DELETE_NOTE && activeScopes.includes(SHORTCUT_SCOPES.NOTES)) {
      bindings.push(
        $.mod.shift.key("backspace").on(handlers.DELETE_NOTE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: getShortcutScopes("DELETE_NOTE"),
          description: getShortcutDescription("DELETE_NOTE"),
        }),
      );
    }

    // Editor shortcuts
    if (handlers.TOGGLE_EDITOR_MODE && activeScopes.includes(SHORTCUT_SCOPES.EDITOR)) {
      bindings.push(
        $.mod.key("e").on(handlers.TOGGLE_EDITOR_MODE, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: getShortcutScopes("TOGGLE_EDITOR_MODE"),
          description: getShortcutDescription("TOGGLE_EDITOR_MODE"),
        }),
      );
    }

    if (handlers.TOGGLE_RICH_TEXT && activeScopes.includes(SHORTCUT_SCOPES.EDITOR)) {
      bindings.push(
        $.mod.shift.key("e").on(handlers.TOGGLE_RICH_TEXT, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: getShortcutScopes("TOGGLE_RICH_TEXT"),
          description: getShortcutDescription("TOGGLE_RICH_TEXT"),
        }),
      );
    }

    // Help shortcuts
    if (handlers.SHOW_SHORTCUTS) {
      bindings.push(
        $.shift.key("/").on(handlers.SHOW_SHORTCUTS, {
          ...DEFAULT_HANDLER_OPTIONS,
          scopes: [SHORTCUT_SCOPES.GLOBAL],
          description: getShortcutDescription("SHOW_SHORTCUTS"),
        }),
      );
    }
    
    return () => {
      bindings.forEach((binding) => binding.unbind());
    };
  }, [$, handlers, activeScopes, disabled]);

  // Helper to programmatically trigger shortcuts
  const triggerShortcut = useCallback((key: ShortcutKey) => {
    const handler = handlers[key];
    if (handler) {
      handler();
    }
  }, [handlers]);

  // Helper to get all available shortcuts for current scopes
  const getAvailableShortcuts = useCallback(() => {
    return enabledShortcuts.map(key => ({
      key,
      combo: getShortcutCombo(key),
      description: getShortcutDescription(key),
      scopes: getShortcutScopes(key),
    }));
  }, [enabledShortcuts]);

  // Helper to check if a shortcut is available
  const isShortcutAvailable = useCallback((key: ShortcutKey) => {
    return enabledShortcuts.includes(key);
  }, [enabledShortcuts]);

  return {
    triggerShortcut,
    getAvailableShortcuts,
    isShortcutAvailable,
    enabledShortcuts,
  };
}

// Export for convenience
export type { ShortcutKey, ShortcutScope };
