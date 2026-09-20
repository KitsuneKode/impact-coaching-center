import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "/home/kitsunekode/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/docx/dist/index.mjs"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const out = path.join(root, "docs", "proposals", "client-materials")
fs.mkdirSync(out, { recursive: true })

const color = {
  navy: "12304A",
  blue: "1677B8",
  green: "2FA84F",
  amber: "ECA33A",
  ink: "17232D",
  muted: "62717C",
  pale: "EEF4F7",
  white: "FFFFFF",
}
const font = "Aptos"
const logo = path.join(root, "public", "brand", "ict-logo-wide.jpg")

const text = (value, options = {}) =>
  new TextRun({
    text: value,
    font: options.font ?? font,
    size: options.size ?? 19,
    color: options.color ?? color.ink,
    bold: options.bold,
    italics: options.italics,
    characterSpacing: options.characterSpacing,
  })

const para = (value, options = {}) =>
  new Paragraph({
    spacing: {
      before: options.before ?? 0,
      after: options.after ?? 90,
      line: options.line ?? 255,
    },
    alignment: options.alignment,
    keepNext: options.keepNext,
    children: [text(value, options)],
  })

const heading = (value, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    heading: level,
    keepNext: true,
    spacing: {
      before: level === HeadingLevel.HEADING_1 ? 180 : 120,
      after: level === HeadingLevel.HEADING_1 ? 90 : 65,
    },
    children: [text(value, { bold: true })],
  })

const bullet = (value, reference = "bullets") =>
  new Paragraph({
    numbering: { reference, level: 0 },
    spacing: { after: 48, line: 245 },
    children: [text(value, { size: 18 })],
  })

const pageBreak = () => new Paragraph({ children: [new PageBreak()] })

const infoTable = (items, columns = 2) => {
  const rows = []
  for (let i = 0; i < items.length; i += columns) {
    rows.push(
      new TableRow({
        children: Array.from({ length: columns }, (_, offset) => {
          const item = items[i + offset]
          return new TableCell({
            width: { size: 100 / columns, type: WidthType.PERCENTAGE },
            shading: { fill: item?.fill ?? "F5F8FA", type: ShadingType.CLEAR },
            margins: { top: 110, bottom: 105, left: 130, right: 130 },
            verticalAlign: VerticalAlign.TOP,
            children: item
              ? [
                  para(item.title, {
                    bold: true,
                    size: 18,
                    color: item.titleColor ?? color.navy,
                    after: 45,
                  }),
                  para(item.body, { size: 16, color: color.muted, after: 0 }),
                ]
              : [para("")],
          })
        }),
      })
    )
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
}

const paymentTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    ["Milestone", "Amount", "When payable"],
    ["Project commencement", "₹18,750 · 50%", "Before work begins"],
    ["Working preview", "₹11,250 · 30%", "Website and admin preview ready"],
    [
      "Production launch",
      "₹7,500 · 20%",
      "Before live deployment and handover",
    ],
  ].map(
    (row, rowIndex) =>
      new TableRow({
        children: row.map(
          (cell, cellIndex) =>
            new TableCell({
              width: {
                size: cellIndex === 2 ? 42 : 29,
                type: WidthType.PERCENTAGE,
              },
              shading:
                rowIndex === 0
                  ? { fill: color.navy, type: ShadingType.CLEAR }
                  : rowIndex % 2 === 0
                    ? { fill: "F4F7F9", type: ShadingType.CLEAR }
                    : undefined,
              margins: { top: 100, bottom: 100, left: 115, right: 115 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                para(cell, {
                  size: 17,
                  bold: rowIndex === 0 || cellIndex === 1,
                  color: rowIndex === 0 ? color.white : color.ink,
                  after: 0,
                }),
              ],
            })
        ),
      })
  ),
})

const quotation = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 380, hanging: 190 } } },
          },
        ],
      },
      {
        reference: "checks",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "✓",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 390, hanging: 210 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font, size: 19, color: color.ink },
        paragraph: { spacing: { line: 255 } },
      },
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Georgia", size: 39, bold: true, color: color.navy },
        paragraph: { spacing: { after: 180 } },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Georgia", size: 27, bold: true, color: color.navy },
        paragraph: { spacing: { before: 180, after: 90 }, keepNext: true },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font, size: 20, bold: true, color: color.blue },
        paragraph: { spacing: { before: 120, after: 65 }, keepNext: true },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 720, right: 800, bottom: 720, left: 800 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                text("PROJECT PROPOSAL AND PRICE QUOTATION", {
                  size: 12,
                  bold: true,
                  color: color.muted,
                  characterSpacing: 90,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                text("Impact Career Tutorials  ·  17 September 2026  ·  ", {
                  size: 12,
                  color: color.muted,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font,
                  size: 12,
                  color: color.muted,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 130 },
          children: [
            new ImageRun({
              data: fs.readFileSync(logo),
              transformation: { width: 270, height: 132 },
              type: "jpg",
            }),
          ],
        }),
        new Paragraph({
          style: "Title",
          alignment: AlignmentType.CENTER,
          children: [text("Digital growth platform")],
        }),
        para(
          "Admissions, free resources, physical books, library applications, promotions, analytics and staff operations in one responsive platform.",
          {
            alignment: AlignmentType.CENTER,
            size: 20,
            color: color.muted,
            after: 160,
          }
        ),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 10 },
          children: [
            text("TOTAL PROJECT FEE", {
              size: 13,
              bold: true,
              color: color.blue,
              characterSpacing: 120,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            text("₹37,500", {
              font: "Georgia",
              size: 48,
              bold: true,
              color: color.navy,
            }),
          ],
        }),
        para("Target delivery: five weeks from project commencement", {
          alignment: AlignmentType.CENTER,
          bold: true,
          color: color.green,
          after: 180,
        }),
        infoTable([
          {
            title: "Responsive experience",
            body: "Designed and tested for mobile phones, iPads and tablets, laptops and desktop screens.",
          },
          {
            title: "Staff-controlled operations",
            body: "Manage leads, resources, books, orders, library applications and promotions from one dashboard.",
          },
          {
            title: "Commerce and communication",
            body: "Verified Razorpay checkout with WhatsApp order updates.",
          },
          {
            title: "Measurable growth",
            body: "PostHog conversion analytics, Search Console and a strong technical SEO foundation.",
          },
        ]),
        para(
          "This quotation is valid for 15 days. The detailed schedule begins after acceptance, advance payment, required content and account access.",
          {
            before: 150,
            alignment: AlignmentType.CENTER,
            size: 16,
            italics: true,
            color: color.muted,
          }
        ),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  margins: { top: 90, bottom: 90, left: 110, right: 110 },
                  children: [
                    para("Prepared for", {
                      bold: true,
                      size: 16,
                      color: color.blue,
                    }),
                    para("Impact Career Tutorials", { bold: true, size: 17 }),
                    para("Legal/billing name: ____________________", {
                      size: 15,
                    }),
                    para("Address/GSTIN: ________________________", {
                      size: 15,
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  margins: { top: 90, bottom: 90, left: 110, right: 110 },
                  children: [
                    para("Issued by", {
                      bold: true,
                      size: 16,
                      color: color.blue,
                    }),
                    para("Legal/trade name: ______________________", {
                      size: 15,
                    }),
                    para("Address/Udyam: ________________________", {
                      size: 15,
                    }),
                    para("GST status: ____________________________", {
                      size: 15,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        pageBreak(),
        heading("What is included"),
        infoTable([
          {
            title: "Website and courses",
            body: "Premium responsive design; homepage; institute, faculty and approved results; course catalogue and course pages; contact, map, phone, WhatsApp and Telegram actions; required policy pages.",
          },
          {
            title: "Enquiries and lead management",
            body: "Forms, course/source tracking, one lead history, duplicate detection using normalized phone/email, status, assignment, notes, follow-up dates, filters, WhatsApp/call actions and CSV export.",
          },
          {
            title: "Free resources",
            body: "Searchable study-material catalogue, categories, short access form, consent capture, immediate access, Cloudflare R2 file delivery and admin management.",
          },
          {
            title: "Physical books",
            body: "Catalogue, book details, availability, cart, address collection, Razorpay checkout, server-side payment verification, order states and fulfilment workflow.",
          },
          {
            title: "Transactional email",
            body: "WhatsApp customer order confirmation, staff new-order notification and approved payment/order-status messages using ICT's verified WhatsApp Business number.",
          },
          {
            title: "Library applications",
            body: "Approved facilities, timings, plans and rules; application form; admin review and status management. Library payment is deferred.",
          },
          {
            title: "Promotion system",
            body: "Announcement bar, inline campaign cards and one controlled modal; page targeting, schedule, expiry, priority, CTA, dismissal and campaign measurement.",
          },
          {
            title: "Admin dashboard",
            body: "Secure staff access for leads, courses, resources, books, inventory, orders, library applications and promotions, usable on mobile, iPad and laptop.",
          },
          {
            title: "Analytics and SEO",
            body: "PostHog owner dashboard and conversion funnels, privacy-masked replay, Search Console, metadata, sitemap, canonical URLs, supported structured data and Business Profile consistency review.",
          },
          {
            title: "Deployment and handover",
            body: "Production deployment, domain connection, initial approved content, staff training, operating guidance and 30 days of post-launch defect support.",
          },
        ]),
        heading("Initial content included", HeadingLevel.HEADING_2),
        para(
          "Existing approved course catalogue, up to 20 physical books and up to 30 free resources, using complete client-supplied information and assets.",
          { bold: true, color: color.navy }
        ),

        pageBreak(),
        heading("How the project will be delivered"),
        infoTable([
          {
            title: "Week 1 · Direction",
            body: "Freeze scope, audit content, confirm journeys and approve the visual direction.",
          },
          {
            title: "Week 2 · Public platform",
            body: "Build the website, courses, enquiries, resources and responsive layout system.",
          },
          {
            title: "Week 3 · Commerce and library",
            body: "Build books, cart, checkout, payment verification, transactional email and library applications.",
          },
          {
            title: "Week 4 · Operations",
            body: "Build admin workflows, lead deduplication, order fulfilment, promotions and analytics events.",
          },
          {
            title: "Week 5 · Qualification and launch",
            body: "Complete approved content entry, SEO, analytics, device and accessibility checks, payment/email testing, training and production deployment.",
          },
          {
            title: "Review pattern",
            body: "One authorized client contact supplies consolidated feedback within two business days at each review point.",
          },
        ]),
        heading("Payment pattern"),
        paymentTable,
        para(
          "Payments may be made through bank transfer or UPI against a numbered invoice. The live domain, production deployment and final handover occur after the applicable milestone payment is cleared.",
          { before: 100, size: 17, color: color.muted }
        ),
        heading(
          "How ownership and access will be distributed",
          HeadingLevel.HEADING_2
        ),
        bullet(
          "ICT owns the production domain, Cloudflare/R2, Convex, Meta WhatsApp Business, Razorpay, PostHog, Search Console and Google Business Profile accounts."
        ),
        bullet(
          "The developer receives only the access required to build, deploy and maintain the platform."
        ),
        bullet(
          "At final handover, ICT receives production access, agreed source-code/repository access, operational documentation, training and the provider/account inventory."
        ),
        bullet(
          "Third-party subscriptions, payment charges, email usage and other provider charges are paid directly by ICT."
        ),
        para(
          "Delayed content, approvals, account access or third-party verification extend the target delivery date by the corresponding delay.",
          { before: 80, bold: true, color: color.blue }
        ),

        pageBreak(),
        heading("Responsibilities and exclusions"),
        heading("ICT will provide and approve", HeadingLevel.HEADING_2),
        para(
          "Official business details and contacts; courses, fees, schedules and syllabus; faculty information; results/testimonial evidence and permissions; books, covers, prices, availability and delivery rules; PDFs and categories; library details; legal policies; production-account verification; and one authorized decision-maker."
        ),
        heading("Not included in this phase", HeadingLevel.HEADING_2),
        para(
          "Guaranteed Google rankings; ongoing SEO or Business Profile operations; AI or automated WhatsApp assistant; online library payment; student accounts or LMS; tests, attendance or live classes; Classplus migration; courier selection, packaging, dispatch or returns operations; accounting integration; bulk email/newsletters; bulk WhatsApp marketing; photography, videography or complete copywriting; unlimited content entry or revisions; and third-party usage or transaction charges."
        ),
        heading("Revisions and changes", HeadingLevel.HEADING_2),
        para(
          "Two consolidated revision rounds are included. New pages, new modules, changed business workflows or changes to previously approved direction will be estimated separately and begin only after written approval."
        ),
        heading("Support boundary", HeadingLevel.HEADING_2),
        para(
          "Thirty days of post-launch support covers verified defects where the delivered system does not follow the accepted scope. It does not cover new features, routine content entry, external-provider outages, changed provider policies, client-caused data changes, compromised credentials or ongoing campaign/SEO work."
        ),
        heading("Operational boundaries", HeadingLevel.HEADING_2),
        bullet(
          "ICT remains responsible for book prices, availability, delivery areas and charges, packaging, dispatch, courier operation, customer support, cancellations and refund decisions."
        ),
        bullet(
          "WhatsApp messaging requires an ICT-authorized WhatsApp Business number. Message delivery depends on Meta, and newsletters or promotional automation are excluded."
        ),
        bullet(
          "Lead matching uses normalized phone/email identifiers, preserves every submission and flags conflicting matches for staff review; people are never merged only by name."
        ),
        bullet(
          "ICT approves privacy, consent, retention and marketing rules. Personal details remain in the protected admin and are excluded from PostHog analytics events."
        ),
        bullet(
          "Search indexing, rankings and analytics completeness depend on Google, consent choices, browsers, network conditions and sufficient live traffic."
        ),
        heading("Admin boundary", HeadingLevel.HEADING_2),
        para(
          "The admin covers only the workflows explicitly listed in this quotation. Advanced CRM automation, accounting, bulk messaging, courier aggregation, multi-branch operations, complex permission systems and custom reporting are excluded."
        ),

        pageBreak(),
        heading("Commercial conditions and acceptance"),
        heading("Project commencement", HeadingLevel.HEADING_2),
        para(
          "The five-week schedule starts on the first working day after this quotation is accepted, the 50% commencement payment has cleared, required starting content is received and required account access is available."
        ),
        heading("Reviews, delay and inactivity", HeadingLevel.HEADING_2),
        para(
          "One revision round means one consolidated feedback list from the authorized client contact. Feedback is requested within two business days. Client or provider delays extend the schedule. If required input remains unavailable for ten business days, the project may be paused and restarted according to developer availability."
        ),
        heading("Cancellation and payment gate", HeadingLevel.HEADING_2),
        para(
          "The commencement payment becomes non-refundable after work begins, and completed milestones remain payable. The production domain will not be connected and production access/source handover will not occur while an agreed milestone payment is outstanding."
        ),
        heading(
          "Intellectual property and maintenance",
          HeadingLevel.HEADING_2
        ),
        para(
          "After full payment, ICT receives the project-specific deliverables and the continuing right to use incorporated reusable components. The service provider retains pre-existing tools, general reusable components and know-how. Monitoring, security/dependency updates, backups, recovery, routine content work and changes after the 30-day defect period require a separately accepted maintenance arrangement."
        ),
        heading("Acceptance checks", HeadingLevel.HEADING_2),
        para(
          "Acceptance is based on the agreed routes and staging modules working materially as described: lead submission and repeat-lead history; resource access; test book order and verified payment state; WhatsApp test message; library application; promotion scheduling; approved PostHog events; and responsive operation across the agreed mobile, iPad/tablet and laptop/desktop checks."
        ),
        heading("Tax and invoicing", HeadingLevel.HEADING_2),
        para(
          "The supplier's legal identity, GST status and the client's billing details must be completed before issue. Each milestone is paid against a numbered invoice. GST will be shown and collected only when legally applicable to the supplier."
        ),
        heading("Acceptance", HeadingLevel.HEADING_2),
        para(
          "By signing this quotation and making the commencement payment, the client accepts the described scope, exclusions, payment schedule, responsibilities and delivery conditions."
        ),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  margins: { top: 120, right: 220 },
                  children: [
                    para("For Impact Career Tutorials", {
                      bold: true,
                      color: color.navy,
                    }),
                    para("Name: ______________________________", { size: 17 }),
                    para("Signature: ___________________________", {
                      size: 17,
                    }),
                    para("Date: _______________________________", { size: 17 }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  margins: { top: 120, left: 220 },
                  children: [
                    para("Service provider", {
                      bold: true,
                      color: color.navy,
                    }),
                    para("Name: ______________________________", { size: 17 }),
                    para("Signature: ___________________________", {
                      size: 17,
                    }),
                    para("Date: _______________________________", { size: 17 }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
})

await fs.promises.writeFile(
  path.join(out, "ICT-Final-Project-Quotation.docx"),
  await Packer.toBuffer(quotation)
)

console.log(path.join(out, "ICT-Final-Project-Quotation.docx"))
