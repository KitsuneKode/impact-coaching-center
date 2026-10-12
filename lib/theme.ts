/** Themes next-themes may write to `data-theme`. Dark arrives after launch. */
export const themes = ["light", "dark"] as const

export type ThemeId = (typeof themes)[number]

export const defaultTheme: ThemeId = "light"

/** Same key next-themes uses when `storageKey` is left unset. */
export const themeStorageKey = "theme"

/**
 * Runs from the root layout, before paint. next-themes would inject this
 * itself, but it does so from a client component, and React 19 refuses to
 * execute that script (the "Encountered a script tag while rendering" error).
 * A server-rendered script is the one the browser actually runs.
 *
 * Equivalent to ThemeProvider with attribute "data-theme" and system themes off.
 */
export function themeInitScript(): string {
  return `(function(){try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(themeStorageKey)})||${JSON.stringify(defaultTheme)};d.setAttribute("data-theme",t);if(t==="light"||t==="dark")d.style.colorScheme=t;}catch(e){}})();`
}
