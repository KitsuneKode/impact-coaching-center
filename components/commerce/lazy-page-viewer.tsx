"use client"

import dynamic from "next/dynamic"

/**
 * The reader, loaded the first time someone opens a sample or a note: the
 * page-curl book and the PDF engine are heavy, and most visitors to a set
 * or the notes page never open one.
 */
export const PageViewer = dynamic(
  () => import("./page-viewer").then((module) => module.PageViewer),
  { ssr: false }
)
