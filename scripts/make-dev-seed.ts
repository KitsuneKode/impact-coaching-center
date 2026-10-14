/**
 * Writes the development fixtures: `dev-seed.json`, ICT as it might look a
 * few months after launch, and `dev-seed.worst.json`, the same shapes filled
 * with the longest, shortest and oddest values real people and ICT's own
 * admin can produce (break-ui). Seeded randomness, so a run is repeatable.
 *
 *   bun run scripts/make-dev-seed.ts
 *   bun run seed:dev            # realistic
 *   bun run seed:dev --worst    # worst case
 *   bun run seed:dev --huge     # realistic plus 1,200 extra enquiries
 */

const here = new URL(".", import.meta.url).pathname

function random(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = random(20261014)
const pick = <T>(items: readonly T[]) =>
  items[Math.floor(rand() * items.length)]!
const weighted = <T>(items: readonly (readonly [T, number])[]) => {
  const total = items.reduce((sum, [, w]) => sum + w, 0)
  let roll = rand() * total
  for (const [item, w] of items) if ((roll -= w) <= 0) return item
  return items[0]![0]
}
const round = (n: number, places = 2) =>
  Math.round(n * 10 ** places) / 10 ** places

const FIRST = [
  "Nabajyoti",
  "Priyanka",
  "Pranjal",
  "Arup Jyoti",
  "Utpal Kumar",
  "Parag Moni",
  "Bhaswati",
  "Dipankar",
  "Rupjyoti",
  "Mousumi",
  "Jyotishmita",
  "Anurag",
  "Bitupan",
  "Chandana",
  "Debajit",
  "Gitanjali",
  "Himangshu",
  "Indrani",
  "Juri",
  "Kaustav",
  "Lakhyajit",
  "Manashi",
  "Nilutpal",
  "Pallabi",
  "Rajdeep",
  "Sanjib",
  "Trishna",
  "Uddipan",
  "Barnali",
  "Kangkana",
  "Dhruba",
  "Rimpi",
  "Saurav",
  "Jahnabi",
  "Ankita",
  "Bikash",
  "Momi",
  "Rahul",
  "Prerana",
  "Farhana",
  "Imran",
  "Nazma",
  "Mridul",
  "Tanmoy",
  "Hiyashree",
  "Bhargav",
]
const LAST = [
  "Saikia",
  "Bora",
  "Gogoi",
  "Das",
  "Nath",
  "Hazarika",
  "Baruah",
  "Dutta",
  "Kalita",
  "Sharma",
  "Borah",
  "Phukan",
  "Konwar",
  "Chetia",
  "Deuri",
  "Doley",
  "Pegu",
  "Mili",
  "Kutum",
  "Bhuyan",
  "Sonowal",
  "Rajkhowa",
  "Gohain",
  "Handique",
  "Ahmed",
  "Rahman",
  "Deka",
  "Bordoloi",
  "Kakoti",
  "Taye",
]
const TRACKS = [
  ["APSC", 5],
  ["ADRE and Assam Police", 4],
  ["Bank, SSC, Railway", 2],
  ["Not sure yet", 1],
] as const
const TIMINGS = ["Morning", "Day", "Evening", "Night", "Online only"] as const
const NOTES = [
  "Asked whether the night batch has a separate fee.",
  "Wants to know the next free mock test date.",
  "Working at a bank in Dhemaji; can only do evenings.",
  "Parent called on behalf of a daughter finishing B.A. this year.",
  "Asked for the Assamese set of books, not the English one.",
  "Wants to sit in on a class before paying.",
  "Cleared prelims last year; looking for mains answer writing only.",
  "Asked about hostel availability for a student from Majuli.",
  "Will visit the centre on Saturday with a friend.",
  "Asked if ASSIST scholarship applies to Victor 9.0.",
  "Needs EMI or two instalments for the fee.",
  "Prefers online; lives in Tezpur.",
  undefined,
  undefined,
]
const PAGES = [
  ["/", 4],
  ["/courses/lakhya-2027", 3],
  ["/courses/victor-9-0", 3],
  ["/courses", 2],
  ["/contact", 2],
  ["/as", 2],
  ["/as/courses/lakhya-2027", 1],
  ["/resources", 1],
  ["/courses#finder", 1],
] as const
type Utm = { source?: string; medium?: string; campaign?: string }
const UTMS: readonly (readonly [Utm | undefined, number])[] = [
  [undefined, 5],
  [{ source: "facebook", medium: "paid", campaign: "victor-9-launch" }, 3],
  [{ source: "instagram", medium: "paid", campaign: "lakhya-reels" }, 2],
  [{ source: "google", medium: "organic" }, 3],
  [{ source: "youtube", medium: "video", campaign: "free-workshop" }, 2],
]
const STAFF_NOTES_CHANNELS = [
  ["website", 9],
  ["whatsapp", 4],
  ["walk_in", 3],
  ["phone_call", 2],
  ["referral", 2],
  ["other", 1],
] as const

/* ---------------------------------------------------------- realistic --- */

function enquiries(count: number, phoneStart: number) {
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = round(Math.pow(rand(), 1.6) * 75)
    const leadStatus =
      daysAgo < 2
        ? weighted([
            ["new", 8],
            ["contacted", 2],
          ] as const)
        : daysAgo < 14
          ? weighted([
              ["new", 2],
              ["contacted", 4],
              ["interested", 3],
              ["enrolled", 1],
              ["lost", 1],
            ] as const)
          : weighted([
              ["contacted", 2],
              ["interested", 2],
              ["enrolled", 3],
              ["lost", 3],
            ] as const)
    const channel = weighted(STAFF_NOTES_CHANNELS)
    const open = leadStatus === "contacted" || leadStatus === "interested"
    return {
      name: `${pick(FIRST)} ${pick(LAST)}`,
      phone: `99999${String(phoneStart + i).padStart(5, "0")}`,
      leadStatus,
      interestTrack: weighted(TRACKS),
      daysAgo,
      note: pick(NOTES),
      verified: rand() < 0.35,
      channel,
      ...(channel === "website"
        ? {
            page: weighted(PAGES),
            ...(() => {
              const utm = weighted(UTMS)
              return utm ? { utm } : {}
            })(),
          }
        : {}),
      timing: pick(TIMINGS),
      ...(open ? { followUpInDays: round(rand() * 8 - 3, 1) } : {}),
    }
  })
}

const PLACES = [
  {
    line1: "House 14, Milanpur Path",
    city: "North Lakhimpur",
    pin: "787001",
    district: "Lakhimpur",
  },
  {
    line1: "Ward 6, Near Bihu Field",
    city: "Dhakuakhana",
    pin: "787055",
    district: "Lakhimpur",
  },
  {
    line1: "Qtr 3, Circuit House Road",
    city: "Dhemaji",
    pin: "787057",
    district: "Dhemaji",
  },
  {
    line1: "Near Railway Station",
    city: "Silapathar",
    pin: "787059",
    district: "Dhemaji",
  },
  {
    line1: "Bihpuria Chariali",
    city: "Bihpuria",
    pin: "784161",
    district: "Lakhimpur",
  },
  {
    line1: "Lane 2, Bhogdoi Bridge",
    city: "Jorhat",
    pin: "785001",
    district: "Jorhat",
  },
  {
    line1: "Mission Chariali",
    city: "Tezpur",
    pin: "784001",
    district: "Sonitpur",
  },
  {
    line1: "Flat 3B, Beltola Survey",
    city: "Guwahati",
    pin: "781028",
    district: "Kamrup Metro",
  },
]
const BUNDLE_SLUGS = [
  "apsc-foundation-set",
  "adre-police-set",
  "bank-ssc-railway-set",
  "apsc-mains-set",
]

function orders(count: number, people: { name: string; phone: string }[]) {
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = round(Math.pow(rand(), 1.4) * 45)
    const fulfilment = rand() < 0.62 ? "delivery" : "collection"
    const status =
      daysAgo < 1
        ? weighted([
            ["awaiting_payment", 2],
            ["paid", 5],
          ] as const)
        : daysAgo < 4
          ? fulfilment === "delivery"
            ? weighted([
                ["paid", 2],
                ["packed", 3],
                ["shipped", 3],
                ["awaiting_payment", 1],
              ] as const)
            : weighted([
                ["paid", 2],
                ["ready_for_collection", 4],
              ] as const)
          : fulfilment === "delivery"
            ? weighted([
                ["delivered", 6],
                ["shipped", 1],
                ["refunded", 1],
                ["cancelled", 1],
              ] as const)
            : weighted([
                ["collected", 6],
                ["ready_for_collection", 1],
                ["cancelled", 1],
              ] as const)
    const person = people[i % people.length]!
    const lines = [
      {
        bundle: pick(BUNDLE_SLUGS),
        language: weighted([
          ["en", 3],
          ["as", 2],
        ] as const),
        quantity: weighted([
          [1, 8],
          [2, 2],
          [3, 1],
        ] as const),
      },
    ]
    if (rand() < 0.2)
      lines.push({
        bundle: pick(BUNDLE_SLUGS.filter((s) => s !== lines[0]!.bundle)),
        language: "en",
        quantity: 1,
      })
    return {
      phone: person.phone,
      name: person.name,
      status,
      fulfilment,
      daysAgo,
      seen: daysAgo > 0.5 || rand() < 0.3,
      lines,
      ...(fulfilment === "delivery" ? { address: pick(PLACES) } : {}),
    }
  })
}

const books = [
  {
    slug: "assam-history-culture",
    exam: "APSC",
    contents: [
      "Ancient Assam",
      "The Ahom kingdom",
      "Colonial period",
      "Freedom movement",
      "Art, festivals and literature",
    ],
    editions: {
      en: {
        title: "Assam History and Culture",
        subtitle: "Study notes for APSC Prelims and Mains",
        edition: "2026 edition",
        pages: 240,
      },
      as: {
        title: "অসমৰ ইতিহাস আৰু সংস্কৃতি",
        subtitle: "APSC প্ৰাৰম্ভিক আৰু মুখ্য পৰীক্ষাৰ বাবে টোকা",
        edition: "২০২৬ সংস্কৰণ",
        pages: 252,
      },
    },
  },
  {
    slug: "polity-in-focus",
    exam: "APSC",
    contents: [
      "The Constitution",
      "Parliament",
      "Judiciary",
      "Federalism",
      "Local government in Assam",
    ],
    editions: {
      en: {
        title: "Polity in Focus",
        subtitle: "Indian polity for state exams",
        edition: "2026 edition",
        pages: 220,
      },
      as: {
        title: "ৰাজনীতি বিজ্ঞানৰ মূল কথা",
        subtitle: "ৰাজ্যিক পৰীক্ষাৰ বাবে ভাৰতীয় ৰাজনীতি",
        edition: "২০২৬ সংস্কৰণ",
        pages: 232,
      },
    },
  },
  {
    slug: "apsc-prelims-solved-papers",
    exam: "APSC",
    contents: ["2015 to 2024 papers", "Answer keys", "Topic index"],
    editions: {
      en: {
        title: "APSC Prelims Solved Papers",
        subtitle: "Ten years, explained",
        edition: "2026 edition",
        pages: 310,
      },
      as: {
        title: "APSC প্ৰাৰম্ভিক সমাধানসহ প্ৰশ্নকাকত",
        subtitle: "দহ বছৰৰ প্ৰশ্ন, ব্যাখ্যাসহ",
        edition: "২০২৬ সংস্কৰণ",
        pages: 318,
      },
    },
  },
  {
    slug: "assam-gk-capsule",
    exam: "ADRE and Assam Police",
    contents: [
      "Districts and rivers",
      "People and festivals",
      "Schemes",
      "Sports and awards",
    ],
    editions: {
      en: {
        title: "Assam GK Capsule",
        subtitle: "Quick revision for ADRE and Assam Police",
        edition: "2026 edition",
        pages: 160,
      },
      as: {
        title: "অসমৰ সাধাৰণ জ্ঞান",
        subtitle: "ADRE আৰু অসম আৰক্ষীৰ বাবে দ্ৰুত পুনৰীক্ষণ",
        edition: "২০২৬ সংস্কৰণ",
        pages: 168,
      },
    },
  },
  {
    slug: "adre-practice-papers",
    exam: "ADRE and Assam Police",
    contents: ["Twenty full mocks", "Answer keys", "Score tracker"],
    editions: {
      en: {
        title: "ADRE Practice Papers",
        subtitle: "Twenty full mocks",
        edition: "2026 edition",
        pages: 280,
      },
      as: {
        title: "ADRE অনুশীলন প্ৰশ্নকাকত",
        subtitle: "বিশটা সম্পূৰ্ণ নমুনা পৰীক্ষা",
        edition: "২০২৬ সংস্কৰণ",
        pages: 288,
      },
    },
  },
  {
    slug: "quant-and-reasoning-drills",
    exam: "Bank, SSC, Railway",
    contents: [
      "Number system",
      "Percentages and ratios",
      "Puzzles",
      "Seating arrangement",
      "Data interpretation",
    ],
    editions: {
      en: {
        title: "Quant and Reasoning Drills",
        subtitle: "For Bank, SSC and Railway NTPC",
        edition: "2026 edition",
        pages: 300,
      },
    },
  },
  {
    slug: "apsc-mains-answer-writing",
    exam: "APSC",
    contents: [
      "Reading the question",
      "Structure in 250 words",
      "Diagrams and maps",
      "Forty model answers",
    ],
    editions: {
      en: {
        title: "Mains Answer Writing",
        subtitle: "From question to 250 words",
        edition: "2026 edition",
        pages: 196,
      },
      as: {
        title: "মুখ্য পৰীক্ষাৰ উত্তৰ লিখন",
        subtitle: "প্ৰশ্নৰ পৰা ২৫০ শব্দলৈ",
        edition: "২০২৬ সংস্কৰণ",
        pages: 204,
      },
    },
  },
  {
    slug: "economy-of-assam",
    exam: "APSC",
    contents: [
      "Agriculture and tea",
      "Oil and industry",
      "Budget and schemes",
      "Flood and the economy",
    ],
    editions: {
      en: {
        title: "Economy of Assam",
        subtitle: "State economy for Mains GS III",
        edition: "2026 edition",
        pages: 176,
      },
      as: {
        title: "অসমৰ অৰ্থনীতি",
        subtitle: "মুখ্য পৰীক্ষাৰ বাবে ৰাজ্যৰ অৰ্থনীতি",
        edition: "২০২৬ সংস্কৰণ",
        pages: 184,
      },
    },
  },
  {
    slug: "current-affairs-yearbook-2026",
    exam: "APSC",
    contents: [
      "Assam",
      "India",
      "World",
      "Science and environment",
      "Sports and awards",
    ],
    editions: {
      en: {
        title: "Current Affairs Yearbook 2026",
        subtitle: "Twelve months, Assam first",
        edition: "2026",
        pages: 260,
      },
      as: {
        title: "সাম্প্ৰতিক ঘটনাৱলী ২০২৬",
        subtitle: "বাৰ মাহ, অসমক প্ৰাধান্য দি",
        edition: "২০২৬",
        pages: 268,
      },
    },
  },
]

const bundles = [
  {
    slug: "apsc-foundation-set",
    exam: "APSC",
    sortOrder: 1,
    soldCount: 148,
    title: { en: "APSC Foundation Set", as: "APSC ভেটি সংকলন" },
    tagline: {
      en: "History, polity and ten years of papers",
      as: "ইতিহাস, ৰাজনীতি আৰু দহ বছৰৰ প্ৰশ্নকাকত",
    },
    description: {
      en: "Everything for Prelims in the order you will study it: Assam history and culture, Indian polity, and ten years of solved papers with explanations.",
      as: "প্ৰাৰম্ভিক পৰীক্ষাৰ বাবে প্ৰয়োজনীয় সকলো, পঢ়াৰ ক্ৰম অনুসৰি: অসমৰ ইতিহাস আৰু সংস্কৃতি, ভাৰতীয় ৰাজনীতি আৰু ব্যাখ্যাসহ দহ বছৰৰ প্ৰশ্নকাকত।",
    },
    books: [
      "assam-history-culture",
      "polity-in-focus",
      "apsc-prelims-solved-papers",
    ],
    variants: {
      en: { priceRupees: 899, compareRupees: 1047, available: true },
      as: { priceRupees: 849, compareRupees: 997, available: true },
    },
  },
  {
    slug: "apsc-mains-set",
    exam: "APSC",
    sortOrder: 2,
    soldCount: 37,
    title: { en: "APSC Mains Set", as: "APSC মুখ্য পৰীক্ষাৰ সংকলন" },
    tagline: {
      en: "Answer writing, Assam's economy and the year's news",
      as: "উত্তৰ লিখন, অসমৰ অৰ্থনীতি আৰু বছৰৰ বাতৰি",
    },
    description: {
      en: "For those past Prelims: forty model answers, the state economy for GS III, and a current affairs yearbook that puts Assam first.",
      as: "প্ৰাৰম্ভিক পৰীক্ষা উত্তীৰ্ণসকলৰ বাবে: চল্লিশটা আৰ্হি উত্তৰ, GS III ৰ বাবে ৰাজ্যৰ অৰ্থনীতি আৰু অসমক প্ৰাধান্য দিয়া সাম্প্ৰতিক ঘটনাৱলী।",
    },
    books: [
      "apsc-mains-answer-writing",
      "economy-of-assam",
      "current-affairs-yearbook-2026",
    ],
    variants: {
      en: { priceRupees: 1099, compareRupees: 1299, available: true },
      as: { priceRupees: 999, compareRupees: 1199, available: true },
    },
  },
  {
    slug: "adre-police-set",
    exam: "ADRE and Assam Police",
    sortOrder: 3,
    soldCount: 231,
    title: { en: "ADRE and Assam Police Set", as: "ADRE আৰু অসম আৰক্ষী সংকলন" },
    tagline: {
      en: "GK capsule and twenty full mocks",
      as: "সাধাৰণ জ্ঞান আৰু বিশটা নমুনা পৰীক্ষা",
    },
    description: {
      en: "The Assam GK you are tested on, and twenty full-length mocks with answer keys and a score tracker.",
      as: "পৰীক্ষাত সোধা অসমৰ সাধাৰণ জ্ঞান, আৰু উত্তৰসহ বিশটা সম্পূৰ্ণ নমুনা পৰীক্ষা।",
    },
    books: ["assam-gk-capsule", "adre-practice-papers"],
    variants: {
      en: { priceRupees: 449, compareRupees: 540, available: true },
      as: { priceRupees: 449, available: true },
    },
  },
  {
    slug: "bank-ssc-railway-set",
    exam: "Bank, SSC, Railway",
    sortOrder: 4,
    soldCount: 64,
    title: { en: "Bank, SSC and Railway Set", as: "বেংক, SSC আৰু ৰেলৱে সংকলন" },
    tagline: { en: "Quant and reasoning drills", as: "গণিত আৰু যুক্তিৰ অনুশীলন" },
    description: {
      en: "Timed drills for the sections that decide the cut-off, with Assam GK for the state papers.",
      as: "কাট-অফ নিৰ্ধাৰণ কৰা অংশবোৰৰ বাবে সময়বদ্ধ অনুশীলন, ৰাজ্যিক পৰীক্ষাৰ বাবে অসমৰ সাধাৰণ জ্ঞানসহ।",
    },
    books: ["quant-and-reasoning-drills", "assam-gk-capsule"],
    variants: {
      en: { priceRupees: 499, available: true },
      as: { priceRupees: 499, available: false },
    },
  },
]

const resources = [
  {
    slug: "apsc-prelims-gs-paper-2024",
    title: "APSC Prelims GS Paper I, 2024",
    exam: "APSC",
    kind: "Question paper",
    description:
      "The 2024 General Studies paper with the commission's answer key.",
  },
  {
    slug: "apsc-prelims-csat-2024",
    title: "APSC Prelims CSAT, 2024",
    exam: "APSC",
    kind: "Question paper",
    description: "The aptitude paper, with worked solutions for the maths.",
  },
  {
    slug: "apsc-mains-gs-2023",
    title: "APSC Mains GS papers, 2023",
    exam: "APSC",
    kind: "Question paper",
    description: "All four GS papers from the 2023 Mains.",
  },
  {
    slug: "assam-current-affairs-september-2026",
    title: "Assam current affairs, September 2026",
    exam: "APSC",
    kind: "Current affairs",
    description: "The month's Assam news that APSC and ADRE ask about.",
  },
  {
    slug: "assam-current-affairs-august-2026",
    title: "অসমৰ সাম্প্ৰতিক ঘটনাৱলী, আগষ্ট ২০২৬",
    exam: "APSC",
    kind: "Current affairs",
    language: "as",
    description: "আগষ্ট মাহৰ অসমৰ গুৰুত্বপূৰ্ণ বাতৰি, পৰীক্ষাৰ দৃষ্টিৰে।",
  },
  {
    slug: "polity-one-page-notes",
    title: "Indian Polity one-page notes",
    exam: "ADRE and Assam Police",
    kind: "Notes",
    description: "Articles, bodies and amendments on one sheet each.",
  },
  {
    slug: "assam-geography-maps",
    title: "Assam geography with maps",
    exam: "ADRE and Assam Police",
    kind: "Notes",
    description: "Rivers, districts and national parks, map by map.",
  },
  {
    slug: "assam-history-timeline",
    title: "অসমৰ ইতিহাসৰ সময়ৰেখা",
    exam: "ADRE and Assam Police",
    kind: "Notes",
    language: "as",
    description: "আহোম ৰাজ্যৰ পৰা স্বাধীনতালৈ, এখন পৃষ্ঠাত।",
  },
  {
    slug: "adre-grade-3-paper-2023",
    title: "ADRE Grade III paper, 2023",
    exam: "ADRE and Assam Police",
    kind: "Question paper",
    description: "The 2023 Grade III paper with answers.",
  },
  {
    slug: "assam-police-si-mock-1",
    title: "Assam Police SI mock test 1",
    exam: "ADRE and Assam Police",
    kind: "Practice set",
    description: "One hundred questions, timed, with an answer key.",
  },
  {
    slug: "reasoning-warm-up-set",
    title: "Reasoning warm-up set",
    exam: "Bank, SSC, Railway",
    kind: "Practice set",
    description: "Twenty timed questions with worked answers.",
  },
  {
    slug: "quant-shortcuts",
    title: "Quant shortcuts for the prelims",
    exam: "Bank, SSC, Railway",
    kind: "Notes",
    description: "Percentages, ratios and averages, the fast way.",
  },
  {
    slug: "ssc-cgl-tier-1-2024",
    title: "SSC CGL Tier I, 2024",
    exam: "Bank, SSC, Railway",
    kind: "Question paper",
    description: "One shift's paper with the official key.",
  },
  {
    slug: "banking-awareness-october-2026",
    title: "Banking awareness, October 2026",
    exam: "Bank, SSC, Railway",
    kind: "Current affairs",
    description: "RBI, schemes and appointments for the month.",
  },
]

const posts = [
  {
    slug: "how-to-read-the-apsc-cce-notification",
    title: "How to read the APSC CCE notification before you pick a course",
    excerpt:
      "The notification answers most week-one questions: syllabus, dates and eligibility. Here is where to find each.",
    daysAgo: 6,
    body: "The APSC CCE notification is the single document every plan should start from.\n\n## What to check first\n\n- **Eligibility**: age limits, attempts, domicile rules.\n- **Syllabus**: the list of papers, not a coaching brochure.\n- **Dates**: application window, prelims, mains.\n\n## Then pick a batch\n\nOnce you know the dates, count back: Prelims in March means classes from August.",
  },
  {
    slug: "adre-3-syllabus-section-by-section",
    title: "ADRE 3.0 syllabus, section by section",
    excerpt:
      "General studies, Assam GK, English, maths and reasoning: what each section asks and how much time it deserves.",
    daysAgo: 12,
    body: "ADRE rewards breadth.\n\n## General studies\n\nHistory, polity and geography of India, with Assam in every part.\n\n## English\n\nGrammar and comprehension; twenty minutes a day is enough.\n\n## Maths and reasoning\n\nSpeed matters more than difficulty.",
  },
  {
    slug: "night-batch-for-working-people",
    title: "How the night batch works for people with a job",
    excerpt:
      "Classes from 8 to 10 PM, recordings the same night, and tests on Sundays.",
    daysAgo: 20,
    body: "Half of ICT's APSC students work.\n\n## The week\n\n- Classes Monday to Friday, 8 to 10 PM.\n- Recordings on the app by midnight.\n- A Sunday test, with results on Monday.",
  },
  {
    slug: "last-60-days-before-mains",
    title: "The last sixty days before APSC Mains",
    excerpt:
      "Answer writing every day, one mock a week, and nothing new after day fifty.",
    daysAgo: 33,
    body: "Sixty days is enough if you stop collecting material.\n\n## Days 1 to 30\n\nWrite two answers a day and get them checked.\n\n## Days 31 to 50\n\nOne full mock a week.\n\n## Days 51 to 60\n\nRevise your own notes only.",
  },
]

const campaigns = [
  {
    name: "Victor 9.0 strip",
    kind: "bar",
    tag: "New batch",
    headline: "Victor 9.0 is open.",
    body: "ADRE and Assam Police SI, recorded classes and files on the app.",
    cta: "See the batch",
    href: "/courses/victor-9-0",
    restDays: 3,
    delaySeconds: 0,
    priority: 10,
  },
  {
    name: "Free APSC workshop banner",
    kind: "banner",
    tag: "Free",
    headline: "Try an APSC class before you pay.",
    body: "Kouxal, ICT's free APSC workshop, is open on the app. Four classes with the same teachers as Lakhya 2027.",
    cta: "Join free",
    href: "/courses/kouxal",
    restDays: 7,
    delaySeconds: 0,
    priority: 20,
  },
]

const people = [
  { phone: "8134827648", name: "", role: "owner" },
  { phone: "9435279647", name: "", role: "student" },
  { phone: "9999900001", name: "Ritu Das", role: "staff" },
]

const realisticEnquiries = enquiries(96, 10001)
const buyers = realisticEnquiries.filter((_, i) => i % 3 === 0)

const README = [
  "Development fixture for the local Convex deployment. Loaded by `bun run seed:dev` (add --worst for the worst-case file, --huge for 1,200 extra enquiries).",
  "GENERATED by scripts/make-dev-seed.ts; edit that, then re-run it.",
  "Numbers are synthetic (99999 xxxxx) but valid Indian mobile format, so normalisation behaves as in production.",
  "`daysAgo` is relative, so a reseed always looks current; `followUpInDays` below zero is overdue.",
  "Everything is published and marked sample, and is replaced the moment the owner edits it. None of it reaches production: convex/devSeed.ts refuses any deployment that is not local or the named hosted dev deployment.",
]

await Bun.write(
  `${here}dev-seed.json`,
  `${JSON.stringify({ _README: README, people, enquiries: realisticEnquiries, orders: orders(26, buyers), books, resources, posts, bundles, campaigns }, null, 2)}\n`
)

/* --------------------------------------------------------- worst case --- */

const LONG_NAME = "Mohammed Abdul Hakim Mazumdar Choudhury" // a real naming pattern, 39 chars
const LONGEST_NAME =
  "Dr. Bhaskar Jyoti Mahanta Borgohain Phukan Rajkhowa (Retd. Principal)".slice(
    0,
    80
  ) // the form's limit
const worstEnquiries = [
  {
    name: LONGEST_NAME,
    phone: "9999920001",
    leadStatus: "new",
    interestTrack: "APSC CCE 2027 and ADRE 3.0, both if the timings allow",
    daysAgo: 0.02,
    note: "Called three times today. Wants the fee for Lakhya 2027 and Victor 9.0 together, asks whether the ASSIST scholarship can be applied to both, whether the hostel has a separate kitchen for vegetarians, and whether classes are recorded if he misses the Saturday ones because of his shop in Dhakuakhana. Please call back after 7 PM only; before that he is at the shop and cannot talk. Prefers Assamese.",
    verified: true,
    channel: "website",
    page: "/as/courses/lakhya-2027",
    utm: {
      source: "facebook",
      medium: "paid",
      campaign: "victor-9-launch-october-retargeting-lookalike-1pc",
    },
    timing: "Evening",
    followUpInDays: -2.5,
  },
  {
    name: "Jo",
    phone: "9999920002",
    leadStatus: "new",
    interestTrack: "Not sure yet",
    daysAgo: 0.1,
    channel: "whatsapp",
    timing: "Online only",
  },
  {
    name: "প্ৰাঞ্জল শৰ্মা",
    phone: "9999920003",
    leadStatus: "contacted",
    interestTrack: "ADRE and Assam Police",
    daysAgo: 1.2,
    note: "অসমীয়াতে কথা পাতিব বিচাৰে।",
    channel: "walk_in",
    timing: "Morning",
    followUpInDays: 0,
  },
  {
    name: LONG_NAME,
    phone: "9999920004",
    leadStatus: "interested",
    interestTrack: "Bank, SSC, Railway",
    daysAgo: 3,
    channel: "referral",
    referrer:
      "https://www.facebook.com/groups/assam.competitive.exams.preparation.group/permalink/1234567890123456/",
    timing: "Night",
    followUpInDays: 1,
  },
  {
    name: "RUPJYOTI KALITA",
    phone: "9999920005",
    leadStatus: "enrolled",
    interestTrack: "APSC",
    daysAgo: 9,
    channel: "phone_call",
    timing: "Day",
  },
  {
    name: "Riya 🌸",
    phone: "9999920006",
    leadStatus: "lost",
    interestTrack: "ADRE and Assam Police",
    daysAgo: 64,
    note: "Joined another institute.",
    channel: "whatsapp",
    timing: "Evening",
  },
  {
    name: "Ankita Deka",
    phone: "9999920007",
    leadStatus: "contacted",
    interestTrack: "APSC",
    daysAgo: 400,
    channel: "other",
    followUpInDays: -30,
  },
]

const LONG_EN =
  "General Studies Paper I: Indian and Assam History, Culture, Geography and the Freedom Movement, with Previous Years' Questions".slice(
    0,
    120
  )
const LONG_AS =
  "অসমৰ ইতিহাস, সংস্কৃতি আৰু ঐতিহ্য: প্ৰাচীন কালৰ পৰা আধুনিক যুগলৈ, পূৰ্বৰ বছৰৰ প্ৰশ্নসহ সম্পূৰ্ণ অধ্যয়ন সামগ্ৰী".slice(
    0,
    120
  )
const worstBooks = [
  {
    slug: "gs-paper-1-complete",
    exam: "APSC",
    contents: Array.from(
      { length: 24 },
      (_, i) =>
        `Chapter ${i + 1}: ${["Prehistoric Assam and the Kamarupa kingdom", "The Ahoms", "Moamoria rebellion", "Burmese invasions", "Treaty of Yandabo", "Tea and the colonial economy"][i % 6]}`
    ),
    editions: {
      en: {
        title: LONG_EN,
        subtitle:
          "Prelims, Mains and the Interview, with ten years of previous questions explained in Assamese and English",
        edition: "Revised and enlarged 2026–27 edition",
        pages: 1248,
      },
      as: {
        title: LONG_AS,
        subtitle: "প্ৰাৰম্ভিক, মুখ্য আৰু সাক্ষাৎকাৰ",
        edition: "সংশোধিত ২০২৬–২৭ সংস্কৰণ",
        pages: 1296,
      },
    },
  },
  {
    slug: "gk",
    exam: "ADRE and Assam Police",
    contents: ["GK"],
    editions: { en: { title: "GK", edition: "1", pages: 1 } },
  },
  ...books,
]
const worstBundles = [
  {
    slug: "everything-for-apsc-2027-complete-library",
    exam: "APSC",
    sortOrder: 1,
    soldCount: 12450,
    title: {
      en: "Everything for APSC 2027: the Complete Library",
      as: "APSC ২০২৭ ৰ বাবে সকলো: সম্পূৰ্ণ পুথিভঁৰাল",
    },
    tagline: {
      en: "Seven books for Prelims, Mains and the Interview, in the order ICT teaches them, with ten years of papers",
      as: "প্ৰাৰম্ভিক, মুখ্য আৰু সাক্ষাৎকাৰৰ বাবে সাতখন কিতাপ",
    },
    description: {
      en:
        "x".repeat(0) +
        "Every book ICT uses across the APSC year. ".repeat(14).trim(),
      as: "ICT ৰ সকলো কিতাপ। ".repeat(20).trim(),
    },
    books: [
      "gs-paper-1-complete",
      "assam-history-culture",
      "polity-in-focus",
      "apsc-prelims-solved-papers",
      "apsc-mains-answer-writing",
      "economy-of-assam",
      "current-affairs-yearbook-2026",
    ],
    variants: {
      en: { priceRupees: 12499, compareRupees: 15999, available: true },
      as: { priceRupees: 11999, available: true },
    },
  },
  {
    slug: "gk-set",
    exam: "ADRE and Assam Police",
    sortOrder: 2,
    soldCount: 1,
    title: { en: "GK", as: "GK" },
    description: { en: "One book.", as: "এখন কিতাপ।" },
    books: ["gk"],
    variants: {
      en: { priceRupees: 0, available: true },
      as: { priceRupees: 49, available: false },
    },
  },
  {
    slug: "out-of-stock-set",
    exam: "Bank, SSC, Railway",
    sortOrder: 3,
    soldCount: 0,
    title: { en: "Bank, SSC and Railway Set", as: "বেংক, SSC আৰু ৰেলৱে সংকলন" },
    description: {
      en: "Both editions are sold out until the reprint.",
      as: "পুনৰ ছপা নোহোৱালৈকে দুয়োটা সংস্কৰণ শেষ।",
    },
    books: ["quant-and-reasoning-drills"],
    variants: {
      en: { priceRupees: 499, available: false },
      as: { priceRupees: 499, available: false },
    },
  },
]
const worstResources = [
  {
    slug: "apsc-prelims-gs-paper-1-2015-to-2024-with-answer-keys-and-explanations",
    title:
      "APSC Prelims General Studies Paper I, all papers from 2015 to 2024, with the commission's answer keys and ICT explanations".slice(
        0,
        120
      ),
    exam: "APSC",
    kind: "Question paper",
    description: "Every Prelims paper of the last ten years. "
      .repeat(13)
      .slice(0, 600),
  },
  {
    slug: "x",
    title: "GK",
    exam: "ADRE and Assam Police",
    kind: "Notes",
    description: "",
  },
  {
    slug: "assam-current-affairs-long-assamese",
    title:
      "অসমৰ সাম্প্ৰতিক ঘটনাৱলী: চেপ্টেম্বৰ ২০২৬, APSC, ADRE আৰু অসম আৰক্ষীৰ বাবে বিশেষ সংখ্যা".slice(
        0,
        120
      ),
    exam: "APSC",
    kind: "Current affairs",
    language: "as",
    description: "মাহটোৰ সকলো গুৰুত্বপূৰ্ণ বাতৰি।",
  },
]
const worstOrders = [
  {
    phone: "9999920001",
    name: LONGEST_NAME,
    status: "awaiting_payment",
    fulfilment: "delivery",
    daysAgo: 0.05,
    seen: false,
    address: {
      line1:
        "House No. 123/B, Near Sri Sri Hari Mandir, Behind Lakhimpur Commerce College",
      line2: "Ward No. 12, Khelmati, Opposite the old Assam Type quarters",
      city: "North Lakhimpur",
      district: "Lakhimpur",
      pin: "787031",
    },
    lines: [
      {
        bundle: "everything-for-apsc-2027-complete-library",
        language: "en",
        quantity: 5,
      },
      {
        bundle: "everything-for-apsc-2027-complete-library",
        language: "as",
        quantity: 5,
      },
      { bundle: "gk-set", language: "en", quantity: 1 },
    ],
  },
  {
    phone: "9999920002",
    name: "Jo",
    status: "ready_for_collection",
    fulfilment: "collection",
    daysAgo: 2,
    seen: true,
    lines: [{ bundle: "gk-set", language: "en", quantity: 1 }],
  },
  {
    phone: "9999920003",
    name: "প্ৰাঞ্জল শৰ্মা",
    status: "refunded",
    fulfilment: "delivery",
    daysAgo: 30,
    seen: true,
    address: { line1: "গাঁও: বৰবাৰী", city: "ঢকুৱাখনা", pin: "787055" },
    lines: [{ bundle: "gk-set", language: "en", quantity: 1 }],
  },
]
const worstCampaigns = [
  {
    name: "Longest strip",
    kind: "bar",
    tag: "Admissions open".slice(0, 24),
    headline:
      "Lakhya 2027, Victor 9.0 and Target 2027 are open: book a free class this week".slice(
        0,
        90
      ),
    body: "",
    cta: "See every batch and fee",
    href: "/courses",
    restDays: 0,
    delaySeconds: 0,
    priority: 100,
  },
]
const worstPosts = [
  {
    slug: "a",
    title:
      "APSC CCE 2026 Prelims result: the full list of selected candidates from Lakhimpur and Dhemaji, and what comes next",
    excerpt:
      "A".repeat(0) +
      "Everything the result means for Mains. ".repeat(6).trim(),
    daysAgo: 0,
    body: "Short.",
  },
]

await Bun.write(
  `${here}dev-seed.worst.json`,
  `${JSON.stringify({ _README: ["Worst-case fixture (break-ui). Same shapes as dev-seed.json; loaded by `bun run seed:dev --worst`.", "Every value is plausible or sits at the limit the admin form and server accept."], people, enquiries: worstEnquiries, orders: worstOrders, books: worstBooks, resources: worstResources, posts: worstPosts, bundles: worstBundles, campaigns: worstCampaigns }, null, 2)}\n`
)

await Bun.write(
  `${here}dev-seed.huge.json`,
  `${JSON.stringify({ enquiries: enquiries(1200, 30001) })}\n`
)

console.log("Wrote dev-seed.json, dev-seed.worst.json and dev-seed.huge.json")
