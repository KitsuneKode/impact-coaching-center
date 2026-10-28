import { Skeleton } from "@/components/ui/skeleton"

/**
 * Free notes while they load, in the page's own shape: the heading, exam
 * chips and search, the row of folders, then the list, so nothing moves
 * when the page lands.
 */
export default function Loading() {
  return (
    <main className="container-page min-h-dvh pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)]">
      <output className="sr-only">Loading free notes…</output>
      <div aria-hidden className="grid gap-4">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-12 max-w-xl rounded-2xl md:h-16" />
        <Skeleton className="h-5 max-w-md rounded-full" />
        <div className="mbs-4 flex flex-wrap items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
          <Skeleton className="h-11 w-full rounded-full md:ms-auto md:w-72" />
        </div>
      </div>
      <div
        aria-hidden
        className="mbs-10 grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.5rem),1fr))] gap-4"
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[5/4] rounded-[14px]" />
        ))}
      </div>
      <div aria-hidden className="mbs-10 grid gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </main>
  )
}
