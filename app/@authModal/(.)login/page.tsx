import { AuthModal } from "@/components/account/auth-modal"
import { safeReturnPath } from "@/lib/return-path"

/** /login, intercepted. */
export default async function LoginModalPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  return (
    <AuthModal
      heading="Log in"
      description="Enter your mobile number. We'll send a code on WhatsApp."
      next={safeReturnPath(next)}
    />
  )
}
