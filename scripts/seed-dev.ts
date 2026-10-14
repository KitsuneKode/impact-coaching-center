/**
 * Load `scripts/dev-seed.json` into a development Convex deployment.
 * --worst loads the worst-case file instead, --huge adds 1,200 enquiries,
 * --keep skips clearing first, --clear only clears.
 */
const here = new URL(".", import.meta.url).pathname

async function run(fn: string, args: unknown) {
  const proc = Bun.spawn(["bunx", "convex", "run", fn, JSON.stringify(args)], {
    cwd: `${here}..`,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  if (code !== 0) {
    // The CLI's own message names the deployment and the failing validator,
    // which is more useful than anything this script could say about it.
    throw new Error(`${fn} failed:\n${err || out}`)
  }
  return out.trim()
}

type Fixture = {
  people?: unknown[]
  enquiries?: unknown[]
  orders?: unknown[]
  books?: unknown[]
  bundles?: unknown[]
  resources?: unknown[]
  posts?: unknown[]
  campaigns?: unknown[]
}

const flags = new Set(process.argv.slice(2))

if (!flags.has("--keep")) {
  console.log(await run("internal.devSeed.clearSeed", {}))
}

if (!flags.has("--clear")) {
  const name = flags.has("--worst") ? "dev-seed.worst.json" : "dev-seed.json"
  const fixture = (await Bun.file(`${here}${name}`).json()) as Fixture
  // --huge adds 1,200 more enquiries: the list's realistic upper bound.
  if (flags.has("--huge")) {
    const huge = (await Bun.file(`${here}dev-seed.huge.json`).json()) as Fixture
    fixture.enquiries = [
      ...(fixture.enquiries ?? []),
      ...(huge.enquiries ?? []),
    ]
  }

  // Shapes are checked by each mutation's own argument validators rather than
  // here. Two validators for one shape is how they drift apart, and Convex's
  // are the ones that actually guard the write.
  if (fixture.people?.length) {
    console.log(
      await run("internal.devSeed.seedPeople", { people: fixture.people })
    )
  }
  // In slices: one mutation has a write limit, and --huge is 1,200 people.
  for (let i = 0; i < (fixture.enquiries?.length ?? 0); i += 200) {
    console.log(
      await run("internal.devSeed.seedEnquiries", {
        enquiries: fixture.enquiries!.slice(i, i + 200),
      })
    )
  }
  // The catalogue before orders: orders are priced from the seeded bundles.
  if (fixture.books?.length || fixture.resources?.length) {
    console.log(
      await run("internal.devSeed.seedCatalog", {
        books: fixture.books ?? [],
        bundles: fixture.bundles ?? [],
        resources: fixture.resources ?? [],
      })
    )
  }
  /*
   * Orders last: each attaches to the Person with its phone number, so the
   * enquiries have to exist first or every order would create a bare Person
   * of its own and the two screens would disagree about who these people are.
   */
  if (fixture.orders?.length) {
    console.log(
      await run("internal.devSeed.seedOrders", { orders: fixture.orders })
    )
  }
  if (fixture.campaigns?.length) {
    console.log(
      await run("internal.devSeed.seedCampaigns", {
        campaigns: fixture.campaigns,
      })
    )
  }
  if (fixture.posts?.length) {
    console.log(
      await run("internal.devSeed.seedPosts", { posts: fixture.posts })
    )
  }
}
