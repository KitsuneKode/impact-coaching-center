/**
 * Print sign-in codes from the development deployment as they are sent.
 *
 *   bun run otp            recent codes, then keep watching
 *
 * Until the WhatsApp transport exists (KIT-46), the logger transport writes
 * each code to the Convex function log, and only a development deployment is
 * allowed to (lib/dev-deployment.ts). Reading them meant scrolling
 * `convex logs` for an `[otp]` line among Better Auth warnings; this shows
 * only the codes, one line each, newest last.
 *
 * It reads through the Convex CLI, so it needs the same deploy access as the
 * dashboard. Nothing here can reach a production deployment's codes, because
 * production never logs them.
 */
const OTP_LINE = /\[otp\] (\+91)(\d{5})(\d{5}): (\d{6})/

const proc = Bun.spawn(["bunx", "convex", "logs", "--history", "200"], {
  cwd: new URL("..", import.meta.url).pathname,
  stdout: "pipe",
  stderr: "inherit",
})

console.log("Watching for sign-in codes. Ctrl+C to stop.\n")

const decoder = new TextDecoder()
const reader = proc.stdout.getReader()
let buffer = ""
for (;;) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split("\n")
  buffer = lines.pop() ?? ""
  for (const line of lines) {
    const match = OTP_LINE.exec(line)
    if (!match) continue
    const [, cc, a, b, code] = match
    const when = line.slice(0, line.indexOf(" [")).trim()
    console.log(`${cc} ${a} ${b}  →  ${code}   (${when})`)
  }
}
