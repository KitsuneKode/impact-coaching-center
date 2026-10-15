import { Skeleton } from "@/components/ui/skeleton"
/** Placeholder for free notes while they load: head, then a row of folders. */
export default function Loading() {
  return (
    <main className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)]">
      <output className="sr-only">Loading free notes…</output>
      <div aria-hidden className="grid gap-4">
        <Skeleton className="h-4 w-28 rounded-full bg-secondary" />
        <Skeleton className="h-14 max-w-xl rounded-2xl bg-secondary md:h-20" />
        <Skeleton className="h-5 max-w-sm rounded-full bg-secondary" />
      </div>
      <div
        aria-hidden
        className="mbs-16 grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.5rem),1fr))] gap-4"
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="aspect-[5/4] rounded-[14px] bg-secondary"
          />
        ))}
      </div>
    </main>
  )
}
