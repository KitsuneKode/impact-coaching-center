"use client"

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

export const THEME_CHOICES = [
  { id: "light", icon: IconSun },
  { id: "dark", icon: IconMoon },
  { id: "system", icon: IconDeviceDesktop },
] as const
export type ThemeChoice = (typeof THEME_CHOICES)[number]["id"]

const noop = () => () => {}

/**
 * The reader's theme choice. Unknown until hydration (the server cannot read
 * localStorage), so `choice` is null until then and nothing shows as pressed.
 */
export function useThemeChoice() {
  const { theme, setTheme } = useTheme()
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
  return {
    choice: hydrated ? ((theme ?? "light") as ThemeChoice) : null,
    choose: (next: ThemeChoice) => setTheme(next),
  }
}

/** Light, dark or the device's own setting, as three small icon buttons. */
export function ThemeSwitch({ className }: { className?: string }) {
  const t = useTranslations("Theme")
  const { choice, choose } = useThemeChoice()
  return (
    <fieldset
      aria-label={t("switch")}
      className={cn(
        "inline-flex items-center rounded-md bg-secondary p-0.5",
        className
      )}
    >
      {THEME_CHOICES.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={choice === id}
          aria-label={t(id)}
          title={t(id)}
          onClick={() => choose(id)}
          data-press
          className="grid h-8 min-w-9 place-items-center rounded-[0.3rem] text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-frame"
        >
          <Icon aria-hidden size={16} stroke={1.75} />
        </button>
      ))}
    </fieldset>
  )
}
