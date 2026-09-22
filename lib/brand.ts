/**
 * Real, sourced ICT material.
 *
 * Pulled from ICT's own public channels on 10 and 11 Sep 2026: the YouTube
 * channel (UCeeCwaaW0pfiIGwtLqV88iQ), its lecture thumbnails, the Play Store
 * listing, and ICT's Feb 2025 admissions reel. Selection serials come from the
 * official APSC CCE 2022 result PDF.
 *
 * Rule: nothing here is invented. Anything proposed by us rather than
 * published by ICT is marked `confirmed: false` and listed in `toConfirm` at
 * the bottom, so the owner can sign it off in one pass.
 */

export const brand = {
  legalName: "Impact Career Tutorials",
  shortName: "ICT",
  logo: "/brand/ict-logo-tight.png",
  /** the I-beam and pen nib from the logo, used alone where space is tight */
  mark: "/brand/ict-mark.png",
  banner: "/brand/ict-channel-banner.jpg",
} as const

export const place = {
  street: "D C Bunglow Road, Ward no 8",
  city: "North Lakhimpur",
  region: "Assam",
  pin: "787001",
  spoken: "DC Bungalow Road",
  lat: 27.2381231,
  lng: 94.1028255,
  maps: "https://goo.gl/maps/GibauAfFg2BBtdRu9",
} as const

export const contact = {
  phones: ["+918638061175", "+918134995880"] as const,
  whatsapp: "+918638061175",
  email: "impactcareertutorials@gmail.com",
} as const

export const links = {
  login: "https://web.impactcareertutorials.in/login?orgCode=ypzir",
  play: "https://play.google.com/store/apps/details?id=co.jones.ypzir",
  instagram: "https://www.instagram.com/impactcareer.tutorials/",
  facebook: "https://www.facebook.com/profile.php?id=100087918991624",
  youtube: "https://www.youtube.com/@impactcareertutorials",
  apscResultPdf: "https://apsc.nic.in/misc_2024/Results_CCE_2022_17012024.pdf",
} as const

export const app = {
  installs: "1,000+",
  rating: 4.23,
  ratingCount: 30,
} as const

/* -------------------------------------------------------------------------- */
/*  Offer                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The low-risk first step.
 *
 * This was a proposed "free demo class" until ICT's own storefront showed they
 * already run free workshops: Kouxal for APSC and ABHIGYAN for banking, both
 * listed at zero and both with real enrolments. Pointing at something the
 * institute actually sells beats inventing an offer for them.
 */
export const offer = {
  cta: "Join a free workshop",
  short: "Join free",
  promise: "Start with a free workshop. Pay only when you pick a batch.",
  confirmed: true,
} as const

/** The next batch with a published start date, used for honest urgency. */
export const nextBatch = {
  /** ICT writes it "VICTOR 8.0" on their own storefront, so we do too. */
  name: "VICTOR 8.0",
  exam: "ADRE and Assam Police SI",
  startsOn: "2026-09-14",
  timing: "8 to 10 AM",
  forWho: "working professionals",
} as const

/* -------------------------------------------------------------------------- */
/*  People                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Faculty. Each portrait is cropped from a lecture thumbnail that carries the
 * teacher's own name, and each `lecture` is a video they personally present,
 * so the face, the name, and the class always match.
 */
export const faculty = [
  {
    slug: "raheef",
    name: "Raheef Aowal",
    called: "Raheef Sir",
    teaches: "Geography and GS",
    note: "Founder. Runs the Warrior mock discussions.",
    portrait: "/faculty/raheef.jpg",
    lecture: "PcIFQy3R_HA",
  },
  {
    slug: "pallabi",
    name: "Pallabi Neog",
    called: "Pallabi Ma'am",
    teaches: "Assam GK, art and culture",
    note: "Leads the Brahmastra crash course.",
    portrait: "/faculty/pallabi.jpg",
    lecture: "L0sPmVPMHS4",
  },
  {
    slug: "harkaran",
    name: "Harkaran Singh",
    called: "Harkaran Sir",
    teaches: "Polity and current affairs",
    note: "Senior faculty.",
    portrait: "/faculty/harkaran.jpg",
    lecture: "uwd46GrbC6o",
  },
  {
    slug: "tulika",
    name: "Tulika Dutta",
    called: "Tulika Ma'am",
    teaches: "English",
    note: "ADRE and Assam Police English.",
    portrait: "/faculty/tulika.jpg",
    lecture: "Zqyp1GIAXbQ",
  },
  {
    slug: "rituraj",
    name: "Rituraj Gogoi",
    called: "Rituraj Sir",
    teaches: "Maths and reasoning",
    note: "B.Tech, former Bank PO.",
    portrait: "/faculty/rituraj.jpg",
    lecture: "YRaUgheQb7Y",
  },
] as const

export type FacultySlug = (typeof faculty)[number]["slug"]

export function facultyBySlug(slug: FacultySlug) {
  return faculty.find((person) => person.slug === slug)!
}

/**
 * APSC CCE 2022, result dated 17 Jan 2024. Serials verified against the
 * official PDF. Both are also listed by SPM IAS Academy, so the copy says they
 * prepared at ICT, never that ICT alone produced them.
 */
export const selections = [
  {
    name: "Priyanka Saikia",
    post: "Assam Police Service",
    serial: 46,
    quote:
      "Sir, your guidance was never just about strategy or study plans. It was about belief and self-confidence.",
  },
  {
    name: "Amitesh Rajkhowa",
    post: "Assam Urban Administrative Service",
    serial: 31,
    quote:
      "The vision of ICT is a culture of group study in the library, which makes the preparation engaging and competitive from the beginning.",
  },
] as const

/**
 * Real testimonials only. Selection quotes are from officers on the APSC list.
 * Reviews are from the ICT app's public Play Store listing, word for word except
 * one typo ("dedicates") corrected. The listing does not expose reviewer names,
 * so the source is credited instead of a made-up person.
 *
 * TODO: ICT's Instagram carries student video testimonials. Export them from a
 * logged-in session and add them here; they are the strongest proof ICT has.
 */
export const testimonials = [
  {
    quote: selections[0].quote,
    name: selections[0].name,
    role: `${selections[0].post}, serial ${selections[0].serial}`,
    verified: true,
  },
  {
    quote:
      "One of the finest institutes in Assam for different competitive exams like APSC and Banking with dedicated faculty and quality study environment.",
    name: "Review on the ICT app",
    role: "Google Play",
    verified: false,
  },
  {
    quote: selections[1].quote,
    name: selections[1].name,
    role: `${selections[1].post}, serial ${selections[1].serial}`,
    verified: true,
  },
  {
    quote:
      "Awesome app with great content. Superb learning experience. Really really helpful!!",
    name: "Review on the ICT app",
    role: "Google Play",
    verified: false,
  },
] as const

/* -------------------------------------------------------------------------- */
/*  Courses and what they include                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fee presentation. The figures themselves live in `lib/catalogue.ts`, synced
 * from the store that takes the payment, so the site cannot quote a price the
 * checkout disagrees with.
 */
export const fees = {
  unit: "one time",
  note: "One fee per course, including tests, notes and the app.",
  scholarship: "Scholarships through ICT's ASSIST test.",
} as const

/**
 * Three tracks, each pointing at real courses in ICT's Classplus catalogue.
 *
 * Names, prices and feature lists come from `lib/catalogue.ts`, snapshotted
 * from the store that actually takes the payment, so the site cannot quote a
 * price the checkout disagrees with. Run `bun run sync:courses` to refresh.
 *
 * The older Victor 5.0, 6.0 and 7.0 batches stay out of the page: they are
 * previous intakes, and listing them would make the current one ambiguous.
 */
export const tracks = [
  {
    slug: "apsc",
    exam: "APSC",
    full: "Assam Civil Services",
    covers: "Prelims, Mains, and the Interview",
    duration: "Till selection",
    flagshipId: 886514, // Lakhya 2027
    alsoIds: [804860, 891842], // PRAGATI 2027 working professionals, ARJUNA mains mocks
    freeId: 893950, // Kouxal free APSC workshop
    faculty: ["raheef", "pallabi", "harkaran"] as FacultySlug[],
    sample: { id: "L0sPmVPMHS4", views: 3400 },
    startsOn: null as string | null,
  },
  {
    slug: "adre",
    exam: "ADRE and Assam Police",
    full: "Assam Direct Recruitment and Police SI",
    covers: "GK, polity, English, maths, and reasoning",
    duration: "200+ hours",
    flagshipId: 896874, // VICTOR 8.0
    alsoIds: [],
    freeId: null as number | null,
    faculty: ["harkaran", "pallabi", "tulika"] as FacultySlug[],
    sample: { id: "uwd46GrbC6o", views: 264 },
    startsOn: nextBatch.startsOn as string | null,
  },
  {
    slug: "banking",
    exam: "Bank, SSC, Railway",
    full: "Banking, SSC and Railway NTPC",
    covers: "Maths, reasoning, English, and banking awareness",
    duration: "6 months",
    flagshipId: 869154, // Radiant 2.0
    alsoIds: [842621], // Diamond 3.0
    freeId: 703193, // ABHIGYAN free workshop
    faculty: ["rituraj", "tulika"] as FacultySlug[],
    sample: { id: "YRaUgheQb7Y", views: 79 },
    startsOn: null as string | null,
  },
] as const

export type Track = (typeof tracks)[number]

export function trackForCourse(id: number) {
  return tracks.find(
    (track) =>
      track.flagshipId === id ||
      (track.alsoIds as readonly number[]).includes(id) ||
      track.freeId === id
  )
}

/**
 * Courses that get their own page: every course a track points at. The older
 * Victor 5.0 to 7.0 intakes and the Rs 11 internship stay off the site.
 */
export const listedCourseIds = new Set(
  tracks.flatMap((track) =>
    [track.flagshipId, ...track.alsoIds, track.freeId].filter(
      (id): id is number => id !== null
    )
  )
)

/**
 * Timings and dates, read off ICT's own course posters, since the storefront
 * listing does not carry them. Each line is what the poster prints.
 */
export const schedules: Record<
  number,
  { when: string; days?: string; note?: string }
> = {
  886514: {
    when: "12 to 2 PM",
    days: "Monday to Saturday",
    note: "Batch started in August",
  }, // Lakhya 2027
  804860: { when: "6 to 8 PM", note: "Built for working professionals" }, // PRAGATI 2027
  896874: { when: "8 to 10 AM", note: "New batch from 14 September" }, // VICTOR 8.0
  893950: {
    when: "4 to 5:30 PM",
    note: "Ran 2 to 4 September; still free on the app",
  }, // Kouxal
}

/**
 * What a batch includes, taken from the Lakhya 2027 listing on ICT's own
 * storefront. These are the institute's current published claims, not an
 * archived reel, which is why the hostel and the 20+20 mock tests appear here.
 */
export const included = [
  { text: "Covers Prelims, Mains and the Interview", source: "store" },
  { text: "20 Prelims and 20 Mains mock tests", source: "store" },
  {
    text: "Attend offline, or online in the digital classroom",
    source: "store",
  },
  { text: "Library and study space with WiFi", source: "store" },
  { text: "Hostel accommodation", source: "store" },
  { text: "Mentorship and guidance till selection", source: "store" },
  { text: "Faculty with 5+ years of experience", source: "store" },
  { text: "Every class recorded on the ICT app", source: "yt" },
] as const

/** Programmes that visibly run on the channel. */
export const programmes = [
  "Warrior",
  "Brahmastra",
  "Astra Series",
  "Axom Dhwani",
] as const

/* -------------------------------------------------------------------------- */
/*  Lectures                                                                  */
/* -------------------------------------------------------------------------- */

/** Real lectures, ordered by real view count on 10 Sep 2026. */
export const lectures = [
  {
    id: "L0sPmVPMHS4",
    title: "Schemes and projects of Assam",
    by: "Pallabi Neog",
    views: 3400,
  },
  {
    id: "ffM0cE-ejMU",
    title: "Species in news, APSC Prelims 2026",
    by: "Pallabi Neog",
    views: 1100,
  },
  {
    id: "Y0d2rnN4Cw0",
    title: "Personalities in news 2026",
    by: "ICT",
    views: 727,
  },
  {
    id: "0nbXmaZ-jk0",
    title: "Walk the Talk with Rupamoni Gorh",
    by: "Axom Dhwani podcast",
    views: 666,
  },
  {
    id: "PcIFQy3R_HA",
    title: "Warrior mock test III, discussion",
    by: "Raheef Aowal",
    views: 513,
  },
  {
    id: "fDPHYxvK6C0",
    title: "Assamese women writers of the colonial period",
    by: "ICT",
    views: 429,
  },
  {
    id: "eOQ57ILnAvI",
    title: "Assam Budget 2026 to 27, explained",
    by: "ICT",
    views: 309,
  },
  {
    id: "PxRD1RhYOb8",
    title: "Running water landforms, in Assamese",
    by: "Raheef Aowal",
    views: 261,
  },
] as const

export function lectureStill(id: string) {
  return `/yt/${id}.jpg`
}

/* -------------------------------------------------------------------------- */
/*  Proof, joining, questions                                                 */
/* -------------------------------------------------------------------------- */

/** Every number links to the public page where it can be checked. */
export const proof = [
  {
    value: 16200,
    display: "16.2K",
    label: "subscribers on the ICT YouTube channel",
    href: links.youtube,
  },
  {
    value: 1000,
    display: "1,000+",
    label: "installs of the ICT app on Google Play",
    href: links.play,
  },
  {
    value: 150,
    display: "150+",
    label: "hours of recorded classes on the app",
    href: links.youtube,
  },
  {
    value: 2,
    display: "2",
    label: "officers from ICT on the APSC CCE 2022 list",
    href: links.apscResultPdf,
  },
] as const

export const joining = [
  {
    verb: "Message or call",
    body: "Tell us the exam and the time of day you can study. We reply the same day.",
  },
  {
    verb: "Sit in on a class",
    body: "Attend a real class with the batch you are considering, at no cost.",
  },
  {
    verb: "Pick your batch",
    body: "Choose morning, day, or night, offline or on the app. Fees are fixed then.",
  },
] as const

export const timings = [
  "Morning",
  "Day",
  "Evening",
  "Night",
  "Online only",
] as const

export const faqs = [
  {
    q: "What are the fees?",
    a: "The complete APSC course (Lakhya 2027) is Rs 25,009. ADRE and Assam Police (VICTOR 8.0) is Rs 6,009, and the Banking, SSC and Railway batch is Rs 7,009. One fee covers classes, tests, notes and the app. Scholarships are available through ICT's ASSIST test.",
  },
  {
    q: "Can I attend a class before I pay?",
    a: "Yes. ICT runs free workshops, Kouxal for APSC and ABHIGYAN for Banking, SSC and Railway, and both are listed free on the ICT app. You can also watch full lectures by the same faculty on the YouTube channel.",
  },
  {
    q: "I have a job. Is there a batch that fits?",
    a: "Two. PRAGATI 2027 is ICT's APSC batch built for working professionals, and VICTOR 8.0 runs 8 to 10 AM for ADRE and Assam Police.",
  },
  {
    q: "What happens if I miss a class?",
    a: "Every class is recorded on the ICT app the same day, along with notes and tests, so you can catch up from your phone.",
  },
  {
    q: "Are classes in Assamese or English?",
    a: "Both. The ARJUNA mains mock series is set in English and Assamese, and classes mix the two so nobody is left behind.",
  },
  {
    q: "Can I study online from outside North Lakhimpur?",
    a: "Yes. Classes run hybrid, offline at the centre and live on the ICT Android app, with the same faculty and tests.",
  },
  {
    q: "Is there a library or a hostel?",
    a: "The centre has a library with WiFi and study material, open to enrolled students. Ask about hostel availability when you enquire.",
  },
  {
    q: "Where exactly is the centre?",
    a: "D C Bunglow Road, Ward no 8, North Lakhimpur, Assam 787001. Open it in Google Maps from the contact section below.",
  },
] as const

/* -------------------------------------------------------------------------- */
/*  Posters                                                                   */
/* -------------------------------------------------------------------------- */

export type Poster = {
  /** file in public/posters */
  src: string
  alt: string
  kind: "result" | "batch"
  /** shown under the poster; keep it to what the poster actually shows */
  caption: string
  /** true only where the claim is checkable in a primary source */
  verified?: boolean
}

/**
 * ICT designs result and admission posters every month for Instagram. They are
 * finished, authentic proof that costs the institute nothing to hand over, and
 * "send the poster on WhatsApp" is a workflow an owner will actually keep up.
 *
 * Drop files into public/posters and add a row here. The section hides itself
 * while this is empty.
 *
 * Before adding a result poster, check its claim against the official result.
 * ICT's own material has carried a rank that the APSC PDF does not support, so
 * a poster can republish a claim the rest of this site deliberately avoids.
 */
export const posters: Poster[] = []

/* -------------------------------------------------------------------------- */
/*  Links and helpers                                                         */
/* -------------------------------------------------------------------------- */

export function youtubeWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

/*
 * The five wa.me/tel helpers that used to live here moved to lib/contact.ts.
 * They were shallow - five builders differing only by message string - and
 * every call site had to pick one, then repeat target/rel itself, so adding
 * a single analytics event meant editing eleven files. Callers now state an
 * EnquiryIntent and one module owns the wording, the encoding and the channel.
 */

/** "+918638061175" -> "+91 86380 61175" */
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10)
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

/**
 * Everything on the site that ICT has not published itself. Hand this to the
 * owner as the sign-off checklist.
 */
export const toConfirm = [
  "Spelling: Pallabi vs Pallavi Neog",
  "Same-day reply promise (joining[0])",
  "Whether the older Victor 5.0 to 7.0 batches should appear anywhere",
  "PRAGATI 2027's poster claims 20+ selections in APSC CCE 2023-26; we could not verify it, and the poster is shown on its page",
  "Radiant 2.0 and Diamond 3.0 timings are not on their posters",
  "Whether the Play Store listing is still live (Classplus reports the Android app as delisted)",
  "Opening hours for the centre; /contact omits them because none is recorded anywhere",
  "Whether ICT has a Telegram channel; the spec lists one as a contact channel and no link exists",
  "Wording of the four policy documents in lib/policies.ts; all four are drafts and stay noindex until approved",
  "Delivery areas, charges and dispatch times, and the cancellation and refund policy, before online ordering opens",
  // The library page has its own list, kept beside the content it gates:
  // `libraryQuestions` in lib/library.ts.
] as const
