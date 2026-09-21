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
