"use client"

import { IconCheck } from "@tabler/icons-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

/** A swatch you press to copy its hex. Text colour is chosen for contrast. */
export function Swatch({
  hex,
  label,
  dark,
}: {
  hex: string
  label: string
  dark: boolean
}) {
  const [done, setDone] = useState(false)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hex)
        } catch {
          return
        }
        setDone(true)
        toast(`${hex} copied`)
        if (t.current) clearTimeout(t.current)
        t.current = setTimeout(() => setDone(false), 1400)
      }}
      aria-label={`Copy ${label}, ${hex}`}
      className="group relative flex h-24 w-full min-w-[92px] flex-col justify-end rounded-xl p-2.5 text-left transition-transform duration-150 ease-out active:scale-[0.96]"
      style={{
        background: hex,
        color: dark ? "#F4F6FB" : "#00032B",
        boxShadow: "inset 0 0 0 1px rgba(0,15,57,0.12)",
      }}
    >
      {done && (
        <IconCheck
          aria-hidden
          size={16}
          stroke={2.5}
          className="absolute top-2.5 right-2.5"
        />
      )}
      <span className="text-[0.7rem] leading-tight font-semibold">{label}</span>
      <span className="text-[0.7rem] leading-tight tabular-nums opacity-80">
        {hex}
      </span>
    </button>
  )
}
