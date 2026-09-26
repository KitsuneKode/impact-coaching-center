"use client"

import { useEffect, useRef } from "react"

/*
 * Turnstile's own injected field. Rendered inside the <form>, so the hidden
 * cf-turnstile-response input lands in FormData with no wiring. The widget
 * re-renders on mount and resets whenever `resetKey` changes - a submission
 * consumes the token, and without a reset the retry would submit a spent
 * one.
 */
declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; "refresh-expired"?: "auto" }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"

export function Turnstile({
  siteKey,
  resetKey,
}: {
  siteKey: string
  resetKey: number
}) {
  const host = useRef<HTMLDivElement>(null)
  const widget = useRef<string | undefined>(undefined)

  useEffect(() => {
    const render = () => {
      if (host.current && window.turnstile && widget.current === undefined)
        widget.current = window.turnstile.render(host.current, {
          sitekey: siteKey,
          // Slow form-filling must not die on the 300s token lifetime.
          "refresh-expired": "auto",
        })
    }
    if (window.turnstile) {
      render()
      return () => {
        if (widget.current !== undefined) {
          window.turnstile?.remove(widget.current)
          widget.current = undefined
        }
      }
    }
    window.onTurnstileLoad = render
    if (!document.querySelector(`script[src^="${SCRIPT_SRC.split("?")[0]}"]`)) {
      const script = document.createElement("script")
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.append(script)
    }
    return () => {
      window.onTurnstileLoad = undefined
      if (widget.current !== undefined) {
        window.turnstile?.remove(widget.current)
        widget.current = undefined
      }
    }
    // Mount once; the site key never changes for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (resetKey > 0 && widget.current !== undefined)
      window.turnstile?.reset(widget.current)
  }, [resetKey])

  /* No cf-turnstile class: that marker is only for Turnstile's implicit
     rendering; this div is rendered explicitly via turnstile.render(). */
  return <div ref={host} />
}
