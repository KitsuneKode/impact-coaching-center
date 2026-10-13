import createNextIntlPlugin from "next-intl/plugin"
import type { NextConfig } from "next"

// Validates the environment before anything builds; a missing variable fails here.
import "./lib/env.client"
import "./lib/env.server"

/**
 * The Content-Security-Policy as a static header rather than a per-request
 * nonce: nonces force every page to render dynamically, and this site is
 * deliberately static - trading away prerendering and CDN caching for
 * marginal XSS coverage is the wrong exchange here. 'unsafe-inline' on
 * scripts is the honest cost of static rendering; the directives that carry
 * the real weight for this surface are the origin allowlists on
 * img/connect/frame and the 'none' rules.
 *
 * Source inventory (re-audit when a third-party integration is added):
 *   script-src  'unsafe-inline' covers the JSON-LD block and Next's inline
 *               bootstraps; challenges.cloudflare.com for Turnstile;
 *               'unsafe-eval' only in dev, for React's stack reconstruction.
 *   style-src   'unsafe-inline' for inline style attributes and Tailwind.
 *   img-src     Convex storage (covers, reader pages), ytimg thumbnails,
 *               blob: for upload previews, data: for inlined placeholders.
 *   connect-src Convex cloud (client websocket + HTTP actions) and the
 *               *.convex.site auth/enquiry endpoints; ws: only in dev for
 *               the dev server's HMR socket.
 *   frame-src   youtube-nocookie embeds, Google Maps, Turnstile challenges.
 *   *.r2.cloudflarestorage.com in connect: PDFs upload straight to R2
 *               on a presigned URL and the reader fetches them back the
 *               same way (a local S3 server answers on *.localhost in dev).
 *   *.razorpay.com in script, frame, connect and img: Checkout.js loads from
 *               checkout.razorpay.com and pays in an api.razorpay.com frame;
 *               Razorpay's own guidance is to allow its domain.
 */
/*
 * A production build pointed at a local Convex (testing `next start` on a
 * laptop) gets dev's localhost allowances for its CSP and images. A deployed
 * build's Convex URL is never local, so this never loosens production.
 */
const localConvex = /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? ""
)

function contentSecurityPolicy(): string {
  const dev = process.env.NODE_ENV === "development" || localConvex
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.razorpay.com${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://i.ytimg.com https://*.convex.cloud https://*.razorpay.com",
    "font-src 'self'",
    `connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://*.razorpay.com https://*.r2.cloudflarestorage.com${dev ? " ws://localhost:* http://localhost:* http://*.localhost:*" : ""}`,
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com https://challenges.cloudflare.com https://*.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")
}

const isDev = process.env.NODE_ENV === "development"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      // Book covers and page images uploaded to Convex file storage.
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/api/storage/**",
      },
      // A local Convex backend serves storage from loopback.
      ...(isDev || localConvex
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "3210",
              pathname: "/api/storage/**",
            },
          ]
        : []),
    ],
    dangerouslyAllowLocalIP: isDev || localConvex,
  },
  /**
   * /login and /register are the real routes, because those are the words
   * people know. They render the same screen with different framing: there is
   * one mechanism, since entering a mobile number either finds that Person or
   * creates one (ADR-0001).
   *
   * The old /sign-in and /sign-up paths redirect rather than 404, because
   * /sign-in was live and may already be linked from somewhere we do not
   * control. Permanent, because this is the last time these move.
   */
  async redirects() {
    return [
      { source: "/sign-in", destination: "/login", permanent: true },
      { source: "/sign-up", destination: "/register", permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            // geolocation for "nearest centre", asked only when the reader taps it
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ]
  },
}

export default createNextIntlPlugin()(nextConfig)
