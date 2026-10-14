import { indexable, siteUrl } from "@/lib/site"

/**
 * IndexNow: tells Bing (and through it ChatGPT search and Copilot), Yandex
 * and others that pages changed, minutes after an admin publishes rather
 * than whenever they next crawl. Needs INDEXNOW_KEY (any 8 to 128 letters,
 * digits or dashes) and an indexable production site; otherwise a no-op.
 */
export function indexNowKey() {
  const key = process.env.INDEXNOW_KEY
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null
}

export async function pingIndexNow(paths: string[]) {
  const key = indexNowKey()
  if (!key || !indexable || paths.length === 0) return
  const host = new URL(siteUrl).host
  const urlList = paths.flatMap((path) => [
    `${siteUrl}${path}`,
    `${siteUrl}/as${path === "/" ? "" : path}`,
  ])
  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${siteUrl}/indexnow-key.txt`,
      urlList,
    }),
  }).catch(() => {})
}
