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
      description="Enter your mobile number. We'll send a code on WhatsApp."
      next={safeReturnPath(next)}
    />
  )
}
