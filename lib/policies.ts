import { contact, formatPhone } from "./brand"

/**
 * Visitor-facing policy text. Each document carries `approved`, which is false
 * until ICT signs the wording off; unapproved documents render with a visible
 * draft notice, are `noindex`, and are absent from the sitemap. Flip the flag
 * only with a recorded approval.
 *
 * PLACEHOLDER-AWARE: nothing below states a charge, a time window or an
 * opening hour, because none has been approved. Do not add one here; add it
 * once approved, in the same commit that sets `approved: true`. A test asserts
 * this for every unapproved document.
 */
export type PolicySection = { heading: string; paragraphs: readonly string[] }

export type PolicySlug = "privacy" | "terms" | "shipping" | "refunds"

export type PolicyDocument = {
  slug: PolicySlug
  title: string
  description: string
  /** ISO date of the last wording change, shown to the visitor. */
  updated: string
  approved: boolean
  sections: readonly PolicySection[]
}

const UPDATED = "2026-09-20"

export const policies: readonly PolicyDocument[] = [
  {
    slug: "privacy",
    title: "Privacy policy",
    description:
      "What Impact Career Tutorials collects through this website, why, and how to ask about it.",
    updated: UPDATED,
    approved: false,
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "When you send an enquiry we collect your name, mobile number, the exam you are asking about and your preferred time of day. Your network address is used only to limit automated submissions and is not stored with your enquiry.",
          "If you sign in, we verify that the mobile number is yours by sending a one-time code on WhatsApp. We keep the number, the fact that it is verified, and the date. There is no password to store. You do not need to sign in to send an enquiry.",
        ],
      },
      {
        heading: "Why we collect it",
        paragraphs: [
          "To reply to your enquiry and to know which courses people ask about. We do not sell or share this information with anyone outside Impact Career Tutorials.",
        ],
      },
      {
        heading: "Where it is kept",
        paragraphs: [
          "Enquiries are stored in a database operated for Impact Career Tutorials. Staff who follow up enquiries can see them.",
        ],
      },
      {
        heading: "Analytics",
        paragraphs: [
          "This site does not currently run analytics or advertising scripts.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          `Write to ${contact.email} or message ${formatPhone(contact.whatsapp)} on WhatsApp to see, correct or delete what we hold about you.`,
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of use",
    description: "The terms on which this website is provided.",
    updated: UPDATED,
    approved: false,
    sections: [
      {
        heading: "About this site",
        paragraphs: [
          "This website is published by Impact Career Tutorials, North Lakhimpur, Assam. Course fees, batches and enrolment are handled through ICT's Classplus storefront and app, which have their own terms.",
        ],
      },
      {
        heading: "Accuracy",
        paragraphs: [
          "We try to keep course and batch information current. Where this site and ICT's storefront disagree, the storefront is correct.",
        ],
      },
      {
        heading: "Online purchases",
        paragraphs: [
          "This website does not currently sell anything online. Terms for online orders will be published here before that changes.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [`Questions about these terms: ${contact.email}.`],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping and delivery",
    description:
      "How physical books ordered through this website would be delivered.",
    updated: UPDATED,
    approved: false,
    sections: [
      {
        heading: "Not yet available",
        paragraphs: [
          "Impact Career Tutorials does not currently take online orders for books through this website. Books are available at the centre on DC Bungalow Road, North Lakhimpur. Delivery areas, charges and dispatch times will be published on this page before online ordering opens.",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Cancellations and refunds",
    description:
      "How cancellations and refunds are handled for orders placed through this website.",
    updated: UPDATED,
    approved: false,
    sections: [
      {
        heading: "Not yet available",
        paragraphs: [
          "Impact Career Tutorials does not currently take online payments through this website, so there is nothing to cancel or refund here. Course fees paid through ICT's Classplus storefront or app are governed by the terms shown there. This page will be updated with the cancellation and refund policy before online ordering opens.",
        ],
      },
    ],
  },
]

export const policyBySlug = (slug: string) =>
  policies.find((policy) => policy.slug === slug)

/**
 * The document behind a policy route, or a build failure.
 *
 * Each route knows its own slug at module scope, so a missing document is a
 * wiring mistake, not something a visitor can reach: failing the build names
 * the problem, where a runtime 404 would quietly drop a route that is supposed
 * to exist.
 */
export function requirePolicy(slug: PolicySlug): PolicyDocument {
  const doc = policyBySlug(slug)
  if (!doc) throw new Error(`No policy document declared for "${slug}"`)
  return doc
}

/**
 * Metadata for one policy route.
 *
 * An unapproved document is kept out of search results. `robots` only ever
 * narrows what `lib/site.ts` already allows - a page cannot make itself
 * indexable on a site that is not.
 */
export function policyMetadata(doc: PolicyDocument) {
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/${doc.slug}` },
    ...(doc.approved ? {} : { robots: { index: false, follow: true } }),
  }
}
