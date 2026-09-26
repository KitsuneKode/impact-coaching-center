import { AuthModal } from "@/components/account/auth-modal"
import { safeReturnPath } from "@/lib/return-path"

/**
 * /login, intercepted.
 *
 * The same URL as `app/login/page.tsx`, shown over whatever the visitor was
 * reading. A hard load or a shared link still renders the full page, so there
 * is one route, one form, and two presentations of it.
 */
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
