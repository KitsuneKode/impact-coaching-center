import type { BookTones } from "../_book"
import type { FolderTones } from "../_folder"

export type KitProps = { base: string }

export const container = "mx-auto w-full max-w-[1240px] px-5 md:px-8"
export const external = {
  target: "_blank",
  rel: "noreferrer noopener",
} as const

/** Book covers and folders take their colours from the theme's `--k-*` tokens. */
export const bookTones: BookTones = {
  primary: {
    bg: "var(--k-book-a)",
    ink: "var(--k-book-a-ink)",
    spine: "var(--k-book-a-spine)",
  },
  highlight: {
    bg: "var(--k-book-b)",
    ink: "var(--k-book-b-ink)",
    spine: "var(--k-book-b-spine)",
  },
  muted: {
    bg: "var(--k-book-c)",
    ink: "var(--k-book-c-ink)",
    spine: "var(--k-book-c-spine)",
  },
}

export const folderTones: FolderTones = {
  back: "var(--k-folder-back)",
  front: "var(--k-folder-front)",
  paper: "var(--k-folder-paper)",
  ink: "var(--k-folder-ink)",
  muted: "var(--k-folder-muted)",
}
