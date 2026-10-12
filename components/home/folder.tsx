/**
 * A free-material folder as an object: tab, back, papers and a front flap.
 * Hovering or focusing a `data-folder-open` ancestor tips the flap forward
 * and lifts the papers. Styles in app/pulse.css.
 */
export function Folder({
  name,
  count,
  label,
}: {
  name: string
  count: number
  /** "3 files, free", already in the page's language. */
  label: string
}) {
  return (
    <span data-folder data-empty={count ? undefined : ""}>
      <span data-folder-tab aria-hidden />
      <span data-folder-back aria-hidden />
      {count > 0 ? <span data-folder-paper="0" aria-hidden /> : null}
      {count > 1 ? <span data-folder-paper="1" aria-hidden /> : null}
      <span data-folder-front>
        <span data-folder-name>{name}</span>
        <span data-folder-count>{label}</span>
      </span>
    </span>
  )
}
