import { AuthModal } from "@/components/account/auth-modal"
import { safeReturnPath } from "@/lib/return-path"

/** /register, intercepted. Same screen, worded for a first-time visitor. */
export default async function RegisterModalPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  return (
    <AuthModal
      heading="Create your account"
      description="Your mobile number is all we need. We send a code on WhatsApp."
      next={safeReturnPath(next)}
    />
  )
}
