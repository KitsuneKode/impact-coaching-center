/** Pill links to sections further down the page. */
export function JumpChips({
  label,
  items,
}: {
  label: string
  items: { href: string; label: string }[]
}) {
  return (
    <nav aria-label={label} className="mbs-8 flex flex-wrap gap-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          data-press
          data-chip
          className="inline-flex h-11 items-center rounded-full ps-5 pe-5 text-sm font-semibold"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
