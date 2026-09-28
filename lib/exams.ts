/**
 * How each exam ICT teaches actually works, from the conducting body's own
 * pages and papers. Every figure here is copied from the `sources` listed with
 * it, checked on `checked`; nothing is taken from coaching or aggregator
 * sites, which disagree with the official papers (ADRE negative marking, for
 * one). Text is bilingual: `en` always, `as` drafted for ICT to verify.
 */

export type Text = { en: string; as: string }

export type ExamStage = {
  name: Text
  /** marks and time, as the official document states them */
  facts?: Text
  points: Text[]
}

export type ExamLink = { label: Text; href: string }

export type ExamGuide = {
  slug: "apsc" | "adre" | "assam-police-si" | "banking"
  /** the ICT track that prepares for it */
  track: "apsc" | "adre" | "banking"
  name: Text
  /** For lists where the full name would wrap. */
  short: Text
  body: Text
  summary: Text
  stages: ExamStage[]
  eligibility?: Text[]
  papers: ExamLink[]
  sources: ExamLink[]
  checked: string
}

const APSC = "https://apsc.nic.in"
const SLRC = "http://slrcg3.sebaonline.org"
const SLPRB_SI_2025 =
  "https://slprbassam.in/pdf/Notice2025/12122025/adv_SI_UB_communication_station_officer_etc.pdf"

export const exams: readonly ExamGuide[] = [
  {
    slug: "apsc",
    track: "apsc",
    name: {
      en: "APSC Combined Competitive Examination",
      as: "APSC সংযুক্ত প্ৰতিযোগিতামূলক পৰীক্ষা",
    },
    short: { en: "APSC CCE", as: "APSC CCE" },
    body: {
      en: "Assam Public Service Commission",
      as: "অসম লোক সেৱা আয়োগ",
    },
    summary: {
      en: "Three stages: an objective Prelims, a written Mains of six papers, and an interview. The final list is out of 1680 marks.",
      as: "তিনিটা স্তৰ: বস্তুনিষ্ঠ প্ৰিলিমছ, ছখন কাকতৰ লিখিত মেইনছ, আৰু সাক্ষাৎকাৰ। চূড়ান্ত তালিকা 1680 নম্বৰৰ ভিত্তিত হয়।",
    },
    stages: [
      {
        name: { en: "Prelims", as: "প্ৰিলিমছ" },
        facts: {
          en: "Two papers, 200 marks each, 2 hours each, objective",
          as: "দুখন কাকত, প্ৰতিখন 200 নম্বৰ আৰু 2 ঘণ্টাৰ, বস্তুনিষ্ঠ",
        },
        points: [
          {
            en: "General Studies I: 30% to 35% of the questions are about Assam.",
            as: "সাধাৰণ অধ্যয়ন I: 30%ৰ পৰা 35% প্ৰশ্ন অসমৰ বিষয়ে।",
          },
          {
            en: "General Studies II is qualifying: at least 33% is needed, and it does not count towards the rank.",
            as: "সাধাৰণ অধ্যয়ন II কেৱল উত্তীৰ্ণ হ'বলগীয়া: অন্ততঃ 33% লাগে, ই স্থান নিৰ্ণয়ত নাধৰে।",
          },
        ],
      },
      {
        name: { en: "Mains", as: "মেইনছ" },
        facts: {
          en: "Six written papers, 250 marks each, 3 hours each, 1500 in all",
          as: "ছখন লিখিত কাকত, প্ৰতিখন 250 নম্বৰ আৰু 3 ঘণ্টাৰ, মুঠ 1500",
        },
        points: [
          {
            en: "Paper 1 is an essay, written in the language of your choice.",
            as: "কাকত 1 ৰচনা, নিজৰ পছন্দৰ ভাষাত লিখিব পাৰি।",
          },
          {
            en: "Papers 2 to 5 are General Studies I to IV.",
            as: "কাকত 2ৰ পৰা 5 সাধাৰণ অধ্যয়ন Iৰ পৰা IV।",
          },
          {
            en: "Paper 6 is a general subject paper on Assam.",
            as: "কাকত 6 অসমৰ ওপৰত সাধাৰণ বিষয়ৰ কাকত।",
          },
        ],
      },
      {
        name: { en: "Interview", as: "সাক্ষাৎকাৰ" },
        facts: { en: "180 marks", as: "180 নম্বৰ" },
        points: [
          {
            en: "Only for those who qualify in the written Mains. The final list is out of 1680: 1500 written plus 180 interview.",
            as: "লিখিত মেইনছত উত্তীৰ্ণ হোৱাসকলৰ বাবেহে। চূড়ান্ত তালিকা 1680ৰ ভিত্তিত: 1500 লিখিত আৰু 180 সাক্ষাৎকাৰ।",
          },
        ],
      },
    ],
    papers: [
      {
        label: {
          en: "Prelims syllabus, General Studies I",
          as: "প্ৰিলিমছৰ পাঠ্যক্ৰম, সাধাৰণ অধ্যয়ন I",
        },
        href: `${APSC}/cce_2019/Syllabus_CCE(P)_GS_I.pdf`,
      },
      {
        label: {
          en: "Prelims syllabus, General Studies II",
          as: "প্ৰিলিমছৰ পাঠ্যক্ৰম, সাধাৰণ অধ্যয়ন II",
        },
        href: `${APSC}/cce_2019/Syllabus_CCE(P)_GS_II.pdf`,
      },
      {
        label: {
          en: "Prelims 2025 question paper, General Studies I",
          as: "প্ৰিলিমছ 2025ৰ প্ৰশ্নকাকত, সাধাৰণ অধ্যয়ন I",
        },
        href: `${APSC}/prev_qp/GS-I_CCE(P)_2025.pdf`,
      },
      {
        label: {
          en: "Prelims 2025 question paper, General Studies II",
          as: "প্ৰিলিমছ 2025ৰ প্ৰশ্নকাকত, সাধাৰণ অধ্যয়ন II",
        },
        href: `${APSC}/prev_qp/GS-II_CCE(P)_2025.pdf`,
      },
      {
        label: { en: "Mains 2024 essay paper", as: "মেইনছ 2024ৰ ৰচনা কাকত" },
        href: `${APSC}/prev_qp/CCEM_2024_Paper_1_Essay.pdf`,
      },
    ],
    sources: [
      {
        label: {
          en: "APSC, Combined Competitive Examination page",
          as: "APSC, সংযুক্ত প্ৰতিযোগিতামূলক পৰীক্ষাৰ পৃষ্ঠা",
        },
        href: `${APSC}/cce.html`,
      },
    ],
    checked: "2026-09-28",
  },
  {
    slug: "adre",
    track: "adre",
    name: {
      en: "ADRE, Assam Direct Recruitment Examination (Class III)",
      as: "ADRE, অসম প্ৰত্যক্ষ নিযুক্তি পৰীক্ষা (তৃতীয় শ্ৰেণী)",
    },
    short: { en: "ADRE", as: "ADRE" },
    body: {
      en: "State Level Recruitment Commission, conducted by SEBA",
      as: "ৰাজ্যিক নিযুক্তি আয়োগ, SEBAৰ দ্বাৰা পৰিচালিত",
    },
    summary: {
      en: "A written OMR paper matched to your education level, then a skill test for posts that need one. This is how ADRE 2.0 ran in 2024; check the next notification for changes.",
      as: "আপোনাৰ শিক্ষাগত স্তৰ অনুসৰি এখন লিখিত OMR কাকত, তাৰ পিছত প্ৰয়োজন হ'লে দক্ষতাৰ পৰীক্ষা। 2024ত ADRE 2.0 এনেকৈয়ে হৈছিল; পৰৱৰ্তী জাননীত সলনি হৈছে নে চাব।",
    },
    stages: [
      {
        name: {
          en: "Written paper for Class XII level posts (Paper III)",
          as: "দ্বাদশ শ্ৰেণীৰ স্তৰৰ পদৰ লিখিত কাকত (কাকত III)",
        },
        facts: {
          en: "150 questions, 1 mark each, 3 hours",
          as: "150টা প্ৰশ্ন, প্ৰতিটো 1 নম্বৰ, 3 ঘণ্টা",
        },
        points: [
          {
            en: "0.25 marks are deducted for each wrong answer, and for marking more than one option.",
            as: "প্ৰতিটো ভুল উত্তৰ আৰু একাধিক বিকল্প বাছনিৰ বাবে 0.25 নম্বৰ কটা যায়।",
          },
          {
            en: "Held on 15 September 2024 in ADRE 2.0.",
            as: "ADRE 2.0ত 15 ছেপ্টেম্বৰ 2024ত অনুষ্ঠিত হৈছিল।",
          },
        ],
      },
      {
        name: {
          en: "Written paper for graduate level posts (Paper IV)",
          as: "স্নাতক স্তৰৰ পদৰ লিখিত কাকত (কাকত IV)",
        },
        facts: {
          en: "175 marks, 3 hours: 125 one-mark and 25 two-mark questions",
          as: "175 নম্বৰ, 3 ঘণ্টা: 125টা এক নম্বৰৰ আৰু 25টা দুই নম্বৰৰ প্ৰশ্ন",
        },
        points: [
          {
            en: "A wrong answer costs 0.25 on a one-mark question and 0.5 on a two-mark question.",
            as: "এক নম্বৰৰ প্ৰশ্নত ভুল হ'লে 0.25 আৰু দুই নম্বৰৰ প্ৰশ্নত 0.5 নম্বৰ কটা যায়।",
          },
          {
            en: "Held on 29 September 2024 in ADRE 2.0.",
            as: "ADRE 2.0ত 29 ছেপ্টেম্বৰ 2024ত অনুষ্ঠিত হৈছিল।",
          },
        ],
      },
      {
        name: {
          en: "Skill test, for posts that need one",
          as: "প্ৰয়োজন হোৱা পদৰ বাবে দক্ষতাৰ পৰীক্ষা",
        },
        points: [
          {
            en: "A computer skill test for clerical posts, a stenography test for steno posts, and a driving test for drivers (whose written paper is Paper V, at Class X level).",
            as: "কেৰাণী পদৰ বাবে কম্পিউটাৰ দক্ষতাৰ পৰীক্ষা, ষ্টেন' পদৰ বাবে ষ্টেনোগ্ৰাফী পৰীক্ষা, আৰু চালকৰ বাবে ড্ৰাইভিং পৰীক্ষা (যাৰ লিখিত কাকত দশম শ্ৰেণীৰ স্তৰৰ কাকত V)।",
          },
        ],
      },
    ],
    papers: [
      {
        label: {
          en: "ADRE 2.0 papers and final answer keys (all sets)",
          as: "ADRE 2.0ৰ প্ৰশ্নকাকত আৰু চূড়ান্ত উত্তৰ তালিকা (সকলো ছেট)",
        },
        href: `${SLRC}/`,
      },
      {
        label: {
          en: "Paper III question booklet, set A",
          as: "কাকত IIIৰ প্ৰশ্নপুথি, ছেট A",
        },
        href: `${SLRC}/15092024files/15092024_Set_A.pdf`,
      },
      {
        label: {
          en: "Paper IV question booklet, set A",
          as: "কাকত IVৰ প্ৰশ্নপুথি, ছেট A",
        },
        href: `${SLRC}/29092024_PAPER_4/29092024_P4_Set_A.pdf`,
      },
    ],
    sources: [
      {
        label: {
          en: "SLRC-SEBA recruitment portal",
          as: "SLRC-SEBA নিযুক্তি পৰ্টেল",
        },
        href: `${SLRC}/`,
      },
    ],
    checked: "2026-09-28",
  },
  {
    slug: "assam-police-si",
    track: "adre",
    name: { en: "Assam Police Sub-Inspector", as: "অসম আৰক্ষী উপ-পৰিদৰ্শক" },
    short: { en: "Assam Police SI", as: "অসম আৰক্ষী SI" },
    body: {
      en: "State Level Police Recruitment Board, Assam",
      as: "ৰাজ্যিক আৰক্ষী নিযুক্তি পৰিষদ, অসম",
    },
    summary: {
      en: "A written test, a physical efficiency test with a medical and height check, and a short viva. The final list is out of 150. Figures from the December 2025 advertisement.",
      as: "লিখিত পৰীক্ষা, চিকিৎসা আৰু উচ্চতা পৰীক্ষাৰ সৈতে শাৰীৰিক দক্ষতাৰ পৰীক্ষা, আৰু চমু মৌখিক। চূড়ান্ত তালিকা 150 নম্বৰৰ ভিত্তিত। তথ্য ডিচেম্বৰ 2025ৰ বিজ্ঞাপনৰ পৰা।",
    },
    stages: [
      {
        name: { en: "Written test", as: "লিখিত পৰীক্ষা" },
        facts: {
          en: "100 multiple-choice questions, 1 mark each, on an OMR sheet",
          as: "100টা বহুবিকল্পী প্ৰশ্ন, প্ৰতিটো 1 নম্বৰ, OMR কাকতত",
        },
        points: [
          {
            en: "Half a mark is deducted for each wrong answer.",
            as: "প্ৰতিটো ভুল উত্তৰৰ বাবে আধা নম্বৰ কটা যায়।",
          },
          {
            en: "Covers logical reasoning, aptitude and English comprehension; the history and culture of Assam and India; and general knowledge.",
            as: "যুক্তি, দক্ষতা আৰু ইংৰাজী বোধগম্যতা; অসম আৰু ভাৰতৰ ইতিহাস আৰু সংস্কৃতি; আৰু সাধাৰণ জ্ঞান।",
          },
          {
            en: "Set in Assamese, Bodo, Bengali and English.",
            as: "অসমীয়া, বড়ো, বাংলা আৰু ইংৰাজীত প্ৰশ্ন থাকে।",
          },
        ],
      },
      {
        name: { en: "Physical efficiency test", as: "শাৰীৰিক দক্ষতাৰ পৰীক্ষা" },
        facts: {
          en: "40 marks: a race and a long jump",
          as: "40 নম্বৰ: দৌৰ আৰু দীঘল জাপ",
        },
        points: [
          {
            en: "Five times the number of posts are called, in order of written marks.",
            as: "লিখিত নম্বৰৰ ক্ৰমত পদৰ পাঁচগুণ প্ৰাৰ্থীক মতা হয়।",
          },
          {
            en: "Men: 1600 m in 300 seconds or less earns the full 20; beyond 450 seconds disqualifies. Long jump at least 335 cm, full marks at 500 cm.",
            as: "পুৰুষ: 300 ছেকেণ্ড বা তাতকৈ কমত 1600 মিটাৰ দৌৰিলে সম্পূৰ্ণ 20; 450 ছেকেণ্ডৰ বেছি হ'লে অযোগ্য। দীঘল জাপ অন্ততঃ 335 ছে.মি., 500 ছে.মি.ত সম্পূৰ্ণ নম্বৰ।",
          },
          {
            en: "Women: 800 m in 160 seconds or less earns the full 20; 240 seconds is the qualifying time. Long jump at least 244 cm, full marks at 389 cm.",
            as: "মহিলা: 160 ছেকেণ্ড বা তাতকৈ কমত 800 মিটাৰ দৌৰিলে সম্পূৰ্ণ 20; 240 ছেকেণ্ড উত্তীৰ্ণ হোৱাৰ সময়। দীঘল জাপ অন্ততঃ 244 ছে.মি., 389 ছে.মি.ত সম্পূৰ্ণ নম্বৰ।",
          },
        ],
      },
      {
        name: {
          en: "Medical, then the height and chest check",
          as: "চিকিৎসা, তাৰ পিছত উচ্চতা আৰু বুকুৰ জোখ",
        },
        facts: { en: "No marks; must be met", as: "নম্বৰ নাই; পূৰণ কৰিব লাগিব" },
        points: [
          {
            en: "Height for General, OBC, MOBC and SC: 162.5 cm for men, 154 cm for women. For ST (P) and ST (H): 160 cm and 152 cm.",
            as: "সাধাৰণ, OBC, MOBC আৰু SCৰ উচ্চতা: পুৰুষ 162.5 ছে.মি., মহিলা 154 ছে.মি.। ST (P) আৰু ST (H)ৰ বাবে: 160 ছে.মি. আৰু 152 ছে.মি.।",
          },
          {
            en: "Chest for men: at least 80 cm with 5 cm expansion (78 cm for ST (H)).",
            as: "পুৰুষৰ বুকু: অন্ততঃ 80 ছে.মি., 5 ছে.মি. প্ৰসাৰণ সহ (ST (H)ৰ বাবে 78 ছে.মি.)।",
          },
        ],
      },
      {
        name: { en: "Viva and final list", as: "মৌখিক আৰু চূড়ান্ত তালিকা" },
        facts: {
          en: "Viva 5 marks, NCC 5 marks, 150 in all",
          as: "মৌখিক 5, NCC 5, মুঠ 150",
        },
        points: [
          {
            en: "Twice the number of vacancies are called for the viva. The final list adds written (100), physical (40), NCC (5) and viva (5).",
            as: "মৌখিকৰ বাবে খালী পদৰ দুগুণ প্ৰাৰ্থীক মতা হয়। চূড়ান্ত তালিকাত লিখিত (100), শাৰীৰিক (40), NCC (5) আৰু মৌখিক (5) যোগ কৰা হয়।",
          },
        ],
      },
    ],
    eligibility: [
      {
        en: "Age 20 to 26 on 1 January 2026 for Sub-Inspector (UB), with relaxation for reserved categories.",
        as: "উপ-পৰিদৰ্শক (UB)ৰ বাবে 1 জানুৱাৰী 2026ত বয়স 20ৰ পৰা 26, সংৰক্ষিত শ্ৰেণীৰ বাবে ৰেহাই আছে।",
      },
      {
        en: "A graduate in arts, science or commerce from a recognised university.",
        as: "স্বীকৃত বিশ্ববিদ্যালয়ৰ কলা, বিজ্ঞান বা বাণিজ্যৰ স্নাতক।",
      },
      {
        en: "Must speak Assamese or another state language fluently.",
        as: "অসমীয়া বা ৰাজ্যৰ আন এটা ভাষা সাৱলীলভাৱে ক'ব পাৰিব লাগিব।",
      },
    ],
    papers: [
      {
        label: {
          en: "December 2025 advertisement (PDF)",
          as: "ডিচেম্বৰ 2025ৰ বিজ্ঞাপন (PDF)",
        },
        href: SLPRB_SI_2025,
      },
    ],
    sources: [
      {
        label: {
          en: "SLPRB advertisement, 12 December 2025",
          as: "SLPRBৰ বিজ্ঞাপন, 12 ডিচেম্বৰ 2025",
        },
        href: SLPRB_SI_2025,
      },
      {
        label: { en: "SLPRB Assam", as: "SLPRB অসম" },
        href: "https://slprbassam.in/",
      },
    ],
    checked: "2026-09-28",
  },
  {
    slug: "banking",
    track: "banking",
    name: { en: "Bank, SSC and Railway exams", as: "বেংক, SSC আৰু ৰেলৱে পৰীক্ষা" },
    short: { en: "Bank, SSC, Railway", as: "বেংক, SSC, ৰেলৱে" },
    body: {
      en: "IBPS, SBI, the Staff Selection Commission and the Railway Recruitment Boards",
      as: "IBPS, SBI, কৰ্মচাৰী নিৰ্বাচন আয়োগ আৰু ৰেলৱে নিযুক্তি পৰিষদ",
    },
    summary: {
      en: "National exams, each with its own notification every cycle. The patterns change often, so read the current notice on the board's own site; the subjects stay the same.",
      as: "ৰাষ্ট্ৰীয় পৰীক্ষা, প্ৰতিটো চক্ৰত নিজা জাননী। আৰ্হি সঘনাই সলনি হয়, সেয়ে পৰিষদৰ নিজা ৱেবছাইটত চলিত জাননী পঢ়ক; বিষয়বোৰ একেই থাকে।",
    },
    stages: [
      {
        name: { en: "What they have in common", as: "সকলোবোৰৰ মিল" },
        points: [
          {
            en: "Objective computer-based tests in maths, reasoning and English, with general or banking awareness.",
            as: "গণিত, যুক্তি আৰু ইংৰাজীত বস্তুনিষ্ঠ কম্পিউটাৰ-ভিত্তিক পৰীক্ষা, সাধাৰণ বা বেংকিং সজাগতাৰ সৈতে।",
          },
          {
            en: "Most run in more than one stage, and some add an interview, a skill test or a document check.",
            as: "বেছিভাগেই এটাতকৈ অধিক স্তৰত হয়, কিছুমানত সাক্ষাৎকাৰ, দক্ষতাৰ পৰীক্ষা বা নথি পৰীক্ষা থাকে।",
          },
        ],
      },
    ],
    papers: [],
    sources: [
      { label: { en: "IBPS", as: "IBPS" }, href: "https://www.ibps.in/" },
      {
        label: { en: "SBI careers", as: "SBI কেৰিয়াৰ" },
        href: "https://sbi.co.in/web/careers",
      },
      {
        label: { en: "Staff Selection Commission", as: "কৰ্মচাৰী নিৰ্বাচন আয়োগ" },
        href: "https://ssc.gov.in/",
      },
      {
        label: { en: "Railway Recruitment Boards", as: "ৰেলৱে নিযুক্তি পৰিষদ" },
        href: "https://www.rrbapply.gov.in/",
      },
    ],
    checked: "2026-09-28",
  },
]

export function examBySlug(slug: string) {
  return exams.find((exam) => exam.slug === slug)
}

/** Pick the reader's language from a bilingual text. */
export function pick(text: Text, locale: string) {
  return locale === "as" ? text.as : text.en
}
