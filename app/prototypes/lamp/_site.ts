import { conceptTokens } from "../_kit/concept"

export const base = "/prototypes/lamp"

/** Lamp's ink and amber in the kit's token names, for the kit's page bodies. */
export const tokens = conceptTokens({
  dark: true,
  bg: "#07090E",
  ink: "#ECEFF4",
  accent: "#F5B544",
  second: "#1B2433",
  radius: 20,
  inner: 14,
  display: "var(--lp-sans)",
  sans: "var(--lp-sans)",
  h1Weight: "700",
  h1Tracking: "-0.03em",
})
