/**
 * The course finder: four questions, then the course that fits. Pure, so
 * the rules can be read and tested apart from the cards that ask them.
 */

export const FINDER_EXAMS = ["apsc", "adre", "banking", "unsure"] as const
export const FINDER_STAGES = ["starting", "some", "tests"] as const
export const FINDER_TIMES = ["morning", "day", "evening", "any"] as const
export const FINDER_MODES = ["centre", "app"] as const

export type FinderAnswers = {
  exam?: (typeof FINDER_EXAMS)[number]
  stage?: (typeof FINDER_STAGES)[number]
  time?: (typeof FINDER_TIMES)[number]
  mode?: (typeof FINDER_MODES)[number]
}

/** What the finder needs from a course; the public Course shape fits. */
export type FinderCourse = {
  slug: string
  name: string
  short: string
  subtitle: string
  track?: string
  free: boolean
  price: number
  createdAt?: number
  /** "6 to 8 PM", from ICT's admin or the old schedule list. */
  timing?: string
}

/** Why a course came up, said on its card. */
export type FinderReason =
  | "exam"
  | "free"
  | "tests"
  | "time"
  | "working"
  | "newest"

export type FinderPick = {
  course: FinderCourse
  score: number
  reasons: FinderReason[]
}

const TEST_SERIES = /\bmock\b|test series/i
const WORKING = /working|professional/i

/**
 * A programme and its edition from the short name: "Victor 9.0" is the
 * ninth Victor, "Lakhya 2027" the 2027 Lakhya. ClassPlus keeps old
 * editions listed; only the latest of each programme is the one to join.
 */
export function editionOf(short: string) {
  const match = short.trim().match(/^(.*?)[\s-]*v?(\d+(?:\.\d+)?)$/i)
  const stem = (match?.[1] || short).trim().toLowerCase()
  return { stem, version: match?.[1] ? Number(match[2]) : 0 }
}

/**
 * The hour a class starts, 0 to 23, from timings as ICT writes them:
 * "8 to 10 AM", "12 to 2 PM", "6 to 8 PM", "4 to 5:30 PM", "10 to 12 PM".
 * Only the end carries AM or PM, so the start borrows it unless that
 * would put the start after the end.
 */
export function startHour(timing: string | undefined): number | undefined {
  const match = timing?.match(
    /(\d{1,2})(?::\d{2})?\s*(am|pm)?\s*(?:to|-|–)\s*(\d{1,2})(?::\d{2})?\s*(am|pm)/i
  )
  if (!match) return undefined
  const start = Number(match[1])
  const end = Number(match[3])
  const endPm = match[4]!.toLowerCase() === "pm"
  if (start < 1 || start > 12 || end < 1 || end > 12) return undefined
  let pm: boolean
  if (match[2]) pm = match[2].toLowerCase() === "pm"
  else if (start === 12) pm = true
  else if (end === 12) pm = false
  else pm = start > end ? !endPm : endPm
  if (start === 12) return pm ? 12 : 0
  return pm ? start + 12 : start
}

/** Morning before 11, day until 3 PM, evening after. */
export function timeOfDay(timing: string | undefined) {
  const hour = startHour(timing)
  if (hour === undefined) return undefined
  return hour < 11 ? "morning" : hour < 15 ? "day" : "evening"
}

/** The courses minus older editions of a programme (Victor 8 once 9 is out). */
export function latestEditions<
  T extends Pick<FinderCourse, "short" | "track" | "free">,
>(courses: readonly T[]): T[] {
  const latest = new Map<string, number>()
  for (const course of courses) {
    const { stem, version } = editionOf(course.short)
    const key = `${course.track}:${stem}`
    latest.set(key, Math.max(latest.get(key) ?? -1, version))
  }
  return courses.filter((course) => {
    const { stem, version } = editionOf(course.short)
    return (
      course.free || version >= (latest.get(`${course.track}:${stem}`) ?? 0)
    )
  })
}

/**
 * The courses that fit the answers, best first, at most three. An exam
 * named narrows to its courses; "not sure" leads with the free workshops,
 * where nothing is lost by trying.
 */
export function recommend(
  courses: readonly FinderCourse[],
  answers: FinderAnswers,
  examOf: Record<string, string>
): FinderPick[] {
  const exam =
    answers.exam && answers.exam !== "unsure" ? examOf[answers.exam] : undefined
  // An older edition stays on the list below, never among the picks.
  const current = new Set(latestEditions(courses).map((c) => c.slug))
  return rankAll(courses, answers, examOf)
    .filter((pick) => current.has(pick.course.slug))
    .filter((pick) => !exam || pick.course.track === exam)
    .slice(0, 3)
}

/**
 * Every course, best fit first: what the courses page lists under the
 * finder, so nobody is shown one course and left to guess about the rest.
 * Courses for another exam stay, ranked below the chosen exam's.
 */
export function rankAll(
  courses: readonly FinderCourse[],
  answers: FinderAnswers,
  examOf: Record<string, string>
): FinderPick[] {
  const exam =
    answers.exam && answers.exam !== "unsure" ? examOf[answers.exam] : undefined
  const pool = courses.filter((course) => course.track)
  if (!pool.length) return []

  /* The latest edition of each programme. Different programmes for one
     exam (a foundation batch, a working people's batch) run side by side
     and do not compete on age; only Victor 8 behind Victor 9 is old. */
  const latest = new Map<string, number>()
  const editions = new Map<string, number>()
  for (const course of pool) {
    if (course.free) continue
    const { stem, version } = editionOf(course.short)
    const key = `${course.track}:${stem}`
    editions.set(key, (editions.get(key) ?? 0) + 1)
    latest.set(key, Math.max(latest.get(key) ?? -1, version))
  }

  const picks = pool.map((course): FinderPick => {
    const reasons: FinderReason[] = []
    let score = 0
    const series = TEST_SERIES.test(course.name)

    if (exam) {
      if (course.track === exam) {
        score += 10
        reasons.push("exam")
      } else score -= 20
    }

    if (answers.stage === "tests") {
      if (series) {
        score += 8
        reasons.push("tests")
      } else score -= 2
    } else if (series) score -= 8

    /* Not sure of the exam: a free workshop risks nothing. With an exam
       chosen, the batch is the answer and its free workshop is offered
       beside it (freeToTry), not instead of it. */
    if (course.free) {
      if (!exam) {
        score += 6
        reasons.push("free")
      } else score -= 3
    }

    const slot = timeOfDay(course.timing)
    if (answers.time && answers.time !== "any" && slot) {
      if (slot === answers.time) {
        score += 6
        reasons.push("time")
      } else score -= 3
    }
    if (
      answers.time === "evening" &&
      WORKING.test(`${course.name} ${course.subtitle}`)
    ) {
      score += 4
      reasons.push("working")
    }

    if (answers.mode === "centre" && slot) score += 1

    if (!course.free) {
      const { stem, version } = editionOf(course.short)
      const key = `${course.track}:${stem}`
      if (version < (latest.get(key) ?? version)) score -= 12
      else if ((editions.get(key) ?? 0) > 1) {
        score += 2
        reasons.push("newest")
      }
    }

    return { course, score, reasons }
  })

  return picks.toSorted(
    (a, b) =>
      b.score - a.score || (b.course.createdAt ?? 0) - (a.course.createdAt ?? 0)
  )
}

/**
 * The free workshop for the chosen exam, to try before paying: the one in
 * the hours picked when there are several. Null when the best fit is
 * already free, or the exam has none.
 */
export function freeToTry(
  courses: readonly FinderCourse[],
  answers: FinderAnswers,
  examOf: Record<string, string>
): FinderPick | null {
  const exam =
    answers.exam && answers.exam !== "unsure" ? examOf[answers.exam] : undefined
  if (!exam) return null
  const free = courses
    .filter((course) => course.free && course.track === exam)
    .map((course) => ({
      course,
      score: answers.time && timeOfDay(course.timing) === answers.time ? 1 : 0,
      reasons: ["free" as const],
    }))
    .toSorted((a, b) => b.score - a.score)
  return free[0] ?? null
}

/** The answers in English, for the WhatsApp message ICT reads. */
export function answersInEnglish(answers: FinderAnswers): string[] {
  const words: Record<string, string> = {
    apsc: "APSC",
    adre: "ADRE and Assam Police",
    banking: "Bank, SSC, Railway",
    unsure: "not sure of the exam yet",
    starting: "just starting",
    some: "studied some already",
    tests: "wants practice tests",
    morning: "mornings",
    day: "afternoons",
    evening: "evenings",
    any: "any time",
    centre: "at the centre",
    app: "on the app",
  }
  return [answers.exam, answers.stage, answers.time, answers.mode].flatMap(
    (answer) => (answer ? [words[answer]!] : [])
  )
}
