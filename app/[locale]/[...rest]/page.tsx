import { notFound } from "next/navigation"

/** Any unknown public path renders the not-found page in its own language. */
export default function CatchAll() {
  notFound()
}
