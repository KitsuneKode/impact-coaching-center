/**
 * What India Post knows about a PIN code: its district, state and the post
 * offices in it, so checkout can fill the district and suggest the town as
 * soon as six digits are typed. Fetched here, not from the browser, so it
 * is cached for every buyer and the page's CSP stays as it is. A failure
 * is an empty answer: the buyer just types the rest.
 */
type PostOffice = {
  Name: string
  Block?: string
  District: string
  State: string
}

const DAY = 60 * 60 * 24

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/pin/[pin]">
) {
  const { pin } = await params
  if (!/^\d{6}$/.test(pin))
    return Response.json({ found: false }, { status: 400 })
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pin}`,
      {
        next: { revalidate: 30 * DAY },
        signal: AbortSignal.timeout(4000),
      }
    )
    if (!response.ok) throw new Error(String(response.status))
    const [result] = (await response.json()) as [
      { Status: string; PostOffice: PostOffice[] | null },
    ]
    const offices =
      result?.Status === "Success" ? (result.PostOffice ?? []) : []
    if (!offices.length)
      return Response.json(
        { found: false },
        { headers: { "Cache-Control": `public, s-maxage=${DAY}` } }
      )
    // The block is the town people write; a branch office is a village.
    const places = [
      ...new Set(
        offices.flatMap((office) => [
          office.Block && office.Block !== "NA" ? office.Block : null,
          office.Name,
        ])
      ),
    ].filter((place): place is string => Boolean(place))
    return Response.json(
      {
        found: true,
        district: offices[0]!.District,
        state: offices[0]!.State,
        places: places.slice(0, 12),
      },
      { headers: { "Cache-Control": `public, s-maxage=${30 * DAY}` } }
    )
  } catch {
    return Response.json({ found: false }, { status: 502 })
  }
}
