/**
 * Every public page answers, in both languages, against a running server:
 *   bun run smoke                 # http://localhost:3010
 *   bun run smoke https://…       # a preview or production URL
 * A typecheck and the unit tests do not render pages; this does, and a
 * page that throws while rendering comes back 500 here.
 */
export {}

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "")

const pages = [
  "/",
  "/courses",
  "/books",
  "/resources",
  "/exams",
  "/exams/calendar",
  "/contact",
  "/library",
  "/blog",
  "/success-stories",
  "/teachers",
  "/assist",
  "/privacy",
  "/terms",
  "/refunds",
  "/shipping",
]
/* English only by design: sign-in, checkout and the account sit outside the languages. */
const englishOnly = ["/login", "/checkout", "/account"]
const files = ["/sitemap.xml", "/robots.txt", "/humans.txt", "/api/search/en"]

const targets: [string, number][] = [
  ...pages.flatMap((path): [string, number][] => [
    [path, 200],
    [`/as${path === "/" ? "" : path}`, 200],
  ]),
  ...englishOnly.map((path): [string, number] => [path, 200]),
  ...files.map((path): [string, number] => [path, 200]),
  ["/this-page-does-not-exist", 404],
]

let failed = 0
for (const [path, want] of targets) {
  const response = await fetch(base + path, { redirect: "manual" }).catch(
    () => null
  )
  const got = response?.status ?? 0
  if (got !== want) failed += 1
  console.log(`${got === want ? "ok  " : "FAIL"} ${got} ${path}`)
}
console.log(failed ? `${failed} failed` : `all ${targets.length} answered`)
process.exit(failed ? 1 : 0)
