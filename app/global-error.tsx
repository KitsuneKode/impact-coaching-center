"use client"

/** The last resort: an error in the root layout itself. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en-IN">
      <head>
        <title>Not loaded | Impact Career Tutorials</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.25rem",
          // oklch(0.984 0.003 85) and oklch(0.205 0.006 262), the --background
          // and --foreground of app/globals.css.
          backgroundColor: "oklch(0.984 0.003 85)",
          color: "oklch(0.205 0.006 262)",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.25,
        }}
      >
        <main style={{ maxWidth: "40rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            The site did not load.{" "}
            <span style={{ color: "oklch(0.5 0.008 262)" }}>
              Nothing you did caused it. Trying again usually works.
            </span>
          </h1>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                minHeight: "2.75rem",
                padding: "0 1.125rem",
                borderRadius: "0.625rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9375rem",
                backgroundColor: "oklch(0.225 0.006 262)",
                color: "oklch(0.985 0.002 85)",
              }}
            >
              Try again
            </button>
            <a
              href="tel:+918638061175"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "2.75rem",
                padding: "0 1.125rem",
                borderRadius: "0.625rem",
                border: "1px solid oklch(0.205 0.006 262 / 14%)",
                fontSize: "0.9375rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Call ICT
            </a>
          </div>
          {error.digest ? (
            <p
              style={{
                marginTop: "2rem",
                fontSize: "0.875rem",
                fontVariantNumeric: "tabular-nums",
                color: "oklch(0.5 0.008 262)",
              }}
            >
              Reference {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
