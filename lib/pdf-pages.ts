/**
 * Turns PDF pages into images, entirely in the browser. Loaded by dynamic
 * import from the admin editors, so pdfjs never lands in the public bundle.
 *
 * Two uses: a PDF's first page as its public preview (`inspectPdf`), and,
 * where R2 is not set up, every page as an image (`pdfPageImages`), so the
 * source PDF is never stored and visitors get page images only.
 */

/** Wide enough for scanned text at the reader's 2x zoom, without multi-MB pages. */
export const PAGE_WIDTH = 1600
/** The public preview: sharp on a phone, light enough for a link card. */
export const COVER_WIDTH = 1000
/**
 * The largest canvas iOS Safari will draw (16.7M pixels). A tall page at the
 * full width would exceed it and render blank, so it is drawn smaller.
 */
const MAX_CANVAS_PIXELS = 16_000_000

/** A password-protected PDF, which cannot be read without the password. */
export class PdfLockedError extends Error {
  constructor() {
    super("This PDF is password-protected.")
    this.name = "PdfLockedError"
  }
}

/** The scale that renders a page `width` wide, kept under the canvas cap. */
export function renderScale(
  pageWidth: number,
  pageHeight: number,
  width: number
): number {
  if (!(pageWidth > 0) || !(pageHeight > 0)) return 1
  const wanted = width / pageWidth
  const ceiling = Math.sqrt(MAX_CANVAS_PIXELS / (pageWidth * pageHeight))
  return Math.min(wanted, ceiling)
}

type Pdfjs = typeof import("pdfjs-dist")
type PdfDocument = Awaited<ReturnType<Pdfjs["getDocument"]>["promise"]>

async function loadPdfjs(): Promise<Pdfjs> {
  if (typeof document === "undefined")
    throw new Error("PDF rendering only runs in a browser.")
  const pdfjs = await import("pdfjs-dist")
  if (!pdfjs.GlobalWorkerOptions.workerSrc)
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString()
  return pdfjs
}

/** Opens a PDF; the caller destroys the task when done with it. */
async function openPdf(file: File) {
  const pdfjs = await loadPdfjs()
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  })
  try {
    return { task, doc: await task.promise }
  } catch (error) {
    await task.destroy()
    if ((error as { name?: string } | null)?.name === "PasswordException")
      throw new PdfLockedError()
    throw error
  }
}

/** WebP where the browser can encode it (smaller, sharper text), else JPEG. */
async function encode(canvas: HTMLCanvasElement): Promise<Blob> {
  const as = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
  const webp = await as("image/webp", 0.82)
  // Browsers without a WebP encoder hand back a PNG instead of failing.
  if (webp?.type === "image/webp") return webp
  const jpeg = await as("image/jpeg", 0.85)
  if (!jpeg) throw new Error("The page could not be encoded.")
  return jpeg
}

async function renderPage(
  doc: PdfDocument,
  number: number,
  width: number
): Promise<File> {
  const page = await doc.getPage(number)
  const canvas = document.createElement("canvas")
  try {
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({
      scale: renderScale(base.width, base.height, width),
    })
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({ canvas, viewport }).promise
    const blob = await encode(canvas)
    const extension = blob.type === "image/webp" ? "webp" : "jpg"
    return new File([blob], `page-${number}.${extension}`, { type: blob.type })
  } finally {
    // Zeroing the size frees the bitmap now; Safari otherwise holds every
    // canvas until a later collection and runs out of canvas memory.
    canvas.width = 0
    canvas.height = 0
    page.cleanup()
  }
}

/**
 * The page count and the first page as a preview image, from one read of
 * the file. The preview is null when page one will not render; the count
 * still stands.
 */
export async function inspectPdf(
  file: File
): Promise<{ pages: number; cover: File | null }> {
  const { task, doc } = await openPdf(file)
  try {
    return {
      pages: doc.numPages,
      cover: await renderPage(doc, 1, COVER_WIDTH).catch(() => null),
    }
  } finally {
    await task.destroy()
  }
}

/**
 * Each page as an image, one at a time, so a 300-page PDF never holds more
 * than a page in memory. Stops quietly when `signal` aborts.
 */
export async function* pdfPageImages(
  file: File,
  maxPages: number,
  signal?: AbortSignal
): AsyncGenerator<{ file: File; number: number; total: number }> {
  const { task, doc } = await openPdf(file)
  try {
    const total = Math.min(doc.numPages, maxPages)
    for (let number = 1; number <= total; number++) {
      if (signal?.aborted) return
      yield { file: await renderPage(doc, number, PAGE_WIDTH), number, total }
    }
  } finally {
    await task.destroy()
  }
}
