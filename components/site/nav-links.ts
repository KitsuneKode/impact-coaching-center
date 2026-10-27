/**
 * The desktop menus: each section's own pages, so a student reaches "APSC
 * books" or "question papers" in one move. The section name itself goes to
 * the listing. Titles and notes are `NavMenu` message keys.
 */
export const NAV_MENUS = [
  {
    key: "courses",
    href: "/courses",
    items: [
      { key: "apsc", href: "/courses#apsc", icon: "landmark" },
      { key: "adre", href: "/courses#adre", icon: "shield" },
      { key: "banking", href: "/courses#banking", icon: "bank" },
      { key: "finder", href: "/courses#finder", icon: "compass" },
      { key: "assist", href: "/assist", icon: "award" },
    ],
  },
  {
    key: "books",
    href: "/books",
    items: [
      { key: "apscBooks", href: "/books#apsc", icon: "landmark" },
      {
        key: "adreBooks",
        href: "/books#adre-and-assam-police",
        icon: "shield",
      },
      { key: "bankingBooks", href: "/books#bank-ssc-railway", icon: "bank" },
      { key: "delivery", href: "/shipping", icon: "truck" },
      { key: "cart", href: "/checkout", icon: "bag" },
    ],
  },
  {
    key: "notes",
    href: "/resources",
    items: [
      { key: "papers", href: "/resources?kind=Question+paper", icon: "file" },
      { key: "affairs", href: "/resources?kind=Current+affairs", icon: "news" },
      { key: "notesKind", href: "/resources?kind=Notes", icon: "notes" },
      {
        key: "practice",
        href: "/resources?kind=Practice+set",
        icon: "checklist",
      },
      { key: "library", href: "/library", icon: "books" },
    ],
  },
  {
    key: "exams",
    href: "/exams",
    items: [
      { key: "apscGuide", href: "/exams/apsc", icon: "landmark" },
      { key: "adreGuide", href: "/exams/adre", icon: "shield" },
      { key: "policeGuide", href: "/exams/assam-police-si", icon: "badge" },
      { key: "bankingGuide", href: "/exams/banking", icon: "bank" },
      { key: "calendar", href: "/exams/calendar", icon: "calendar" },
      { key: "blog", href: "/blog", icon: "pencil" },
    ],
  },
  {
    key: "ict",
    href: "/success-stories",
    items: [
      { key: "results", href: "/success-stories", icon: "trophy" },
      { key: "teachers", href: "/teachers", icon: "users" },
      { key: "contact", href: "/contact", icon: "map" },
    ],
  },
] as const
