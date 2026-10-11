import { GrandFooter } from "../../_blocks/grand-footer"
import { siteBase } from "../_theme"

/**
 * The grand footer instead of Pulse's small one: the blue band above already
 * closes the pitch, so no extra CTA panel. Links go to Pulse's sub-pages,
 * which are the live ones on this branch. Pulse's `--gf-*` overrides live in
 * the page stylesheet.
 */
export function Footer() {
  return <GrandFooter base={siteBase} />
}
