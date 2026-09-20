import pptxgen from "/home/kitsunekode/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs/dist/pptxgen.es.js"
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

const brand = {
  navy: "12304A",
  blue: "1677B8",
  green: "2FB34A",
  amber: "F4AD3F",
  ink: "15202B",
  muted: "66727D",
  mist: "EEF4F7",
  paper: "FBFAF6",
  white: "FFFFFF",
}

const logo = path.join(root, "public", "brand", "ict-logo-wide.jpg")
const students = path.join(root, "public", "campus", "students-writing.jpg")
function title(slide, kicker, heading, subheading) {
  slide.addText(kicker.toUpperCase(), {
    x: 0.72,
    y: 0.45,
    w: 4.8,
    h: 0.24,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    charSpacing: 1.4,
    color: brand.blue,
    margin: 0,
  })
  slide.addText(heading, {
    x: 0.72,
    y: 0.82,
    w: 11.6,
    h: 0.76,
    fontFace: "Georgia",
    fontSize: 27,
    bold: true,
    color: brand.navy,
    breakLine: false,
    margin: 0,
  })
  if (subheading)
    slide.addText(subheading, {
      x: 0.74,
      y: 1.68,
      w: 10.7,
      h: 0.5,
      fontFace: "Aptos",
      fontSize: 12,
      color: brand.muted,
      margin: 0,
      breakLine: false,
    })
}

function card(slide, x, y, w, h, number, heading, body, accent = brand.blue) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: brand.white },
    line: { color: "D9E2E8", width: 1 },
    shadow: {
      type: "outer",
      color: "A6B3BB",
      opacity: 0.12,
      blur: 1,
      angle: 45,
      distance: 1,
    },
  })
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.07,
    h,
    fill: { color: accent },
    line: { color: accent },
  })
  slide.addText(number, {
    x: x + 0.28,
    y: y + 0.22,
    w: 0.42,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: accent,
    margin: 0,
  })
  slide.addText(heading, {
    x: x + 0.28,
    y: y + 0.57,
    w: w - 0.58,
    h: 0.42,
    fontFace: "Aptos Display",
    fontSize: 15,
    bold: true,
    color: brand.ink,
    margin: 0,
  })
  slide.addText(body, {
    x: x + 0.28,
    y: y + 1.08,
    w: w - 0.58,
    h: h - 1.28,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: brand.muted,
    breakLine: false,
    margin: 0.02,
    valign: "top",
  })
}

const pptx = new pptxgen()
pptx.layout = "LAYOUT_WIDE"
pptx.author = "Impact Career Tutorials project proposal"
pptx.subject =
  "Admissions, commerce, resources, promotions and analytics platform"
pptx.title = "Impact Career Tutorials — Digital Growth Platform"
pptx.company = "Impact Career Tutorials"
pptx.lang = "en-IN"
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN",
}
pptx.defineSlideMaster({
  title: "ICT",
  background: { color: brand.paper },
  objects: [
    {
      line: {
        x: 0.72,
        y: 6.92,
        w: 11.9,
        h: 0,
        line: { color: "D8E1E6", width: 0.6 },
      },
    },
    {
      text: {
        text: "IMPACT CAREER TUTORIALS  ·  PROJECT PROPOSAL",
        options: {
          x: 0.72,
          y: 7.03,
          w: 5,
          h: 0.18,
          fontFace: "Aptos",
          fontSize: 6.5,
          color: brand.muted,
          charSpacing: 1.1,
          margin: 0,
        },
      },
    },
  ],
  slideNumber: {
    x: 12.2,
    y: 7.02,
    w: 0.4,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 7,
    color: brand.muted,
    align: "right",
  },
})

{
  const s = pptx.addSlide()
  s.background = { color: brand.navy }
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 7.9,
    h: 7.5,
    fill: { color: brand.navy },
    line: { color: brand.navy },
  })
  s.addImage({
    path: students,
    x: 8.15,
    y: 0,
    w: 5.18,
    h: 7.5,
    sizing: "cover",
    transparency: 7,
  })
  s.addShape(pptx.ShapeType.rect, {
    x: 7.85,
    y: 0,
    w: 2.2,
    h: 7.5,
    fill: { color: brand.navy, transparency: 20 },
    line: { color: brand.navy, transparency: 100 },
  })
  s.addImage({ path: logo, x: 0.72, y: 0.55, w: 2.65, h: 1.3, transparency: 0 })
  s.addText("A digital platform built to convert interest into action", {
    x: 0.76,
    y: 2.35,
    w: 6.55,
    h: 1.55,
    fontFace: "Georgia",
    fontSize: 30,
    bold: true,
    color: brand.white,
    margin: 0,
    breakLine: false,
  })
  s.addText(
    "Admissions · Free resources · Physical books · Library · Promotions · Analytics",
    {
      x: 0.78,
      y: 4.28,
      w: 6.4,
      h: 0.66,
      fontFace: "Aptos",
      fontSize: 13,
      color: "D8E7F1",
      margin: 0,
    }
  )
  s.addShape(pptx.ShapeType.line, {
    x: 0.78,
    y: 5.25,
    w: 1.1,
    h: 0,
    line: { color: brand.amber, width: 4 },
  })
  s.addText("Five-week launch proposal", {
    x: 0.78,
    y: 5.5,
    w: 3.6,
    h: 0.34,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: brand.amber,
    margin: 0,
  })
  s.addText("Prepared for Impact Career Tutorials", {
    x: 0.78,
    y: 6.05,
    w: 4.5,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 10,
    color: "B9CBD8",
    margin: 0,
  })
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "The opportunity",
    "One connected journey, not a collection of pages",
    "The website should help a student decide, act, and receive a timely response while giving staff control of daily operations."
  )
  card(
    s,
    0.72,
    2.35,
    3.75,
    3.55,
    "01",
    "Discover",
    "Search-friendly course pages, verified proof, faculty, resources and clear programme comparisons."
  )
  card(
    s,
    4.8,
    2.35,
    3.75,
    3.55,
    "02",
    "Take action",
    "Enquire, unlock a resource, buy a physical book, apply for the library, or continue on WhatsApp.",
    brand.green
  )
  card(
    s,
    8.88,
    2.35,
    3.75,
    3.55,
    "03",
    "Follow through",
    "Staff receive structured leads, orders and applications with status, ownership, follow-up and reporting.",
    brand.amber
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Experience quality",
    "Designed deliberately for every important screen",
    "Phones, iPads and other tablets, laptops, and large displays receive equal design and testing attention."
  )
  const devices = [
    { x: 0.9, y: 2.7, w: 1.55, h: 3.2, label: "Mobile", accent: brand.blue },
    {
      x: 3.0,
      y: 2.25,
      w: 2.75,
      h: 3.65,
      label: "iPad / tablet",
      accent: brand.green,
    },
    {
      x: 6.35,
      y: 2.5,
      w: 5.75,
      h: 3.4,
      label: "Laptop / desktop",
      accent: brand.amber,
    },
  ]
  for (const d of devices) {
    s.addShape(pptx.ShapeType.roundRect, {
      x: d.x,
      y: d.y,
      w: d.w,
      h: d.h,
      rectRadius: 0.08,
      fill: { color: "FFFFFF" },
      line: { color: d.accent, width: 2 },
    })
    s.addShape(pptx.ShapeType.rect, {
      x: d.x + 0.16,
      y: d.y + 0.22,
      w: d.w - 0.32,
      h: d.h - 0.62,
      fill: { color: brand.mist },
      line: { color: brand.mist },
    })
    s.addText(d.label, {
      x: d.x,
      y: d.y + d.h + 0.2,
      w: d.w,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10,
      bold: true,
      color: d.accent,
      align: "center",
      margin: 0,
    })
  }
  s.addText(
    "Touch-friendly admin · readable forms · no horizontal overflow · fast on weaker connections · keyboard accessible",
    {
      x: 1.05,
      y: 6.35,
      w: 11.2,
      h: 0.32,
      fontFace: "Aptos",
      fontSize: 10.5,
      color: brand.muted,
      align: "center",
      margin: 0,
    }
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Launch scope",
    "Six modules working as one platform",
    "Each module has a public experience, a staff workflow, and measurable outcomes."
  )
  const items = [
    [
      "01",
      "Courses & enquiries",
      "Programme clarity, CTAs, one lead history and staff follow-up.",
    ],
    [
      "02",
      "Free resources",
      "Search, gated access, consent and fast PDF delivery.",
    ],
    [
      "03",
      "Physical books",
      "Catalogue, cart, Razorpay, availability, orders and WhatsApp order updates.",
    ],
    [
      "04",
      "Library",
      "Plans, facilities, rules, application and staff review.",
    ],
    [
      "05",
      "Promotions",
      "Scheduled banners, inline campaigns, targeting and expiry.",
    ],
    [
      "06",
      "Analytics & SEO",
      "Conversion funnels, Search Console and crawlable content.",
    ],
  ]
  items.forEach((it, i) =>
    card(
      s,
      0.72 + (i % 3) * 4.08,
      2.25 + Math.floor(i / 3) * 2.08,
      3.72,
      1.72,
      it[0],
      it[1],
      it[2],
      [brand.blue, brand.green, brand.amber][i % 3]
    )
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Staff operations",
    "A small admin built around the work people actually do",
    "No heavyweight CRM. Staff see what needs attention and complete the next action quickly."
  )
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.72,
    y: 2.25,
    w: 7.9,
    h: 3.95,
    fill: { color: "FFFFFF" },
    line: { color: "D6E0E6" },
  })
  s.addText("TODAY", {
    x: 1.05,
    y: 2.55,
    w: 1,
    h: 0.23,
    fontFace: "Aptos",
    fontSize: 8,
    bold: true,
    color: brand.blue,
    charSpacing: 1,
    margin: 0,
  })
  const rows = [
    ["New or updated leads", "12", "Assign and contact"],
    ["Follow-ups due", "5", "Call or WhatsApp"],
    ["Paid orders", "4", "Pack and dispatch"],
    ["Library applications", "7", "Review details"],
  ]
  rows.forEach((r, i) => {
    const y = 3.05 + i * 0.72
    s.addShape(pptx.ShapeType.line, {
      x: 1.04,
      y: y + 0.5,
      w: 6.95,
      h: 0,
      line: { color: "E5EAED", width: 0.7 },
    })
    s.addText(r[0], {
      x: 1.05,
      y,
      w: 3.4,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 11,
      bold: true,
      color: brand.ink,
      margin: 0,
    })
    s.addText(r[1], {
      x: 4.82,
      y,
      w: 0.55,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 11,
      bold: true,
      color: brand.blue,
      align: "center",
      margin: 0,
    })
    s.addText(r[2], {
      x: 5.65,
      y,
      w: 2.2,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10,
      color: brand.muted,
      align: "right",
      margin: 0,
    })
  })
  card(
    s,
    8.95,
    2.25,
    3.66,
    1.8,
    "A",
    "One lead history",
    "Repeat submissions update the same person while preserving every enquiry.",
    brand.blue
  )
  card(
    s,
    8.95,
    4.4,
    3.66,
    1.8,
    "B",
    "Visible exceptions",
    "Payment mismatch, overdue follow-up and failed actions are surfaced.",
    brand.amber
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Promotions",
    "Campaign control without asking a developer",
    "Staff can plan a course launch or book offer, target the right pages, and measure the result."
  )
  const steps = ["Draft", "Preview", "Schedule", "Publish", "Measure"]
  steps.forEach((step, i) => {
    const x = 0.9 + i * 2.45
    s.addShape(pptx.ShapeType.ellipse, {
      x,
      y: 2.65,
      w: 1.2,
      h: 1.2,
      fill: { color: i === 4 ? brand.green : brand.navy },
      line: { color: i === 4 ? brand.green : brand.navy },
    })
    s.addText(String(i + 1), {
      x,
      y: 2.99,
      w: 1.2,
      h: 0.3,
      fontFace: "Georgia",
      fontSize: 16,
      bold: true,
      color: brand.white,
      align: "center",
      margin: 0,
    })
    s.addText(step, {
      x: x - 0.3,
      y: 4.08,
      w: 1.8,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 11,
      bold: true,
      color: brand.ink,
      align: "center",
      margin: 0,
    })
    if (i < 4)
      s.addShape(pptx.ShapeType.line, {
        x: x + 1.25,
        y: 3.25,
        w: 1.15,
        h: 0,
        line: {
          color: "AFC0CB",
          width: 1.3,
          beginArrowType: "none",
          endArrowType: "triangle",
        },
      })
  })
  s.addText("Announcement bar", {
    x: 1.0,
    y: 5.1,
    w: 3.1,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: brand.blue,
    align: "center",
    margin: 0,
  })
  s.addText("Inline campaign card", {
    x: 5.1,
    y: 5.1,
    w: 3.1,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: brand.green,
    align: "center",
    margin: 0,
  })
  s.addText("One restrained modal", {
    x: 9.15,
    y: 5.1,
    w: 3.1,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: brand.amber,
    align: "center",
    margin: 0,
  })
  s.addText("No stacked popups, false scarcity or distracting auto-rotation", {
    x: 3.25,
    y: 5.8,
    w: 6.8,
    h: 0.35,
    fontFace: "Aptos",
    fontSize: 10,
    italic: true,
    color: brand.muted,
    align: "center",
    margin: 0,
  })
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Measurement",
    "A business dashboard the owner can understand",
    "PostHog shows where interest comes from, what people do next, and where they abandon. Personal lead details stay in the admin."
  )
  const metrics = [
    ["1,842", "Visitors"],
    ["126", "Qualified actions"],
    ["42", "WhatsApp handoffs"],
    ["18", "Paid orders"],
  ]
  metrics.forEach((m, i) => {
    const x = 0.72 + i * 3.0
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.2,
      w: 2.68,
      h: 1.1,
      fill: { color: "FFFFFF" },
      line: { color: "D7E1E7" },
    })
    s.addText(m[0], {
      x: x + 0.25,
      y: 2.42,
      w: 1.1,
      h: 0.38,
      fontFace: "Georgia",
      fontSize: 21,
      bold: true,
      color: brand.navy,
      margin: 0,
    })
    s.addText(m[1], {
      x: x + 1.24,
      y: 2.48,
      w: 1.15,
      h: 0.25,
      fontFace: "Aptos",
      fontSize: 9.5,
      color: brand.muted,
      align: "right",
      margin: 0,
    })
  })
  s.addText("Course enquiry funnel", {
    x: 0.85,
    y: 3.8,
    w: 2.4,
    h: 0.28,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: brand.ink,
    margin: 0,
  })
  const funnel = [
    ["Course viewed", 100, brand.blue],
    ["CTA clicked", 41, "368FC0"],
    ["Form started", 27, brand.amber],
    ["Lead submitted", 19, brand.green],
  ]
  funnel.forEach((f, i) => {
    const y = 4.25 + i * 0.48
    s.addText(f[0], {
      x: 0.85,
      y,
      w: 1.35,
      h: 0.22,
      fontFace: "Aptos",
      fontSize: 8.5,
      color: brand.muted,
      margin: 0,
    })
    s.addShape(pptx.ShapeType.roundRect, {
      x: 2.2,
      y: y + 0.01,
      w: f[1] * 0.045,
      h: 0.22,
      rectRadius: 0.03,
      fill: { color: f[2] },
      line: { color: f[2] },
    })
    s.addText(`${f[1]}%`, {
      x: 6.82,
      y,
      w: 0.45,
      h: 0.22,
      fontFace: "Aptos",
      fontSize: 8,
      bold: true,
      color: brand.ink,
      align: "right",
      margin: 0,
    })
  })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 8.1,
    y: 3.75,
    w: 4.4,
    h: 2.4,
    fill: { color: brand.navy },
    line: { color: brand.navy },
  })
  s.addText("What this answers", {
    x: 8.45,
    y: 4.12,
    w: 3.7,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 12,
    bold: true,
    color: brand.white,
    margin: 0,
  })
  s.addText(
    "• Which course pages create enquiries?\n• Which promotion creates orders?\n• Where does checkout lose people?\n• Which channels create real action?",
    {
      x: 8.45,
      y: 4.6,
      w: 3.55,
      h: 1.15,
      fontFace: "Aptos",
      fontSize: 10.5,
      color: "DCE8F0",
      margin: 0.02,
      breakLine: false,
    }
  )
  s.addText("Illustrative dashboard — final figures come from live usage", {
    x: 0.85,
    y: 6.38,
    w: 5.5,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 7.5,
    italic: true,
    color: brand.muted,
    margin: 0,
  })
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Search visibility",
    "Build evidence and improve local discovery over time",
    "The launch creates a strong technical foundation. Ongoing local growth is measured separately and cannot honestly guarantee a fixed rank."
  )
  const cols = [
    [
      "At launch",
      "Crawlable course and book pages\nUnique metadata and structured data\nSitemap and Search Console\nConsistent business details",
    ],
    [
      "Ongoing",
      "Business Profile posts and photos\nGenuine review workflow\nLocal content and citations\nMonthly query and conversion review",
    ],
    [
      "Measured by",
      "Search impressions and clicks\nProfile calls and directions\nEnquiries by landing page\nQualified actions, not vanity traffic",
    ],
  ]
  cols.forEach((c, i) =>
    card(
      s,
      0.72 + i * 4.08,
      2.3,
      3.74,
      3.85,
      String(i + 1).padStart(2, "0"),
      c[0],
      c[1],
      [brand.blue, brand.green, brand.amber][i]
    )
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Delivery",
    "Five weeks, with clear review points",
    "The schedule begins after the advance, approved starting content, and required account access are received."
  )
  const weeks = [
    [
      "01",
      "Direction",
      "Requirements freeze, content audit, main journeys and visual approval.",
    ],
    [
      "02",
      "Public platform",
      "Courses, enquiries, resources and responsive system.",
    ],
    ["03", "Commerce", "Books, cart, checkout and library applications."],
    ["04", "Operations", "Admin, promotions, orders, leads and analytics."],
    [
      "05",
      "Launch",
      "SEO, content entry, testing, training and production release.",
    ],
  ]
  weeks.forEach((w, i) => {
    const x = 0.72 + i * 2.42
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.35,
      w: 2.15,
      h: 3.55,
      fill: { color: i === 4 ? brand.navy : "FFFFFF" },
      line: { color: i === 4 ? brand.navy : "D7E1E7" },
    })
    s.addText(w[0], {
      x: x + 0.23,
      y: 2.66,
      w: 0.45,
      h: 0.3,
      fontFace: "Georgia",
      fontSize: 14,
      bold: true,
      color: i === 4 ? brand.amber : brand.blue,
      margin: 0,
    })
    s.addText(w[1], {
      x: x + 0.23,
      y: 3.27,
      w: 1.72,
      h: 0.55,
      fontFace: "Aptos Display",
      fontSize: 14,
      bold: true,
      color: i === 4 ? brand.white : brand.ink,
      margin: 0,
    })
    s.addText(w[2], {
      x: x + 0.23,
      y: 4.12,
      w: 1.68,
      h: 1.35,
      fontFace: "Aptos",
      fontSize: 9.5,
      color: i === 4 ? "D5E3EC" : brand.muted,
      margin: 0,
    })
  })
  s.addText(
    "Client feedback requested within two business days at each approval point",
    {
      x: 2.6,
      y: 6.35,
      w: 8.2,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10,
      bold: true,
      color: brand.blue,
      align: "center",
      margin: 0,
    }
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "Investment",
    "A complete five-week launch",
    "The scope includes design, implementation, operational workflows, analytics, deployment and staff handoff."
  )
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: 2.3,
    w: 5.25,
    h: 3.75,
    fill: { color: brand.navy },
    line: { color: brand.navy },
  })
  s.addText("PROJECT INVESTMENT", {
    x: 1.15,
    y: 2.78,
    w: 2.6,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 8,
    bold: true,
    charSpacing: 1.3,
    color: "AFC7D7",
    margin: 0,
  })
  s.addText("₹37,500", {
    x: 1.12,
    y: 3.35,
    w: 3.8,
    h: 0.85,
    fontFace: "Georgia",
    fontSize: 38,
    bold: true,
    color: brand.white,
    margin: 0,
  })
  s.addText(
    "50% to begin  ·  30% at working preview  ·  20% at production acceptance",
    {
      x: 1.15,
      y: 4.62,
      w: 4.25,
      h: 0.68,
      fontFace: "Aptos",
      fontSize: 10.5,
      color: "DCE7EE",
      margin: 0,
    }
  )
  s.addText(
    "Five-week target subject to timely content, approvals and provider verification.",
    {
      x: 1.15,
      y: 5.38,
      w: 4.2,
      h: 0.4,
      fontFace: "Aptos",
      fontSize: 8.5,
      italic: true,
      color: brand.amber,
      margin: 0,
    }
  )
  card(
    s,
    6.55,
    2.3,
    2.85,
    1.75,
    "01",
    "Approve scope",
    "Confirm inclusions, exclusions and content limits.",
    brand.blue
  )
  card(
    s,
    9.72,
    2.3,
    2.85,
    1.75,
    "02",
    "Share inputs",
    "Provide content, accounts, policies and catalogue data.",
    brand.green
  )
  card(
    s,
    6.55,
    4.4,
    2.85,
    1.75,
    "03",
    "Begin delivery",
    "Advance payment reserves the five-week production window.",
    brand.amber
  )
  card(
    s,
    9.72,
    4.4,
    2.85,
    1.75,
    "04",
    "Review weekly",
    "Short decisions keep scope and schedule controlled.",
    brand.blue
  )
}

{
  const s = pptx.addSlide("ICT")
  title(
    s,
    "PostHog reference",
    "Useful official examples to open during the meeting",
    "These explain the exact capabilities. The ICT dashboard will be simpler and tailored to admissions, resources, books and promotions."
  )
  const links = [
    [
      "Product analytics",
      "Events, trends and meaningful actions",
      "https://posthog.com/docs/product-analytics",
    ],
    [
      "Funnels",
      "See each conversion step and where people abandon",
      "https://posthog.com/docs/product-analytics/funnels",
    ],
    [
      "Dashboards",
      "Keep recurring metrics in one owner view",
      "https://posthog.com/docs/product-analytics/dashboards",
    ],
    [
      "Session replay",
      "Watch privacy-masked journeys to find UX problems",
      "https://posthog.com/docs/session-replay",
    ],
    [
      "Web analytics",
      "Traffic sources, pages, devices and referrers",
      "https://posthog.com/docs/web-analytics",
    ],
    [
      "Pricing",
      "Current free allowances and usage pricing",
      "https://posthog.com/pricing",
    ],
  ]
  links.forEach((l, i) => {
    const x = 0.75 + (i % 2) * 6.05
    const y = 2.2 + Math.floor(i / 2) * 1.34
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 5.7,
      h: 1.02,
      fill: { color: "FFFFFF" },
      line: { color: "D7E1E7" },
    })
    s.addText(l[0], {
      x: x + 0.28,
      y: y + 0.18,
      w: 2.2,
      h: 0.26,
      fontFace: "Aptos",
      fontSize: 11,
      bold: true,
      color: brand.blue,
      hyperlink: { url: l[2] },
      margin: 0,
    })
    s.addText(l[1], {
      x: x + 0.28,
      y: y + 0.52,
      w: 5.05,
      h: 0.24,
      fontFace: "Aptos",
      fontSize: 8.5,
      color: brand.muted,
      margin: 0,
    })
  })
  s.addText(
    "Tip: open Funnels and Session Replay before the meeting and keep them in browser tabs.",
    {
      x: 2.2,
      y: 6.42,
      w: 8.9,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10,
      italic: true,
      color: brand.navy,
      align: "center",
      margin: 0,
    }
  )
}

await pptx.writeFile({
  fileName: path.join(out, "ICT-Digital-Growth-Platform-Presentation.pptx"),
})

const font = "Aptos"
const heading = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    heading: level,
    spacing: {
      before: level === HeadingLevel.HEADING_1 ? 280 : 180,
      after: 100,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? brand.navy : brand.blue,
        font,
      }),
    ],
  })
const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 110, line: 276 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        font,
        size: opts.size ?? 20,
        color: opts.color ?? brand.ink,
        bold: opts.bold,
        italics: opts.italics,
      }),
    ],
  })
const bullet = (text) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 70, line: 260 },
    children: [new TextRun({ text, font, size: 19, color: brand.ink })],
  })
const pageBreak = () => new Paragraph({ children: [new PageBreak()] })

const paymentTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    ["Milestone", "Amount", "Trigger"],
    [
      "Project commencement",
      "₹18,750 (50%)",
      "Scope acceptance and production slot reservation",
    ],
    [
      "Working preview",
      "₹11,250 (30%)",
      "Public experience and admin preview available",
    ],
    ["Production acceptance", "₹7,500 (20%)", "Approved launch and handoff"],
  ].map(
    (r, ri) =>
      new TableRow({
        children: r.map(
          (c) =>
            new TableCell({
              shading:
                ri === 0
                  ? { fill: brand.navy, type: ShadingType.CLEAR }
                  : undefined,
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: c,
                      font,
                      size: 18,
                      bold: ri === 0,
                      color: ri === 0 ? brand.white : brand.ink,
                    }),
                  ],
                }),
              ],
            })
        ),
      })
  ),
})

const doc = new Document({
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
            style: { paragraph: { indent: { left: 420, hanging: 220 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font, size: 20, color: brand.ink },
        paragraph: { spacing: { line: 276 } },
      },
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Georgia", size: 42, bold: true, color: brand.navy },
        paragraph: { spacing: { after: 260 } },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Georgia", size: 28, bold: true, color: brand.navy },
        paragraph: { spacing: { before: 280, after: 120 }, keepNext: true },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font, size: 22, bold: true, color: brand.blue },
        paragraph: { spacing: { before: 180, after: 90 }, keepNext: true },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 1050, right: 900, bottom: 900, left: 900 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "IMPACT CAREER TUTORIALS  ·  PROJECT PROPOSAL",
                  font,
                  size: 14,
                  bold: true,
                  color: brand.muted,
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
                new TextRun({
                  text: "Prepared 17 September 2026  ·  ",
                  font,
                  size: 14,
                  color: brand.muted,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font,
                  size: 14,
                  color: brand.muted,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 500, after: 280 },
          children: [
            new ImageRun({
              data: fs.readFileSync(logo),
              transformation: { width: 360, height: 176 },
              type: "jpg",
            }),
          ],
        }),
        new Paragraph({
          style: "Title",
          alignment: AlignmentType.CENTER,
          children: [new TextRun("Digital admissions and commerce platform")],
        }),
        p(
          "A five-week proposal for a premium responsive website, enquiries, free resources, physical books, library applications, promotions, analytics and staff operations.",
          { align: AlignmentType.CENTER, size: 23, color: brand.muted }
        ),
        new Paragraph({
          spacing: { before: 520, after: 80 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "PROJECT INVESTMENT",
              font,
              size: 16,
              bold: true,
              color: brand.blue,
              characterSpacing: 120,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: "₹37,500",
              font: "Georgia",
              size: 48,
              bold: true,
              color: brand.navy,
            }),
          ],
        }),
        p("Target delivery: five weeks from project commencement", {
          align: AlignmentType.CENTER,
          bold: true,
          color: brand.green,
        }),
        p(
          "Subject to timely content, account access, consolidated approvals and payment-provider verification.",
          {
            align: AlignmentType.CENTER,
            size: 17,
            italics: true,
            color: brand.muted,
          }
        ),
        pageBreak(),
        heading("The proposed outcome"),
        p(
          "The project will turn the current website into a connected platform that helps prospective students understand ICT's programmes, trust the institute, take the right next step, and receive a timely response."
        ),
        p(
          "ICT staff will receive a focused admin dashboard for enquiries, resources, books, orders, library applications and promotions. Routine updates will not require developer involvement."
        ),
        heading("Designed across devices", HeadingLevel.HEADING_2),
        p(
          "The platform will be designed and tested as a responsive system for mobile phones, iPad and other tablets, laptops, and large desktop displays. Tablet layouts will receive dedicated treatment rather than appearing as stretched mobile or compressed desktop screens."
        ),
        heading("Included public experience", HeadingLevel.HEADING_2),
        bullet(
          "Premium responsive visual direction using approved ICT content and brand assets."
        ),
        bullet(
          "Homepage, institute and faculty content, course catalogue and course details, verified results and success stories, resources, books, cart, checkout, library, contact and required policy pages."
        ),
        bullet(
          "Clear calls to action for course enquiries, calls, WhatsApp, Telegram, resource access, book purchases and library applications."
        ),
        bullet(
          "Accessible navigation and forms, fast loading, low-bandwidth consideration, touch and keyboard support."
        ),
        pageBreak(),
        heading("Included operational modules"),
        heading("Enquiries and staff workflow", HeadingLevel.HEADING_2),
        bullet("Lead capture with course, campaign and source attribution."),
        bullet(
          "Lead stages, staff assignment, notes, next follow-up, call/WhatsApp shortcuts, filters and CSV export."
        ),
        bullet(
          "Duplicate detection and an activity history for significant changes."
        ),
        heading("Free resources", HeadingLevel.HEADING_2),
        bullet("Searchable resource catalogue with approved categories."),
        bullet(
          "Name, phone/email and consent capture where required, followed by immediate access."
        ),
        bullet("Fast Cloudflare R2 delivery and admin-controlled metadata."),
        heading("Physical books", HeadingLevel.HEADING_2),
        bullet(
          "Book catalogue, details, availability, cart, address collection and order summary."
        ),
        bullet(
          "Razorpay Standard Checkout with server-verified amount, availability, signature and payment status."
        ),
        bullet(
          "Paid, packing, shipped, delivered, cancelled and refunded staff workflow."
        ),
        bullet("Customer-facing success, pending, failure and retry states."),
        heading("Library applications", HeadingLevel.HEADING_2),
        bullet(
          "Approved facilities, plans, rules and timings with an application flow."
        ),
        bullet(
          "Admin review and status management. Online library payment is excluded from this phase."
        ),
        pageBreak(),
        heading("Promotions, analytics and search"),
        heading("Promotion system", HeadingLevel.HEADING_2),
        bullet(
          "Admin-controlled announcement bar, inline campaign cards and one restrained modal placement."
        ),
        bullet(
          "Route targeting, schedule, expiry, priority, call to action, publish state and dismissal rules."
        ),
        bullet(
          "Campaign analytics for views, clicks, enquiries and attributable orders."
        ),
        heading("PostHog owner dashboard", HeadingLevel.HEADING_2),
        bullet("Visitors and leading entry pages."),
        bullet("Course enquiry, resource unlock and book purchase funnels."),
        bullet("WhatsApp handoffs, library applications and campaign results."),
        bullet(
          "Consent-aware, sampled session replay with sensitive forms and admin surfaces masked."
        ),
        p(
          "PostHog is used for aggregate analysis. Named leads, applications and orders remain in the protected admin dashboard.",
          { italics: true, color: brand.muted }
        ),
        heading("Search foundation", HeadingLevel.HEADING_2),
        bullet(
          "Unique metadata, canonical URLs, sitemap, robots rules and supported structured data."
        ),
        bullet(
          "Crawlable course, resource and book information with intentional internal linking."
        ),
        bullet("Google Search Console connection and indexing checks."),
        bullet(
          "Google Business Profile audit and consistency handoff checklist."
        ),
        p(
          "Ongoing profile publishing, reviews, local citations and competitive content are a separate growth service. No fixed Google position is guaranteed.",
          { italics: true, color: brand.muted }
        ),
        pageBreak(),
        heading("Five-week delivery plan"),
        heading("Week 1 — direction and scope", HeadingLevel.HEADING_2),
        p(
          "Requirements freeze, content audit, information architecture, main journeys, visual direction and approval."
        ),
        heading("Week 2 — public platform", HeadingLevel.HEADING_2),
        p("Courses, enquiries, resources and the responsive layout system."),
        heading("Week 3 — commerce and library", HeadingLevel.HEADING_2),
        p(
          "Book catalogue, cart, checkout, order states and library applications."
        ),
        heading("Week 4 — operations and promotions", HeadingLevel.HEADING_2),
        p(
          "Admin workflows, lead handling, order fulfilment, promotions and analytics."
        ),
        heading("Week 5 — qualification and launch", HeadingLevel.HEADING_2),
        p(
          "SEO, approved content entry, responsive and accessibility verification, payment testing, training and production release."
        ),
        p(
          "Consolidated client feedback is requested within two business days at each approval point. Delayed content, access or approval moves the target date by the corresponding delay.",
          { bold: true, color: brand.blue }
        ),
        pageBreak(),
        heading("Commercial terms"),
        paymentTable,
        heading("Included handoff", HeadingLevel.HEADING_2),
        bullet(
          "Production deployment, domain connection and separate development and production environments."
        ),
        bullet(
          "Initial population of the existing course catalogue, up to 20 books and up to 30 resources using complete client-supplied data."
        ),
        bullet(
          "One recorded staff training session and written operational guidance."
        ),
        bullet("Thirty days of post-launch defect support."),
        heading("Revision and change control", HeadingLevel.HEADING_2),
        p(
          "Two consolidated revision rounds are included at each design approval stage. Requests outside the approved scope will be documented with their price and timeline effect and will begin only after written approval."
        ),
        heading("Client-owned services", HeadingLevel.HEADING_2),
        p(
          "Production accounts for the domain, Cloudflare, Convex, Meta WhatsApp Business, PostHog, Razorpay, Google Search Console and Google Business Profile will be owned by ICT. Third-party subscriptions, transaction charges, messaging charges and taxes are paid directly by ICT."
        ),
        pageBreak(),
        heading("Exclusions and responsibilities"),
        heading("Not included in this phase", HeadingLevel.HEADING_2),
        bullet("Guaranteed Google rankings or ongoing local SEO operations."),
        bullet(
          "AI assistant, automated WhatsApp replies or WhatsApp Business API charges."
        ),
        bullet(
          "Online library payment, student accounts, LMS, tests, attendance, live classes or Classplus migration."
        ),
        bullet(
          "Digital paid-book delivery, courier procurement, packaging, dispatch or accounting integration."
        ),
        bullet(
          "Photography, videography, full copywriting, brand identity work, unlimited content entry or unlimited revisions."
        ),
        heading("ICT responsibilities", HeadingLevel.HEADING_2),
        p(
          "ICT will provide and approve its official name, address, hours, contacts, programme information, fees, schedules, faculty information, results evidence and permissions, resource files, book details and covers, which books are available to order, delivery charges, library rules, legal policies, payment account and responsible staff contacts."
        ),
        p(
          "The project begins after written acceptance, the first payment, and receipt of the starting content and account-access checklist. This quotation is valid for 15 days.",
          { bold: true, color: brand.navy }
        ),
        heading("Future opportunity", HeadingLevel.HEADING_2),
        p(
          "The platform will remain ready for a separately scoped enquiry and staff-reply assistant. Any later proposal will be based on ICT's approved knowledge, real language patterns, accuracy evaluation and staff escalation process."
        ),
        pageBreak(),
        heading("Acceptance"),
        p("Accepted for Impact Career Tutorials"),
        p("Name: __________________________________________"),
        p("Signature: _______________________________________"),
        p("Date: ___________________________________________"),
        new Paragraph({ spacing: { before: 500 } }),
        p("Service provider"),
        p("Name: __________________________________________"),
        p("Signature: _______________________________________"),
        p("Date: ___________________________________________"),
      ],
    },
  ],
})

await fs.promises.writeFile(
  path.join(out, "ICT-Project-Proposal-and-Quotation.docx"),
  await Packer.toBuffer(doc)
)

const briefProposal = new Document({
  numbering: {
    config: [
      {
        reference: "brief-bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 420, hanging: 220 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font, size: 20, color: brand.ink },
        paragraph: { spacing: { line: 276 } },
      },
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: "Georgia",
          size: 40,
          bold: true,
          color: brand.navy,
        },
        paragraph: { spacing: { after: 220 } },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: "Georgia",
          size: 27,
          bold: true,
          color: brand.navy,
        },
        paragraph: { spacing: { before: 220, after: 100 }, keepNext: true },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font, size: 21, bold: true, color: brand.blue },
        paragraph: { spacing: { before: 140, after: 70 }, keepNext: true },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 780, right: 850, bottom: 760, left: 850 } },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Impact Career Tutorials  ·  Project proposal  ·  ",
                  font,
                  size: 13,
                  color: brand.muted,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font,
                  size: 13,
                  color: brand.muted,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [
            new ImageRun({
              data: fs.readFileSync(logo),
              transformation: { width: 250, height: 122 },
              type: "jpg",
            }),
          ],
        }),
        new Paragraph({
          style: "Title",
          alignment: AlignmentType.CENTER,
          children: [new TextRun("Digital growth platform")],
        }),
        p(
          "A responsive admissions, resources, physical-book commerce, library and staff-operations platform.",
          { align: AlignmentType.CENTER, size: 21, color: brand.muted }
        ),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 20 },
          children: [
            new TextRun({
              text: "PROJECT INVESTMENT",
              font,
              size: 14,
              bold: true,
              color: brand.blue,
              characterSpacing: 100,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "₹37,500",
              font: "Georgia",
              size: 44,
              bold: true,
              color: brand.navy,
            }),
          ],
        }),
        p("Target delivery: five weeks from project commencement", {
          align: AlignmentType.CENTER,
          bold: true,
          color: brand.green,
        }),
        heading("What is included"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            [
              "Premium responsive experience",
              "Courses and enquiries",
              "Free resources",
            ],
            [
              "Mobile, iPad/tablet, laptop and desktop design with accessible, fast-loading pages.",
              "Course discovery, details, calls to action, lead capture and staff follow-up.",
              "Searchable PDFs, short access form, consent and fast Cloudflare R2 delivery.",
            ],
            ["Physical books", "Library", "Promotions"],
            [
              "Catalogue, cart, Razorpay checkout, availability, orders, fulfilment and WhatsApp order updates.",
              "Facilities, plans, rules, application form and staff review workflow.",
              "Admin-controlled banners and campaign cards with schedule, targeting and measurement.",
            ],
          ].map(
            (row, ri) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      shading:
                        ri % 2 === 0
                          ? { fill: brand.navy, type: ShadingType.CLEAR }
                          : { fill: "F5F8FA", type: ShadingType.CLEAR },
                      margins: {
                        top: 100,
                        bottom: 100,
                        left: 110,
                        right: 110,
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: cell,
                              font,
                              size: ri % 2 === 0 ? 17 : 16,
                              bold: ri % 2 === 0,
                              color: ri % 2 === 0 ? brand.white : brand.ink,
                            }),
                          ],
                        }),
                      ],
                    })
                ),
              })
          ),
        }),
        pageBreak(),
        heading("Staff control and measurement"),
        new Paragraph({
          numbering: { reference: "brief-bullets", level: 0 },
          children: [
            new TextRun({
              text: "Admin dashboard for leads, resources, books, orders, library applications and promotions.",
              font,
              size: 19,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "brief-bullets", level: 0 },
          children: [
            new TextRun({
              text: "One lead history: repeat forms are matched using normalized phone/email while every enquiry and campaign touch remains visible.",
              font,
              size: 19,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "brief-bullets", level: 0 },
          children: [
            new TextRun({
              text: "WhatsApp messages for customer order confirmation and staff new-order notification; ICT's verified WhatsApp Business number required.",
              font,
              size: 19,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "brief-bullets", level: 0 },
          children: [
            new TextRun({
              text: "PostHog owner dashboard for enquiries, resource unlocks, WhatsApp handoffs, promotions and cart-to-paid conversion.",
              font,
              size: 19,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "brief-bullets", level: 0 },
          children: [
            new TextRun({
              text: "Search Console, technical SEO foundation, deployment, initial content population, training and 30 days of defect support.",
              font,
              size: 19,
            }),
          ],
        }),
        heading("Payment and delivery", HeadingLevel.HEADING_2),
        p(
          "50% to begin · 30% at working preview · 20% before production launch",
          {
            bold: true,
            color: brand.navy,
          }
        ),
        p(
          "The five-week schedule begins after scope acceptance, advance payment, required starting content and account access. Timely consolidated feedback is required at review points."
        ),
        heading("Not included in this phase", HeadingLevel.HEADING_2),
        p(
          "Guaranteed Google rankings, ongoing SEO operations, AI or automated WhatsApp assistant, online library payment, student accounts/LMS, courier operations, Classplus migration, photography, full copywriting, unlimited content entry, unlimited revisions, and third-party usage or transaction charges."
        ),
        heading("Next step", HeadingLevel.HEADING_2),
        p(
          "Confirm the scope and commercial terms, complete the detailed agreement, make the commencement payment, and provide the project content and account-access checklist.",
          { bold: true, color: brand.blue }
        ),
        p("This proposal is valid for 15 days.", {
          italics: true,
          color: brand.muted,
        }),
      ],
    },
  ],
})

await fs.promises.writeFile(
  path.join(out, "ICT-Brief-Project-Proposal.docx"),
  await Packer.toBuffer(briefProposal)
)
console.log(out)
