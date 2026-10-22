import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { PostVideo } from "@/components/blog/post-video"
import { type Heading, youTubeId } from "@/lib/article"
import { cn } from "@/lib/utils"

/**
 * The prose skin the policy pages render with (they add marker links on
 * top). Blog posts use Typeset instead, through MarkdownBody below.
 */
export const proseComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mbs-12 text-lg font-medium text-foreground first:mbs-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mbs-8 text-base font-medium text-foreground first:mbs-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mbs-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mbs-3 list-disc space-y-2 ps-5 text-[0.9375rem] leading-relaxed text-muted-foreground marker:text-foreground/40">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mbs-3 list-decimal space-y-2 ps-5 text-[0.9375rem] leading-relaxed text-muted-foreground marker:text-foreground/40">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mbs-4 border-l-2 border-foreground/20 ps-4">
      {children}
    </blockquote>
  ),
  // A wide table scrolls sideways on a phone. A keyboard can only scroll
  // what it can focus (axe: scrollable-region-focusable), so the labelled
  // section takes focus, as the WAI table pattern does.
  table: ({ children }) => (
    <section
      aria-label="Table"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="mbs-4 overflow-x-auto rounded-card border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table className="w-full min-w-120 text-left text-sm">{children}</table>
    </section>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-muted/50 px-4 py-3 font-medium text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-4 py-3 align-top text-muted-foreground">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
    >
      {children}
    </a>
  ),
}

/**
 * Long-form Markdown (blog posts and their editor preview), styled by
 * Typeset: plain elements inside one container, no classes on the content.
 * Given the post's headings (lib/article.ts), each ## and ### gets the id
 * "On this page" links to. An image becomes a figure, its title the
 * caption; a YouTube link alone on its line becomes a player.
 */
export function MarkdownBody({
  children,
  headings,
  className,
}: {
  children: string
  headings?: readonly Heading[]
  className?: string
}) {
  // Rendering is in document order, so the nth heading takes the nth id.
  let next = 0
  const idFor = () => headings?.[next++]?.id
  const components: Components = {
    h2: ({ children }) => <h2 id={idFor()}>{children}</h2>,
    h3: ({ children }) => <h3 id={idFor()}>{children}</h3>,
    img: ({ src, alt, title }) =>
      typeof src === "string" ? (
        <figure data-post-figure>
          {/* Sizes are unknown in Markdown; the browser lays it out. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />
          {title ? <figcaption>{title}</figcaption> : null}
        </figure>
      ) : null,
    p: ({ node, children }) => {
      const only = node?.children.length === 1 ? node.children[0] : undefined
      const href =
        only?.type === "element" && only.tagName === "a"
          ? String(only.properties.href ?? "")
          : undefined
      const video = youTubeId(href)
      if (video)
        return (
          <PostVideo
            id={video}
            title={
              only?.type === "element" &&
              only.children[0]?.type === "text" &&
              only.children[0].value !== href
                ? only.children[0].value
                : undefined
            }
          />
        )
      // A figure cannot sit inside a paragraph.
      if (only?.type === "element" && only.tagName === "img")
        return <>{children}</>
      return <p>{children}</p>
    },
  }
  return (
    <div className={cn("typeset typeset-docs max-w-[37em]", className)}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {children}
      </Markdown>
    </div>
  )
}
