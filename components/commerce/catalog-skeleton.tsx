import { Skeleton } from "@/components/ui/skeleton"

/** Shared by route navigation and the catalogue filter's Suspense boundary. */
export function CatalogSkeleton({ kind }: { kind: "books" | "resources" }) {
  const books = kind === "books"
  return (
    <div className="mt-10 grid gap-8" aria-busy="true">
      <output className="sr-only">Loading {kind}…</output>
      <div aria-hidden="true" className="flex flex-wrap gap-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-10 w-20 rounded-control" />
        ))}
      </div>
      <div
        aria-hidden="true"
        className={
          books
            ? "grid grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-4"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {Array.from({ length: books ? 4 : 6 }, (_, index) => (
          <div key={index} className="grid content-start gap-4">
            <Skeleton
              className={
                books
                  ? "aspect-[3/4] w-full rounded-card"
                  : "h-48 w-full rounded-card"
              }
            />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
