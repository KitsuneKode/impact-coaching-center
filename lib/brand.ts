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
 * The low-risk first step. Indian coaching converts on "come sit in a class",
 * not on "send us a message", because the visitor risks nothing.
 *
 * PROPOSED, not published by ICT. Confirm with the owner before launch. If ICT
 * does not run free demo classes, change `cta` to "Book a free counselling
 * call" and every button on the site follows.
 */
export const offer = {
  cta: "Book a free demo class",
  short: "Book a free class",
  promise: "Sit in on a real class first. You pay only when you pick a batch.",
  confirmed: false,
} as const

/** The next batch with a published start date, used for honest urgency. */
export const nextBatch = {
  name: "VICTOR8",
  exam: "ADRE 3.0 and Assam Police",
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
    quote: "Awesome app with great content. Superb learning experience. Really really helpful!!",
    name: "Review on the ICT app",
    role: "Google Play",
    verified: false,
  },
] as const

/* -------------------------------------------------------------------------- */
/*  Courses and what they include                                             */
/* -------------------------------------------------------------------------- */

/**
 * Durations are from ICT's apply site. No fee is published on any ICT channel,
 * so `fee` stays null until the owner provides it; the UI then shows the number
 * instead of the "ask for this batch's fee" link, with no other change.
 */
export const courses = [
  {
    slug: "apsc",
    exam: "APSC",
    full: "Assam Civil Services",
    duration: "12 months",
    covers: "Prelims, Mains, and the Interview",
    batches: [
      { name: "INDRA", note: "Prelims crash course" },
      { name: "NAKSHATRA", note: "Night batch" },
      { name: "DHANUSH", note: "Mains answer writing" },
      { name: "PRAGATI", note: "Taught in Assamese" },
    ],
    faculty: ["raheef", "pallabi", "harkaran"] as FacultySlug[],
    sample: { id: "L0sPmVPMHS4", views: 3400 },
    fee: null as string | null,
    startsOn: null as string | null,
  },
  {
    slug: "adre",
    exam: "ADRE 3.0 and Assam Police",
    full: "Grade III and IV posts, Assam Police constable and SI",
    duration: "12 months",
    covers: "GK, polity, English, maths, and reasoning",
    batches: [{ name: "VICTOR8", note: "8 to 10 AM, for working people" }],
    faculty: ["harkaran", "pallabi", "tulika"] as FacultySlug[],
    sample: { id: "uwd46GrbC6o", views: 264 },
    fee: null as string | null,
    startsOn: nextBatch.startsOn as string | null,
  },
  {
    slug: "banking",
    exam: "Bank, SSC, Railway",
    full: "National competitive exams",
    duration: "6 months",
    covers: "Quant, reasoning, English, and GS",
    batches: [],
    faculty: ["rituraj", "tulika"] as FacultySlug[],
    sample: { id: "YRaUgheQb7Y", views: 79 },
    fee: null as string | null,
    startsOn: null as string | null,
  },
] as const

export type Course = (typeof courses)[number]

/**
 * What a batch includes. Sources: YouTube channel "about" (yt), ICT's Feb 2025
 * admissions reel (reel). Reel claims are ICT's own marketing and should be
 * re-confirmed as current with the owner.
 */
export const included = [
  { text: "Classroom on DC Bungalow Road, or live on the ICT app", source: "yt" },
  { text: "Every class recorded on the app the same day", source: "yt" },
  { text: "Warrior mock tests with video discussion", source: "yt" },
  { text: "20 Prelims and 20 Mains mock tests for APSC", source: "reel" },
  { text: "Library with WiFi and study material", source: "yt" },
  { text: "Classes in Assamese and English", source: "reel" },
  { text: "Doubt support around the clock", source: "yt" },
  { text: "Mentorship until selection", source: "reel" },
  { text: "Interview guidance for APSC", source: "reel" },
  { text: "Hostel for outstation students", source: "reel" },
] as const

/** Programmes that visibly run on the channel. */
export const programmes = ["Warrior", "Brahmastra", "Astra Series", "Axom Dhwani"] as const

/* -------------------------------------------------------------------------- */
/*  Lectures                                                                  */
/* -------------------------------------------------------------------------- */

/** Real lectures, ordered by real view count on 10 Sep 2026. */
export const lectures = [
  { id: "L0sPmVPMHS4", title: "Schemes and projects of Assam", by: "Pallabi Neog", views: 3400 },
  { id: "ffM0cE-ejMU", title: "Species in news, APSC Prelims 2026", by: "Pallabi Neog", views: 1100 },
  { id: "Y0d2rnN4Cw0", title: "Personalities in news 2026", by: "ICT", views: 727 },
  { id: "0nbXmaZ-jk0", title: "Walk the Talk with Rupamoni Gorh", by: "Axom Dhwani podcast", views: 666 },
  { id: "PcIFQy3R_HA", title: "Warrior mock test III, discussion", by: "Raheef Aowal", views: 513 },
  { id: "fDPHYxvK6C0", title: "Assamese women writers of the colonial period", by: "ICT", views: 429 },
  { id: "eOQ57ILnAvI", title: "Assam Budget 2026 to 27, explained", by: "ICT", views: 309 },
  { id: "PxRD1RhYOb8", title: "Running water landforms, in Assamese", by: "Raheef Aowal", views: 261 },
] as const

export function lectureStill(id: string) {
  return `/yt/${id}.jpg`
}

/* -------------------------------------------------------------------------- */
/*  Proof, joining, questions                                                 */
/* -------------------------------------------------------------------------- */

/** Every number links to the public page where it can be checked. */
export const proof = [
  { value: 16200, display: "16.2K", label: "subscribers on the ICT YouTube channel", href: links.youtube },
  { value: 1000, display: "1,000+", label: "installs of the ICT app on Google Play", href: links.play },
  { value: 150, display: "150+", label: "hours of recorded classes on the app", href: links.youtube },
  { value: 2, display: "2", label: "officers from ICT on the APSC CCE 2022 list", href: links.apscResultPdf },
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

export const timings = ["Morning", "Day", "Evening", "Night", "Online only"] as const

export const faqs = [
  {
    q: "What are the fees?",
    a: "Fees are set per batch, so ICT gives you the exact figure for the batch you pick rather than a range. Ask on WhatsApp or at the centre. Scholarships are available through ICT's ASSIST scholarship test.",
  },
  {
    q: "Can I attend a class before I pay?",
    a: "Yes. Book a free demo class and sit in with the batch you are considering. You can also watch full lectures by the same faculty on the ICT YouTube channel.",
  },
  {
    q: "I have a job. Is there a batch that fits?",
    a: "VICTOR8 runs from 8 to 10 AM for ADRE 3.0 and Assam Police, built for working people. NAKSHATRA is the APSC night batch.",
  },
  {
    q: "What happens if I miss a class?",
    a: "Every class is recorded on the ICT app the same day, along with notes and tests, so you can catch up from your phone.",
  },
  {
    q: "Are classes in Assamese or English?",
    a: "Both. The PRAGATI batch is taught in Assamese, and most classes mix the two so nobody is left behind.",
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
/*  Links and helpers                                                         */
/* -------------------------------------------------------------------------- */

export function youtubeWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

export function whatsappHref(message: string) {
  return `https://wa.me/${contact.whatsapp.replace("+", "")}?text=${encodeURIComponent(message)}`
}

export const demoHref = whatsappHref(
  "Hello ICT, I would like to book a free demo class. Which batches have seats?"
)

export function courseDemoHref(course: Course) {
  return whatsappHref(`Hello ICT, I would like a free demo class for ${course.exam}.`)
}

export function courseFeeHref(course: Course) {
  return whatsappHref(`Hello ICT, what is the fee for the ${course.exam} batch?`)
}

export const callHref = `tel:${contact.phones[0]}`

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
  "Free demo class offer (offer.cta)",
  "Fees per course (courses[].fee)",
  "Hostel availability (included, faqs)",
  "20 Prelims + 20 Mains mocks, mentorship until selection (from Feb 2025 reel)",
  "Spelling: Pallabi vs Pallavi Neog",
  "Same-day reply promise (joining[0])",
] as const
