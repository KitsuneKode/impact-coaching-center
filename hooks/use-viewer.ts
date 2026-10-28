"use client"

import { useConvexAuth, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"

/**
 * The signed-in Person: `undefined` while that is still being worked out,
 * `null` when nobody is signed in.
 *
 * Asking Convex before the browser has handed it the session token gets an
 * anonymous answer, which a page shows as "signed out" until the token lands
 * and the real answer replaces it: the sign-in screen flashing on a hard
 * refresh. Waiting for the auth state first means the first answer is the
 * right one, and a signed-out visitor never runs the query at all.
 */
export function useViewer() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const viewer = useQuery(
    api.auth.getCurrentPerson,
    isAuthenticated ? {} : "skip"
  )
  if (isLoading) return undefined
  if (!isAuthenticated) return null
  return viewer
}
