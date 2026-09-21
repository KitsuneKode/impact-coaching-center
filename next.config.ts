import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
  /**
   * Baseline response headers.
   *
   * No Content-Security-Policy yet, deliberately: the layout inlines a JSON-LD
   * script and the site embeds youtube-nocookie iframes, so a useful policy
   * needs a nonce and a frame-src. Add it with the sign-in UI, which is when
   * this origin starts carrying sessions worth stealing.
   */
  /**
   * The log-in page lives at /sign-in, and the page itself says "Log in".
   * People type the words they know, so the two obvious guesses resolve rather
   * than reaching the 404. Permanent, because the destination is not going to
   * move again - the path is already written into lib/policies.ts, the sitemap
   * guard and the staff-only state on /admin/leads.
   *
   * There is no /register. Entering a mobile number either finds that Person
   * or creates one (ADR-0001), so registration is not a separate destination
   * to send anyone to.
   */
  async redirects() {
    return [
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/register", destination: "/sign-in", permanent: true },
      { source: "/sign-up", destination: "/sign-in", permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
