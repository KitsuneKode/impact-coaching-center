import type { Resource } from "./catalog"

/**
 * The six fixed folders ICT files its free material under. Until each
 * resource stores its folder, the folder is derived from kind and exam.
 */
export const FREE_FOLDERS = [
  { id: "current-affairs", name: "Current Affairs", exam: null },
  { id: "mock-apsc", name: "Mock Tests for APSC", exam: "APSC" },
  {
    id: "mock-adre",
    name: "Mock Tests for ADRE",
    exam: "ADRE and Assam Police",
  },
  { id: "study-apsc", name: "APSC Study Materials", exam: "APSC" },
  {
    id: "study-adre",
    name: "ADRE Study Materials",
    exam: "ADRE and Assam Police",
  },
  {
    id: "study-banking",
    name: "Banking/SSC/Railway Study Materials",
    exam: "Bank, SSC, Railway",
  },
] as const

export type FreeFolderId = (typeof FREE_FOLDERS)[number]["id"]

const BANKING = "Bank, SSC, Railway"
const ADRE = "ADRE and Assam Police"

/** Which folder a resource belongs in. */
export function folderOf(r: Pick<Resource, "kind" | "exam">): FreeFolderId {
  if (r.kind === "Current affairs") return "current-affairs"
  const test = r.kind === "Question paper" || r.kind === "Practice set"
  if (r.exam === BANKING) return "study-banking"
  if (r.exam === ADRE) return test ? "mock-adre" : "study-adre"
  return test ? "mock-apsc" : "study-apsc"
}

/** Every folder with its resources, in the fixed order, empty ones included. */
export function groupByFolder<T extends Pick<Resource, "kind" | "exam">>(
  resources: readonly T[]
) {
  return FREE_FOLDERS.map((folder) => ({
    ...folder,
    items: resources.filter((r) => folderOf(r) === folder.id),
  }))
}
