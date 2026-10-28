import { Skeleton } from "@/components/ui/skeleton"

/**
 * The books page while its sets load, in the page's own shape: the heading,
 * the three promises, the exam chips, then set rows (art beside the details),
 * so nothing moves when the page lands.
 */
export default function Loading() {
  return (
    <main className="container-page min-h-dvh pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)]">
      <output className="sr-only">Loading books…</output>
      <div aria-hidden className="grid gap-4">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-12 max-w-xl rounded-2xl md:h-16" />
        <Skeleton className="h-12 max-w-md rounded-2xl md:hidden" />
        <div className="mbs-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 rounded-full sm:w-64" />
          ))}
        </div>
        <div className="mbs-2 flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      </div>
      <div aria-hidden className="mbs-12 grid gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="grid overflow-clip rounded-[28px] md:grid-cols-12"
          >
            <Skeleton className="h-52 rounded-none md:col-span-5 md:h-72" />
            <div className="grid content-start gap-3 bg-card p-6 md:col-span-7 md:p-9">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
              <div className="mbs-4 flex gap-2">
                <Skeleton className="h-14 w-32 rounded-2xl" />
                <Skeleton className="h-14 w-32 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
