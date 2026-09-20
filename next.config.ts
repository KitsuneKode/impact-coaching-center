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
