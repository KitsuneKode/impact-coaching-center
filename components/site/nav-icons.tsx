import {
  Bank,
  Books,
  CalendarDots,
  Compass,
  FileText,
  ListChecks,
  MapPin,
  Medal,
  Newspaper,
  Notebook,
  PencilSimpleLine,
  PiggyBank,
  ShieldCheck,
  ShieldStar,
  ShoppingBag,
  Trophy,
  Truck,
  UsersThree,
  DoorOpen,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

/* Duotone: the outline in the tile's ink, the fill at Phosphor's 20% of it,
   so each icon reads as a small object, not a line drawing. */
const duo = (Icon: PhosphorIcon) =>
  function NavIcon({ size = 20 }: { size?: number }) {
    return <Icon aria-hidden size={size} weight="duotone" />
  }

/** The icon beside each page in the header panels and the phone menu. */
export const NAV_ICONS = {
  landmark: duo(Bank),
  shield: duo(ShieldCheck),
  bank: duo(PiggyBank),
  compass: duo(Compass),
  award: duo(Medal),
  truck: duo(Truck),
  bag: duo(ShoppingBag),
  file: duo(FileText),
  news: duo(Newspaper),
  notes: duo(Notebook),
  checklist: duo(ListChecks),
  books: duo(Books),
  badge: duo(ShieldStar),
  calendar: duo(CalendarDots),
  pencil: duo(PencilSimpleLine),
  trophy: duo(Trophy),
  users: duo(UsersThree),
  map: duo(MapPin),
  door: duo(DoorOpen),
} as const
