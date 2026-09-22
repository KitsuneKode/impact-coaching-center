/*
 * Reached only through a dynamic import in app/providers.tsx, so the DOM
 * feature bundle sits in its own chunk instead of every page's first load.
 * Nothing here drags, lays out, or measures - domAnimation covers springs,
 * in-view triggers and exits, which is all this site uses.
 */
export { domAnimation as default } from "motion/react"
