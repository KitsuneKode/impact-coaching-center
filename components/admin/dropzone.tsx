"use client"

import { IconUpload } from "@tabler/icons-react"
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type DragEvent,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const carriesFiles = (event: { dataTransfer: DataTransfer | null }) =>
  Boolean(event.dataTransfer?.types.includes("Files"))

/** True while a file is being dragged anywhere over the window. */
function useFileOverWindow() {
  const [over, setOver] = useState(false)
  useEffect(() => {
    let depth = 0
    const enter = (event: globalThis.DragEvent) => {
      if (!carriesFiles(event)) return
      depth += 1
      setOver(true)
    }
    const leave = () => {
      depth = Math.max(0, depth - 1)
      if (depth === 0) setOver(false)
    }
    const end = () => {
      depth = 0
      setOver(false)
    }
    window.addEventListener("dragenter", enter)
    window.addEventListener("dragleave", leave)
    window.addEventListener("drop", end)
    window.addEventListener("dragend", end)
    return () => {
      window.removeEventListener("dragenter", enter)
      window.removeEventListener("dragleave", leave)
      window.removeEventListener("drop", end)
      window.removeEventListener("dragend", end)
    }
  }, [])
  return over
}

/**
 * Drop handling for any element: files dropped on it go to `onFiles`, and
 * a file held over it makes it lean toward the pointer (the lean is CSS
 * variables, so it is free when nothing is dragged).
 */
export function useFileDrop({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
}) {
  const [over, setOver] = useState(false)
  const [landed, setLanded] = useState(0)
  const depth = useRef(0)

  useEffect(() => {
    if (!landed) return
    const timer = window.setTimeout(() => setLanded(0), 520)
    return () => window.clearTimeout(timer)
  }, [landed])

  function lean(event: DragEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - box.left) / box.width) * 2 - 1
    const y = ((event.clientY - box.top) / box.height) * 2 - 1
    event.currentTarget.style.setProperty("--lean-x", x.toFixed(3))
    event.currentTarget.style.setProperty("--lean-y", y.toFixed(3))
  }

  function settle(element: HTMLElement) {
    element.style.setProperty("--lean-x", "0")
    element.style.setProperty("--lean-y", "0")
  }

  return {
    over,
    landed: landed > 0,
    handlers: {
      onDragEnter(event: DragEvent<HTMLElement>) {
        if (disabled || !carriesFiles(event)) return
        event.preventDefault()
        depth.current += 1
        setOver(true)
      },
      onDragOver(event: DragEvent<HTMLElement>) {
        if (disabled || !carriesFiles(event)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy"
        lean(event)
      },
      onDragLeave(event: DragEvent<HTMLElement>) {
        if (disabled) return
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) {
          setOver(false)
          settle(event.currentTarget)
        }
      },
      onDrop(event: DragEvent<HTMLElement>) {
        if (disabled || !carriesFiles(event)) return
        event.preventDefault()
        depth.current = 0
        setOver(false)
        settle(event.currentTarget)
        const files = [...event.dataTransfer.files]
        if (files.length) {
          setLanded(Date.now())
          onFiles(files)
        }
      },
    },
  }
}

/**
 * The admin's upload target: click to choose, or drop files on it. It
 * brightens as soon as a file is dragged over the window, leans toward the
 * file as it comes close, and snaps back with a small pop when it lands.
 * `children` shows progress or a note under the title.
 */
export function Dropzone({
  accept,
  multiple,
  disabled,
  onFiles,
  title,
  hint,
  icon: Icon = IconUpload,
  describedBy,
  className,
  children,
}: {
  accept: string
  multiple?: boolean
  disabled?: boolean
  onFiles: (files: File[]) => void
  title: string
  hint?: string
  icon?: ComponentType<{ className?: string; stroke?: number }>
  describedBy?: string
  className?: string
  children?: ReactNode
}) {
  const input = useRef<HTMLInputElement>(null)
  const near = useFileOverWindow()
  const { over, landed, handlers } = useFileDrop({ onFiles, disabled })

  return (
    <div data-dropzone-stage className={className}>
      <button
        type="button"
        data-dropzone
        data-near={(near && !disabled) || undefined}
        data-over={over || undefined}
        data-landed={landed || undefined}
        disabled={disabled}
        aria-describedby={describedBy}
        onClick={() => input.current?.click()}
        {...handlers}
      >
        <span data-dropzone-icon aria-hidden>
          <Icon stroke={1.75} className="size-5" />
        </span>
        <span className="font-medium">{title}</span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])]
          event.target.value = ""
          if (files.length) onFiles(files)
        }}
      />
    </div>
  )
}

/** Wraps something already filled (a cover, a PDF) so a drop replaces it. */
export function DropToReplace({
  onFiles,
  disabled,
  className,
  children,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
  className?: string
  children: ReactNode
}) {
  const { over, landed, handlers } = useFileDrop({ onFiles, disabled })
  return (
    // Drop is a shortcut here; the Replace button beside it does the same.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-drop-replace
      data-over={over || undefined}
      data-landed={landed || undefined}
      className={cn(className)}
      {...handlers}
    >
      {children}
    </div>
  )
}
