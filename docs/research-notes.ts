/**
 * Sourced facts for the ICT pitch site. Research date 10 Sep 2026.
 * Never invent fees, hours, exclusive results, or extra toppers.
 */

export type ClaimLevel =
  | "official"
  | "first-party"
  | "social"
  | "institute-published"
  | "self-reported"
  | "directory"

export const brand = {
  legalName: "Impact Career Tutorials",
  shortName: "ICT",
  aliasUnverified: "Impact Coaching Center",
  instagramBio: "We create your tomorrow, today. Ace APSC & Govt exams with ICT.",
  seoTitle:
    "Best Coaching Courses for APSC, Bank, SSC & Assam TET | Impact Career Tutorials",
  youtubeAbout:
    "Impact Career Tutorials is a dedicated institute for your dreams.",
  youtubeAboutClaims:
    "APSC, Banking, SSC and other government competitive examinations. Experienced Faculty with 6+ years of experience. 24x7 mentorship and guidance. Online+Offline Hybrid Classes on App. Library facility with WiFi. 150+ hours of courses.",
  visual: {
    wordmark: "blue IMPACT, dark grey CAREER TUTORIALS",
    bars: "green",
    pen: "amber gold",
    field: "white",
  },
  logos: {
    mark: "/brand/ict-logo.png",
    wide: "/brand/ict-logo-wide.jpg",
    appIcon: "/brand/ict-app-icon.png",
  },
} as const

export const place = {
  line: "D C Bunglow Road, Ward no 8, North Lakhimpur, Assam 787001",
  localitySpoken: "DC Bungalow Road, North Lakhimpur",
  justdialAlsoSays: "NT Road",
  pin: "787001",
  mapsShort: "https://goo.gl/maps/GibauAfFg2BBtdRu9",
  lat: 27.2381231,
  lng: 94.1028255,
  mapsNote:
    "Coordinates come from Classplus footer JSON. A public Google Business Profile URL was not found in web search.",
  hoursPublished: null as string | null,
  justdialOpensHint: "Opens at 10:00 AM",
} as const

export const contact = {
  phones: ["+918638061175", "+918134995880"] as const,
  whatsapp: "+918638061175",
  workshopPromo: "+918638411050",
  email: "impactcareertutorials@gmail.com",
  classplusSupport: "support@classplus.co",
} as const

export const links = {
  site: "https://www.impactcareertutorials.in/",
  apply: "https://apply.impactcareertutorials.in/",
  login: "https://web.impactcareertutorials.in/login?orgCode=ypzir",
  courses: "https://www.impactcareertutorials.in/courses",
  play: "https://play.google.com/store/apps/details?id=co.jones.ypzir",
  instagram: "https://www.instagram.com/impactcareer.tutorials/",
  facebook: "https://www.facebook.com/profile.php?id=100087918991624",
  youtube: "https://www.youtube.com/@impactcareertutorials",
  threads: "https://www.threads.com/@impactcareer.tutorials",
  admissionsForm: "https://forms.gle/axsvhKohAWhA4ECR7",
  apscCce2022:
    "https://apsc.nic.in/misc_2024/Results_CCE_2022_17012024.pdf",
} as const

export const app = {
  name: "Impact Career Tutorials",
  packageId: "co.jones.ypzir",
  orgCode: "ypzir",
  orgId: "445114",
  platform: "Classplus Android white-label",
  iosBrandedApp: false,
  published: "2022-11-19",
  updated: "2026-08-06",
  installsBucket: "1,000+",
  rating: 4.23,
  ratingCount: 30,
  writtenReviewCount: 7,
  ads: false,
  youtubeSubscribersApprox: "16.2K",
  youtubeVideoCountApprox: "1K",
  instagramFollowersApprox: "15.6K",
  threadsFollowers: 325,
  facebookFollowers: null,
  screenshotsAreStockClassplus: true,
} as const

export const people = {
  mentor: {
    listingName: "Raheef Rasheed Aowal",
    spoken: "Raheef Sir",
    siteVariant: "Rasheef Sir",
    instagramLine: "Raheef Aowal (NIT Silchar, MS Germany)",
    educationLevel: "self-reported" as ClaimLevel,
  },
  facultyNamed: [
    { name: "Harkaran Singh", role: "Senior Faculty", level: "first-party" as ClaimLevel },
    { name: "Rituraj Gogoi", role: "NIT Silchar, former Bank PO", level: "social" as ClaimLevel },
    { name: "Pallabi Neog", role: "Faculty", level: "first-party" as ClaimLevel },
    { name: "Tulika Dutta", role: "Faculty", level: "first-party" as ClaimLevel },
  ],
} as const

export const selections = [
  {
    name: "Priyanka Saikia",
    post: "Assam Police Service",
    ictSaidRank: 47,
    officialSerial: 46,
    year: "CCE 2022",
    resultDate: "17 Jan 2024",
    roll: "3302048",
    hometown: "Lakhimpur",
    alsoClaimedBy: "SPM IAS Academy",
    quote:
      "Sir, your guidance was never just about strategy or study plans. It was about belief and self-confidence. This success is mine, yes, but it is also yours.",
    displayRank: "APSC CCE 2022, APS serial 46",
    level: "official" as ClaimLevel,
  },
  {
    name: "Amitesh Rajkhowa",
    post: "Assam Urban Administrative Service",
    ictSaidRank: 31,
    officialSerial: 31,
    year: "CCE 2022",
    resultDate: "17 Jan 2024",
    roll: "3300106",
    hometown: null,
    alsoClaimedBy: "SPM IAS Academy",
    quote:
      "The vision of ICT is a culture of group study in the library, which makes the preparation engaging and competitive from the beginning.",
    displayRank: "APSC CCE 2022, AUAS serial 31",
    level: "official" as ClaimLevel,
  },
] as const

export const courses = [
  {
    exam: "APSC",
    durationApply: "12 months",
    durationHome: "1 year, Prelims / Mains / Interview",
    namedBatches: [
      { name: "INDRA", blurb: "APSC Prelims crash" },
      { name: "NAKSHATRA", blurb: "Night batch for APSC" },
      { name: "DHANUSH", blurb: "APSC Mains answer writing" },
    ],
  },
  {
    exam: "ADRE",
    durationApply: "12 months",
    durationHome: "Four months for 3rd and 4th grade (conflicts with apply site)",
    namedBatches: [
      { name: "VICTOR8", blurb: "ADRE 3.0 and Assam Police, working-professional batch from 14 Sep 2026" },
    ],
  },
  {
    exam: "Bank / SSC / Railway",
    durationApply: "6 months",
    durationHome: "6 months",
    namedBatches: [],
  },
] as const

export const programs = [
  "Yodha current affairs magazine",
  "KAUXAL APSC workshop",
  "Warrior Mock Tests",
  "Rewind Series",
  "BRAHMASTRA",
  "Astra Series",
  "Vajra",
  "Victor 1.0 (DME/DHS Grade III)",
  "VICTOR8 (ADRE and Assam Police)",
  "ASSIST scholarship test",
  "Axom Dhwani podcast",
] as const

export const socialOffer = {
  source: "https://www.instagram.com/impactcareer.tutorials/reel/DGpVL_AyKf9/",
  level: "social" as ClaimLevel,
  points: [
    "Prelims, Mains, and Interview",
    "20 Prelims + 20 Mains mock tests",
    "Offline or online digital classroom",
    "Library with WiFi and study materials",
    "Hostel",
    "Mentorship till selection",
    "Assamese and English",
  ],
} as const

export const positioning = {
  safe:
    "Stay in North Lakhimpur for APSC, ADRE, Bank, SSC, and Railway prep, with a classroom, app, night batch, and working-professional morning batch.",
  unsafe:
    "Better results than Guwahati, exclusive ICT toppers, hostel for outstation students as a proven fact.",
} as const

export const doNotClaim = [
  "Rank 47 for Priyanka Saikia (official APS serial is 46; 47 is Alankrita Saikia)",
  "Exclusive ICT result for Priyanka or Amitesh (SPM IAS lists both)",
  "Any selection count, percentage, or top-in-Assam ranking",
  "ADRE, Bank, SSC, or Railway named selections",
  "Hostel, 20+20 mocks, bilingual, mentorship-till-selection, or 5+/6+ years as audited facts",
  "A single ADRE duration (4 months vs 12 months conflict)",
  "Any rupee fee, early-bird amount, or affordable as a number",
  "Opening hours as confirmed",
  "Founder degrees as independently verified",
  "iOS app",
  "Google review score or Justdial star rating (Justdial 0 votes)",
  "Classplus default subscriptionAmount of 25000 as their fee",
  "Template archive copy (Raju Rastogi, Shubham Pandya, 100% job selection, Nexus, Cognizant)",
  "Play Store screenshots as ICT classroom UI",
  "DSP Princhi Baruah or Rupamoni Gorh as ICT students",
  "Kangkana Dutta Rank 26 (no primary URL)",
  "Facebook follower count",
  "That the Feb 2025 APSC reel is still the live Sep 2026 package",
  "DRISTI / TARGET batch names unless a first-party page shows them",
] as const

export const siteStatusOn10Sep2026 = {
  www: "Homepage, About, Success Story, and Contact 404. SSL expired 30 Aug 2025. Courses and freetest still respond.",
  apex: "impactcareertutorials.in does not resolve",
  apply: "Cloudways domain mapping 403, wildcard cert mismatch",
  login: "Up, valid cert",
  play: "Up",
  pitch:
    "One working brand site with a live cert, WhatsApp enquire, named CCE 2022 selects with correct serials, and a Yodha capture that is not a dead hash link.",
} as const
