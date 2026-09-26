/** Load `scripts/dev-seed.json` into a development Convex deployment. */
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
}

const flags = new Set(process.argv.slice(2))

if (!flags.has("--keep")) {
  console.log(await run("internal.devSeed.clearSeed", {}))
}

if (!flags.has("--clear")) {
  const file = Bun.file(`${here}dev-seed.json`)
  const fixture = (await file.json()) as Fixture

  // Shapes are checked by each mutation's own argument validators rather than
  // here. Two validators for one shape is how they drift apart, and Convex's
  // are the ones that actually guard the write.
  if (fixture.people?.length) {
    console.log(
      await run("internal.devSeed.seedPeople", { people: fixture.people })
    )
  }
  if (fixture.enquiries?.length) {
    console.log(
      await run("internal.devSeed.seedEnquiries", {
        enquiries: fixture.enquiries,
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
}
