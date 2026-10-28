import { indexNowKey } from "@/lib/indexnow"

/** The IndexNow key file search engines fetch to trust our pings. */
export function GET() {
  const key = indexNowKey()
  return key
    ? new Response(key, { headers: { "Content-Type": "text/plain" } })
    : new Response("Not found", { status: 404 })
}
