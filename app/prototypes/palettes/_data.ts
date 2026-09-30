/* Generated from OKLCH ramps: hue and chroma held, lightness stepped. Hex values only. */
export type Step = { name: string; hex: string }
export type Palette = {
  id: string
  name: string
  tag: string
  scheme: string
  used: string
  note: string
  ratio: { label: string; pct: number; hex: string }[]
  roles: { name: string; hex: string }[]
  ramps: { name: string; steps: Step[] }[]
  pairs: { label: string; fg: string; bg: string }[]
}

const base: Palette[] = [
  {
    id: "sovereign",
    name: "Sovereign",
    tag: "ICT navy and gold",
    scheme: "Complementary",
    used: "Prototype 17, Sovereign",
    note: "A true Oxford-style navy (hue 255, chroma 0.06) against an antique gold (hue 84, chroma 0.105): opposite on the wheel, so each enriches the other. The gold is a metal, not a highlighter, so its chroma stays low and the neutrals are warm ivory to match its temperature. Gold is held to a tenth of the surface.",
    ratio: [
      {
        label: "Deep navy",
        pct: 60,
        hex: "#000820",
      },
      {
        label: "Raised navy and ivory text",
        pct: 30,
        hex: "#0D2441",
      },
      {
        label: "Antique gold",
        pct: 10,
        hex: "#D7B265",
      },
    ],
    roles: [
      {
        name: "Page",
        hex: "#000820",
      },
      {
        name: "Surface",
        hex: "#00132F",
      },
      {
        name: "Raised",
        hex: "#0D2441",
      },
      {
        name: "Ivory ink",
        hex: "#F8F3E6",
      },
      {
        name: "Muted",
        hex: "#ACB8CB",
      },
      {
        name: "Gold",
        hex: "#D7B265",
      },
      {
        name: "Gold light",
        hex: "#F2CC7E",
      },
      {
        name: "Gold deep",
        hex: "#BD994C",
      },
      {
        name: "On gold",
        hex: "#000820",
      },
    ],
    ramps: [
      {
        name: "Navy",
        steps: [
          {
            name: "50",
            hex: "#EFF6FF",
          },
          {
            name: "100",
            hex: "#D9EAFF",
          },
          {
            name: "200",
            hex: "#B6D4FA",
          },
          {
            name: "300",
            hex: "#9DBADF",
          },
          {
            name: "400",
            hex: "#85A1C5",
          },
          {
            name: "500",
            hex: "#6782A5",
          },
          {
            name: "600",
            hex: "#4B6586",
          },
          {
            name: "700",
            hex: "#354E6E",
          },
          {
            name: "800",
            hex: "#213957",
          },
          {
            name: "900",
            hex: "#0D2441",
          },
          {
            name: "950",
            hex: "#00132F",
          },
          {
            name: "975",
            hex: "#000820",
          },
        ],
      },
      {
        name: "Antique gold",
        steps: [
          {
            name: "50",
            hex: "#FEF4E0",
          },
          {
            name: "100",
            hex: "#FFE5B2",
          },
          {
            name: "200",
            hex: "#F2CC7E",
          },
          {
            name: "300",
            hex: "#D7B265",
          },
          {
            name: "400",
            hex: "#BD994C",
          },
          {
            name: "500",
            hex: "#9E7A2B",
          },
          {
            name: "600",
            hex: "#7F5D00",
          },
          {
            name: "700",
            hex: "#634800",
          },
          {
            name: "800",
            hex: "#493400",
          },
          {
            name: "900",
            hex: "#302100",
          },
          {
            name: "950",
            hex: "#1D1200",
          },
          {
            name: "975",
            hex: "#100700",
          },
        ],
      },
    ],
    pairs: [
      {
        label: "Ivory on page",
        fg: "#F8F3E6",
        bg: "#000820",
      },
      {
        label: "Muted on page",
        fg: "#ACB8CB",
        bg: "#000820",
      },
      {
        label: "Muted on raised",
        fg: "#ACB8CB",
        bg: "#0D2441",
      },
      {
        label: "Gold on page",
        fg: "#D7B265",
        bg: "#000820",
      },
      {
        label: "Navy on gold",
        fg: "#000820",
        bg: "#D7B265",
      },
    ],
  },
  {
    id: "meridian",
    name: "Meridian",
    tag: "ICT cobalt and gold",
    scheme: "Split-complementary",
    used: "Prototype 18, Meridian",
    note: "The same antique gold against a calm cobalt (262) that carries structure and links, and an azure (225) that carries facts. The page is a warm pearl so gold and ground share a temperature. Never lay gold through blue as a glow: complementary light mixes to grey.",
    ratio: [
      {
        label: "Warm pearl page",
        pct: 60,
        hex: "#F8F7F2",
      },
      {
        label: "Cobalt and navy",
        pct: 30,
        hex: "#3660AF",
      },
      {
        label: "Antique gold",
        pct: 10,
        hex: "#D7B265",
      },
    ],
    roles: [
      {
        name: "Page",
        hex: "#F8F7F2",
      },
      {
        name: "Paper",
        hex: "#FFFFFF",
      },
      {
        name: "Ink",
        hex: "#000820",
      },
      {
        name: "Muted",
        hex: "#354E6E",
      },
      {
        name: "Cobalt",
        hex: "#3660AF",
      },
      {
        name: "Cobalt deep",
        hex: "#214895",
      },
      {
        name: "Gold",
        hex: "#D7B265",
      },
      {
        name: "Gold text",
        hex: "#7F5D00",
      },
      {
        name: "Azure for facts",
        hex: "#2B6C83",
      },
    ],
    ramps: [
      {
        name: "Cobalt",
        steps: [
          {
            name: "50",
            hex: "#F0F5FE",
          },
          {
            name: "100",
            hex: "#DCE9FF",
          },
          {
            name: "200",
            hex: "#B9D2FE",
          },
          {
            name: "300",
            hex: "#90B7FF",
          },
          {
            name: "400",
            hex: "#6F9DF2",
          },
          {
            name: "500",
            hex: "#527ED0",
          },
          {
            name: "600",
            hex: "#3660AF",
          },
          {
            name: "700",
            hex: "#214895",
          },
          {
            name: "800",
            hex: "#0A317C",
          },
          {
            name: "900",
            hex: "#001B60",
          },
          {
            name: "950",
            hex: "#000B41",
          },
          {
            name: "975",
            hex: "#000033",
          },
        ],
      },
      {
        name: "Navy",
        steps: [
          {
            name: "50",
            hex: "#EFF6FF",
          },
          {
            name: "100",
            hex: "#D9EAFF",
          },
          {
            name: "200",
            hex: "#B6D4FA",
          },
          {
            name: "300",
            hex: "#9DBADF",
          },
          {
            name: "400",
            hex: "#85A1C5",
          },
          {
            name: "500",
            hex: "#6782A5",
          },
          {
            name: "600",
            hex: "#4B6586",
          },
          {
            name: "700",
            hex: "#354E6E",
          },
          {
            name: "800",
            hex: "#213957",
          },
          {
            name: "900",
            hex: "#0D2441",
          },
          {
            name: "950",
            hex: "#00132F",
          },
          {
            name: "975",
            hex: "#000820",
          },
        ],
      },
      {
        name: "Antique gold",
        steps: [
          {
            name: "50",
            hex: "#FEF4E0",
          },
          {
            name: "100",
            hex: "#FFE5B2",
          },
          {
            name: "200",
            hex: "#F2CC7E",
          },
          {
            name: "300",
            hex: "#D7B265",
          },
          {
            name: "400",
            hex: "#BD994C",
          },
          {
            name: "500",
            hex: "#9E7A2B",
          },
          {
            name: "600",
            hex: "#7F5D00",
          },
          {
            name: "700",
            hex: "#634800",
          },
          {
            name: "800",
            hex: "#493400",
          },
          {
            name: "900",
            hex: "#302100",
          },
          {
            name: "950",
            hex: "#1D1200",
          },
          {
            name: "975",
            hex: "#100700",
          },
        ],
      },
      {
        name: "Azure",
        steps: [
          {
            name: "50",
            hex: "#E8F8FF",
          },
          {
            name: "100",
            hex: "#C9EFFF",
          },
          {
            name: "200",
            hex: "#9BDCF6",
          },
          {
            name: "300",
            hex: "#82C2DC",
          },
          {
            name: "400",
            hex: "#69A9C2",
          },
          {
            name: "500",
            hex: "#4A8AA2",
          },
          {
            name: "600",
            hex: "#2B6C83",
          },
          {
            name: "700",
            hex: "#0D556C",
          },
          {
            name: "800",
            hex: "#003E51",
          },
          {
            name: "900",
            hex: "#002936",
          },
          {
            name: "950",
            hex: "#001720",
          },
          {
            name: "975",
            hex: "#000B13",
          },
        ],
      },
    ],
    pairs: [
      {
        label: "Ink on page",
        fg: "#000820",
        bg: "#F8F7F2",
      },
      {
        label: "Muted on white",
        fg: "#354E6E",
        bg: "#FFFFFF",
      },
      {
        label: "White on cobalt",
        fg: "#FFFFFF",
        bg: "#3660AF",
      },
      {
        label: "Navy on gold",
        fg: "#000820",
        bg: "#D7B265",
      },
      {
        label: "Gold text on white",
        fg: "#7F5D00",
        bg: "#FFFFFF",
      },
      {
        label: "Azure on white",
        fg: "#2B6C83",
        bg: "#FFFFFF",
      },
    ],
  },
  {
    id: "ink-champagne",
    name: "Ink and Champagne",
    tag: "Quiet luxury",
    scheme: "Analogous warm-neutral on cool ink",
    used: "Prototype 20, Vesper",
    note: "Champagne is the same gold with chroma drawn down to 0.06, so it reads as metal rather than colour. On near-black navy with warm ivory it is the most restrained of the four.",
    ratio: [
      {
        label: "Ink",
        pct: 60,
        hex: "#000820",
      },
      {
        label: "Steel and ivory",
        pct: 30,
        hex: "#A5BAD1",
      },
      {
        label: "Champagne",
        pct: 10,
        hex: "#E1CFA5",
      },
    ],
    roles: [
      {
        name: "Page",
        hex: "#000820",
      },
      {
        name: "Surface",
        hex: "#00132F",
      },
      {
        name: "Ivory ink",
        hex: "#F8F3E6",
      },
      {
        name: "Muted",
        hex: "#ACB8CB",
      },
      {
        name: "Champagne",
        hex: "#E1CFA5",
      },
      {
        name: "Champagne deep",
        hex: "#AE9D73",
      },
    ],
    ramps: [
      {
        name: "Champagne",
        steps: [
          {
            name: "50",
            hex: "#FFF4DC",
          },
          {
            name: "100",
            hex: "#F9E6BB",
          },
          {
            name: "200",
            hex: "#E1CFA5",
          },
          {
            name: "300",
            hex: "#C7B68C",
          },
          {
            name: "400",
            hex: "#AE9D73",
          },
          {
            name: "500",
            hex: "#8F7F56",
          },
          {
            name: "600",
            hex: "#72613A",
          },
          {
            name: "700",
            hex: "#5B4B24",
          },
          {
            name: "800",
            hex: "#45360D",
          },
          {
            name: "900",
            hex: "#2F2200",
          },
          {
            name: "950",
            hex: "#1C1200",
          },
          {
            name: "975",
            hex: "#0F0800",
          },
        ],
      },
      {
        name: "Steel",
        steps: [
          {
            name: "50",
            hex: "#EEF6FE",
          },
          {
            name: "100",
            hex: "#D7EAFE",
          },
          {
            name: "200",
            hex: "#BED4EB",
          },
          {
            name: "300",
            hex: "#A5BAD1",
          },
          {
            name: "400",
            hex: "#8CA1B7",
          },
          {
            name: "500",
            hex: "#6E8398",
          },
          {
            name: "600",
            hex: "#52657A",
          },
          {
            name: "700",
            hex: "#3C4F62",
          },
          {
            name: "800",
            hex: "#283A4C",
          },
          {
            name: "900",
            hex: "#142537",
          },
          {
            name: "950",
            hex: "#051525",
          },
          {
            name: "975",
            hex: "#000919",
          },
        ],
      },
      {
        name: "Navy",
        steps: [
          {
            name: "50",
            hex: "#EFF6FF",
          },
          {
            name: "100",
            hex: "#D9EAFF",
          },
          {
            name: "200",
            hex: "#B6D4FA",
          },
          {
            name: "300",
            hex: "#9DBADF",
          },
          {
            name: "400",
            hex: "#85A1C5",
          },
          {
            name: "500",
            hex: "#6782A5",
          },
          {
            name: "600",
            hex: "#4B6586",
          },
          {
            name: "700",
            hex: "#354E6E",
          },
          {
            name: "800",
            hex: "#213957",
          },
          {
            name: "900",
            hex: "#0D2441",
          },
          {
            name: "950",
            hex: "#00132F",
          },
          {
            name: "975",
            hex: "#000820",
          },
        ],
      },
    ],
    pairs: [
      {
        label: "Ivory on ink",
        fg: "#F8F3E6",
        bg: "#000820",
      },
      {
        label: "Muted on ink",
        fg: "#ACB8CB",
        bg: "#000820",
      },
      {
        label: "Champagne on ink",
        fg: "#E1CFA5",
        bg: "#000820",
      },
      {
        label: "Ink on champagne",
        fg: "#000820",
        bg: "#E1CFA5",
      },
    ],
  },
  {
    id: "sapphire-bronze",
    name: "Sapphire and Bronze",
    tag: "Warm metal on deep blue",
    scheme: "Analogous accent (blue with a warm neighbour)",
    used: "Prototype 21, Charter",
    note: "A deep sapphire with bronze, a gold pulled toward orange. Bronze is warmer and quieter than yellow gold, so it suits heritage and craft; keep it to hairlines, numerals and one button.",
    ratio: [
      {
        label: "Warm pearl page",
        pct: 60,
        hex: "#F8F7F2",
      },
      {
        label: "Sapphire",
        pct: 30,
        hex: "#003478",
      },
      {
        label: "Bronze",
        pct: 10,
        hex: "#C99065",
      },
    ],
    roles: [
      {
        name: "Page",
        hex: "#F8F7F2",
      },
      {
        name: "Ink",
        hex: "#000624",
      },
      {
        name: "Sapphire",
        hex: "#174A92",
      },
      {
        name: "Sapphire deep",
        hex: "#002153",
      },
      {
        name: "Bronze",
        hex: "#C99065",
      },
      {
        name: "Bronze light",
        hex: "#FEC396",
      },
      {
        name: "Bronze text",
        hex: "#713F11",
      },
    ],
    ramps: [
      {
        name: "Sapphire",
        steps: [
          {
            name: "50",
            hex: "#EFF6FF",
          },
          {
            name: "100",
            hex: "#DBE9FE",
          },
          {
            name: "200",
            hex: "#B6D3FE",
          },
          {
            name: "300",
            hex: "#8AB9FF",
          },
          {
            name: "400",
            hex: "#6A9FEE",
          },
          {
            name: "500",
            hex: "#4C80CD",
          },
          {
            name: "600",
            hex: "#2F62AC",
          },
          {
            name: "700",
            hex: "#174A92",
          },
          {
            name: "800",
            hex: "#003478",
          },
          {
            name: "900",
            hex: "#002153",
          },
          {
            name: "950",
            hex: "#001136",
          },
          {
            name: "975",
            hex: "#000624",
          },
        ],
      },
      {
        name: "Bronze",
        steps: [
          {
            name: "50",
            hex: "#FFF2EA",
          },
          {
            name: "100",
            hex: "#FEE2CD",
          },
          {
            name: "200",
            hex: "#FEC396",
          },
          {
            name: "300",
            hex: "#E3A97D",
          },
          {
            name: "400",
            hex: "#C99065",
          },
          {
            name: "500",
            hex: "#A97248",
          },
          {
            name: "600",
            hex: "#89552A",
          },
          {
            name: "700",
            hex: "#713F11",
          },
          {
            name: "800",
            hex: "#562B00",
          },
          {
            name: "900",
            hex: "#3A1A00",
          },
          {
            name: "950",
            hex: "#240D00",
          },
          {
            name: "975",
            hex: "#150400",
          },
        ],
      },
      {
        name: "Pearl",
        steps: [
          {
            name: "pearl-50",
            hex: "#F8F7F2",
          },
          {
            name: "pearl-100",
            hex: "#F2F0EA",
          },
          {
            name: "pearl-200",
            hex: "#E4E1D8",
          },
        ],
      },
    ],
    pairs: [
      {
        label: "Ink on page",
        fg: "#000624",
        bg: "#F8F7F2",
      },
      {
        label: "White on sapphire",
        fg: "#FFFFFF",
        bg: "#174A92",
      },
      {
        label: "Ink on bronze",
        fg: "#000624",
        bg: "#C99065",
      },
      {
        label: "Bronze text on page",
        fg: "#713F11",
        bg: "#F8F7F2",
      },
    ],
  },
]

/** Laureate is the candidate: Sovereign's navy and gold, turned into a light page with a dark twin. */
const navyGold = base[0]!.ramps

export const palettes: Palette[] = [
  {
    id: "laureate",
    name: "Laureate",
    tag: "Best of all, light and dark",
    scheme: "Complementary, two modes",
    used: "Prototype 19, Laureate",
    note: "Sovereign's Oxford navy and antique gold, but the page is warm ivory and the navy does the writing. Gold stays a tenth of the surface and sits on top of navy or ivory, never blended into it. Dark mode swaps the roles: navy becomes the page, ivory becomes the ink, and the gold is unchanged, so the brand looks the same in both.",
    ratio: [
      { label: "Warm ivory page and cards", pct: 60, hex: "#F8F5EC" },
      { label: "Navy ink and structure", pct: 30, hex: "#000820" },
      { label: "Antique gold", pct: 10, hex: "#D7B265" },
    ],
    roles: [
      { name: "Page", hex: "#F8F5EC" },
      { name: "Card", hex: "#FFFEFA" },
      { name: "Ink", hex: "#000820" },
      { name: "Muted", hex: "#354E6E" },
      { name: "Gold fill", hex: "#D7B265" },
      { name: "Gold deep", hex: "#7F5D00" },
      { name: "Dark page", hex: "#000820" },
      { name: "Dark card", hex: "#0D2441" },
      { name: "Dark ink", hex: "#F8F3E6" },
      { name: "Dark muted", hex: "#ACB8CB" },
    ],
    ramps: navyGold,
    pairs: [
      { label: "Light: ink on page", fg: "#000820", bg: "#F8F5EC" },
      { label: "Light: muted on page", fg: "#354E6E", bg: "#F8F5EC" },
      { label: "Light: muted on card", fg: "#354E6E", bg: "#FFFEFA" },
      { label: "Light: deep gold on page", fg: "#7F5D00", bg: "#F8F5EC" },
      { label: "Navy on gold", fg: "#000820", bg: "#D7B265" },
      { label: "Dark: ivory on page", fg: "#F8F3E6", bg: "#000820" },
      { label: "Dark: muted on card", fg: "#ACB8CB", bg: "#0D2441" },
      { label: "Dark: gold on page", fg: "#D7B265", bg: "#000820" },
    ],
  },
  ...base,
]
