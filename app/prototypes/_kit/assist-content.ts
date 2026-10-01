import { whatsapp } from "../_data"

/**
 * The ASSIST scholarship test, stated only as far as ICT has published it:
 * the name, and its own videos. The rest is listed as still to come from ICT.
 */
export const assist = {
  title: "ASSIST, ICT's scholarship test.",
  lede: "Scholarships on ICT's courses are awarded through it.",
  knownTitle: "What ICT has published",
  known:
    "ASSIST is the Assam State Services Impact Scholarship Test, and scholarships on ICT's courses are awarded through it. ICT's own videos about it are below.",
  pendingTitle: "Coming from ICT",
  pending: [
    "The next test date and where it is held",
    "Who can sit it, and whether there is a fee",
    "The format: subjects, marks and time",
    "How much the scholarships are worth, and on which courses",
  ],
  notify: "Tell me when ASSIST is announced",
  videosTitle: "ICT on ASSIST",
  videosNote: "From ICT's own YouTube channel. Tap to play with sound.",
  videos: [
    { id: "pJdfEqqHcQE", title: "ASSIST 4.0" },
    { id: "ICvIqOER2og", title: "Free APSC coaching" },
  ],
  meanwhileTitle: "Meanwhile",
  meanwhile: "Start with a free workshop, or read how your exam works.",
  courses: "Courses and fees",
  exams: "Exam guides",
}

/** WhatsApp, opened with the question already typed. */
export const assistWhatsapp = `${whatsapp}?text=${encodeURIComponent(
  "Hello ICT, please tell me when the next ASSIST scholarship test is announced."
)}`
