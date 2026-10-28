import { brand, contact, faqs, place, schedules, tracks } from "@/lib/brand"
import { publishedBundles, publishedResources } from "@/lib/catalog-server"
import { inr } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"
import { exams, pick } from "@/lib/exams"
import { siteUrl } from "@/lib/site"

/** Rebuilt at most hourly, like the pages it summarises. */
export const revalidate = 3600

/**
 * /llms.txt: the site in plain Markdown for AI assistants and search
 * (llmstxt.org). The same facts the pages show, with links to them, so an
 * answer about coaching in North Lakhimpur can quote ICT accurately.
 */
export async function GET() {
  const [courses, bundles, resources] = await Promise.all([
    liveCourses(),
    publishedBundles().catch(() => []),
    publishedResources().catch(() => []),
  ])
  const url = (path: string) => `${siteUrl}${path}`
  const lines: string[] = [
    `# ${brand.legalName}`,
    "",
    `> Coaching in ${place.city}, ${place.region}, India, for APSC (Assam Civil Services), ADRE and Assam Police, and Bank, SSC and Railway exams. Classes at the centre on ${place.spoken} and live on the ICT app, in English and Assamese.`,
    "",
    `- Address: ${place.street}, ${place.city}, ${place.region} ${place.pin}`,
    `- Phone and WhatsApp: ${contact.phones.join(", ")}`,
    `- Email: ${contact.email}`,
    `- Assamese site: ${url("/as")}`,
    "",
    "## Courses",
    "",
  ]
  for (const track of tracks) {
    const list = courses.filter((c) => c.track === track.exam)
    if (!list.length) continue
    lines.push(`### ${track.exam}`, "")
    for (const course of list) {
      const when = course.timing ?? schedules[course.id]?.when
      lines.push(
        `- [${course.short}](${url(`/courses/${course.slug}`)}): ${course.free ? "free" : inr(course.price)}${when ? `, ${when}` : ""}${course.subtitle ? `. ${course.subtitle}` : ""}`
      )
    }
    lines.push("")
  }
  lines.push("## Exam guides", "")
  for (const exam of exams)
    lines.push(
      `- [${pick(exam.name, "en")}](${url(`/exams/${exam.slug}`)}): ${pick(exam.summary, "en")}`
    )
  lines.push("", `- [Exam calendar](${url("/exams/calendar")})`, "")
  const sets = bundles.filter((b) => !b.sample)
  if (sets.length) {
    lines.push("## Book sets", "")
    for (const set of sets)
      lines.push(
        `- [${set.title.en}](${url(`/books/${set.slug}`)}): ${set.exam}`
      )
    lines.push("")
  }
  const notes = resources.filter((r) => !r.sample)
  if (notes.length) {
    lines.push("## Free notes and papers", "")
    for (const note of notes.slice(0, 50))
      lines.push(
        `- [${note.title}](${url(`/resources/${note.slug}`)}): ${note.exam}`
      )
    lines.push("")
  }
  lines.push("## Questions", "")
  for (const faq of faqs)
    if (!faq.a.includes("{")) lines.push(`### ${faq.q}`, "", faq.a, "")
  lines.push(
    "## Pages",
    "",
    `- [Teachers](${url("/teachers")})`,
    `- [Results](${url("/success-stories")})`,
    `- [Library](${url("/library")})`,
    `- [ASSIST scholarship](${url("/assist")})`,
    `- [Contact](${url("/contact")})`,
    ""
  )
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
