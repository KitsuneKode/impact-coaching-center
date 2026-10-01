"use client"

import { IconArrowRight, IconFileText } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useState, useSyncExternalStore } from "react"

import type { Shelf } from "./_data"
import { Folder, type FolderTones } from "./_folder"

/**
 * The six free folders. Pick one, pick a file, and a typeset sheet previews
 * it beside the list. Deep-links from the home page arrive as #folder-id.
 * Styled through `--fb-*` variables and `folderBrowserCss`.
 */
export function FolderBrowser({
  folders,
  tones,
  readHref,
}: {
  folders: Shelf["folders"]
  tones: FolderTones
  readHref: string
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [file, setFile] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const hash = useSyncExternalStore(
    (on) => {
      window.addEventListener("hashchange", on)
      return () => window.removeEventListener("hashchange", on)
    },
    () => window.location.hash.slice(1),
    () => ""
  )
  const open =
    picked ?? (folders.some((f) => f.id === hash) ? hash : folders[0]!.id)
  const folder = folders.find((f) => f.id === open)!
  const current =
    folder.items.find((n) => n.slug === file) ?? folder.items[0] ?? null

  return (
    <div data-fb>
      <ul data-fb-folders>
        {folders.map((f) => (
          <li key={f.id} id={f.id} style={{ scrollMarginTop: 96 }}>
            <button
              type="button"
              data-fd-hover
              data-fd-open={f.id === open ? "" : undefined}
              aria-pressed={f.id === open}
              onClick={() => {
                setPicked(f.id)
                setFile(null)
              }}
              data-fb-folder
            >
              <Folder folder={f} tones={tones} />
            </button>
          </li>
        ))}
      </ul>

      <div data-fb-body>
        <h2 data-fb-title>{folder.name}</h2>
        {current ? (
          <div data-fb-split>
            <ul data-fb-list aria-label={`Files in ${folder.name}`}>
              {folder.items.map((n) => (
                <li key={n.slug}>
                  <button
                    type="button"
                    data-fb-file
                    data-on={n.slug === current.slug ? "" : undefined}
                    aria-pressed={n.slug === current.slug}
                    onClick={() => setFile(n.slug)}
                  >
                    <IconFileText aria-hidden size={20} stroke={1.5} />
                    <span>
                      <span data-fb-name>{n.title}</span>
                      <span data-fb-meta>
                        {n.kind}, {n.exam}
                        {n.pages > 0 ? `, ${n.pages} pages` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div data-fb-preview>
              <AnimatePresence initial={false} mode="wait">
                <m.div
                  key={current.slug}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.24, ease: [0.23, 1, 0.32, 1] },
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  <div data-fb-sheet>
                    <span data-fb-kind>{current.kind}</span>
                    <span data-fb-sheet-title>{current.title}</span>
                    <span data-fb-lines aria-hidden />
                    <span data-fb-sheet-foot>
                      {current.exam}
                      {current.pages > 0 && (
                        <>
                          , <b>{current.pages}</b> pages
                        </>
                      )}
                    </span>
                  </div>
                  <div data-fb-actions>
                    <Link href={readHref} data-fb-read>
                      Read free
                      <IconArrowRight aria-hidden size={18} stroke={2} />
                    </Link>
                    <p>Log in once with your mobile number to open it.</p>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <p data-fb-empty>
            Nothing in this folder yet. New material appears here as soon as ICT
            publishes it.
          </p>
        )}
      </div>
    </div>
  )
}
