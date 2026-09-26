/*
 * Reached only through a dynamic import in app/providers.tsx, so the DOM
 * feature bundle sits in its own chunk instead of every page's first load.
 */
export { domAnimation as default } from "motion/react"
