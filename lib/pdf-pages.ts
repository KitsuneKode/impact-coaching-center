/**
 * Renders a PDF into per-page JPEG Files, entirely in the browser. Loaded by
 * dynamic import from the admin editors, so pdfjs never lands in the public
 * bundle - and because pages leave as rasterized images, the source PDF is
 * never stored, which is exactly the resource-access contract (visitors get
 * page images, not the document).
 */
export async function renderPdfPages(
  file: File,
  maxPages: number
): Promise<File[]> {
  if (typeof document === "undefined")
    throw new Error("PDF rendering only runs in a browser.")

  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString()

  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() })
  const document_ = await loadingTask.promise
  try {
    const total = Math.min(document_.numPages, maxPages)
    const pages: File[] = []
    for (let number = 1; number <= total; number++) {
      const page = await document_.getPage(number)
      /* ~1600px wide keeps scanned text readable at the reader's 2x zoom
         without producing multi-megabyte pages. */
      const base = page.getViewport({ scale: 1 })
      const viewport = page.getViewport({ scale: 1600 / base.width })
      const canvas = document.createElement("canvas")
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvas, viewport }).promise
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
      )
      if (!blob) throw new Error(`Page ${number} did not render.`)
      pages.push(new File([blob], `page-${number}.jpg`, { type: "image/jpeg" }))
      page.cleanup()
    }
    return pages
  } finally {
    await loadingTask.destroy()
  }
}
