"use client"

import { useTheme } from "next-themes"

/**
 * A development-only switch between the two candidate palettes.
 *
 * Rendered by app/layout.tsx behind a NODE_ENV check, so it cannot reach a
 * visitor. It exists so the palette decision is made by looking at real pages
 * - the hero photographs, the course posters, the amber draft notices -
 * rather than at five swatches.
 *
 * The state, the persistence and the no-flash script all come from
 * next-themes, configured in app/providers.tsx. This file is only the five
 * buttons; delete it and its one call site once KIT-67 picks a palette, and
 * the provider stays for dark mode.
 */
const THEMES = [
  { id: "current", label: "Current" },
  { id: "elegance", label: "Elegance" },
  { id: "elegance-dark", label: "Elegance dark" },
  { id: "twilight", label: "Twilight" },
  { id: "twilight-dark", label: "Twilight dark" },
] as const

export function ThemePreview() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-card border border-border bg-card p-1 shadow-lift">
      {THEMES.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setTheme(option.id)}
          aria-pressed={theme === option.id}
          // The server cannot know which palette is stored, so this attribute
          // legitimately differs on first paint. Scoped to this button, which
          // is the one element where the difference is expected.
          suppressHydrationWarning
          className="min-h-9 rounded-control px-3 text-sm text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-secondary aria-pressed:text-foreground"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
