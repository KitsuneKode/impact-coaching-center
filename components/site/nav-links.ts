/** The header's links, as `Nav` message keys. */
export const NAV_LINKS = [
  { href: "/courses", key: "courses" },
  { href: "/books", key: "books" },
  { href: "/resources", key: "notes" },
  { href: "/success-stories", key: "results" },
  { href: "/contact", key: "contact" },
] as const

/** Desktop "More": everything the header row has no room for. */
export const MORE_LINKS = [
  { href: "/exams", key: "exams" },
  { href: "/exams/calendar", key: "calendar" },
  { href: "/teachers", key: "teachersPage" },
  { href: "/library", key: "library" },
  { href: "/blog", key: "blog" },
  { href: "/assist", key: "assist" },
] as const

/** The fuller list the phone menu has room for. */
export const MENU_LINKS = [
  { href: "/courses", key: "courses" },
  { href: "/exams", key: "exams" },
  { href: "/books", key: "books" },
  { href: "/resources", key: "notes" },
  { href: "/library", key: "library" },
  { href: "/success-stories", key: "results" },
  { href: "/teachers", key: "teachersPage" },
  { href: "/assist", key: "assist" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const
