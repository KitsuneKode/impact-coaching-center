/** Placeholder for the books page while its sets load: head, then two cards. */
export default function Loading() {
  return (
    <main className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)]">
      <output className="sr-only">Loading books…</output>
      <div aria-hidden className="grid gap-4">
        <div className="h-4 w-28 animate-pulse rounded-full bg-secondary" />
        <div className="h-14 max-w-xl animate-pulse rounded-2xl bg-secondary md:h-20" />
        <div className="h-5 max-w-sm animate-pulse rounded-full bg-secondary" />
      </div>
      <div aria-hidden className="mbs-16 grid gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-[28px] bg-secondary md:h-72"
          />
        ))}
      </div>
    </main>
  )
}
