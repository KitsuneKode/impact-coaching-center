import {
  cloneElement,
  type CSSProperties,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"

/**
 * Splits a heading into words for the first-paint reveal (pulse.css,
 * "Gradual reveal"): each word becomes a span carrying its place, --w, and
 * rises out of a blur after the one before it. Plain elements inside (a
 * muted span, a line break) are kept and their words split too; a component
 * (the hero's rolling word) counts as one word. Returns how many words there
 * were, so what follows the heading can wait for it.
 */
export function splitWords(
  node: ReactNode,
  from = 0
): { node: ReactNode; count: number } {
  let index = from
  const word = (content: ReactNode, key: string) => (
    <span key={key} data-word style={{ "--w": index++ } as CSSProperties}>
      {content}
    </span>
  )
  const walk = (child: ReactNode, path: string): ReactNode => {
    if (typeof child === "number") return walk(String(child), path)
    if (typeof child === "string")
      return child
        .split(/(\s+)/)
        .map((part, k) =>
          !part ? null : /^\s+$/.test(part) ? part : word(part, `${path}-${k}`)
        )
    if (Array.isArray(child))
      return child.map((c, k) => (
        <Fragment key={`${path}-${k}`}>{walk(c, `${path}-${k}`)}</Fragment>
      ))
    if (isValidElement(child)) {
      const element = child as ReactElement<{ children?: ReactNode }>
      if (element.type === Fragment)
        return (
          <Fragment key={path}>
            {walk(element.props.children, `${path}-f`)}
          </Fragment>
        )
      if (typeof element.type !== "string") return word(element, path)
      if (element.props.children === undefined) return element
      return cloneElement(
        element,
        undefined,
        walk(element.props.children, `${path}-c`)
      )
    }
    return child
  }
  const out = walk(node, "w")
  return { node: out, count: index - from }
}

/** The delay, in seconds, for whatever comes after `count` words. */
export const afterWords = (count: number) => 0.14 + count * 0.055 + 0.08
