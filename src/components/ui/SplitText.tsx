import { clsx } from "clsx";
import { Fragment, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

/**
 * Wraps every word in <span class="w" style="--i:n"> so CSS can stagger them.
 * Works through fragments and inline elements (e.g. the serif accent span keeps its styling).
 * Server-safe, zero JS on the client. Screen readers still read the sentence normally.
 */
function splitWords(node: ReactNode, counter: { i: number }): ReactNode {
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((part, k) =>
      part === "" || /^\s+$/.test(part) ? (
        part
      ) : (
        <span key={`w${counter.i}-${k}`} className="w" style={{ "--i": counter.i++ } as CSSProperties}>
          {part}
        </span>
      ),
    );
  }
  if (typeof node === "number") return splitWords(String(node), counter);
  if (Array.isArray(node)) return node.map((n, k) => <Fragment key={k}>{splitWords(n, counter)}</Fragment>);
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    if (el.type === "br" || el.props.children === undefined) return el;
    if (el.type === Fragment) return <>{splitWords(el.props.children, counter)}</>;
    return cloneElement(el, undefined, splitWords(el.props.children, counter));
  }
  return node;
}

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

/**
 * mode:
 *  - "scroll": words rise in as the element scrolls into view (headings)
 *  - "scrub":  words write on progressively through the scroll (statements)
 *  - "load":   words rise in on page load (above-the-fold titles)
 */
export function SplitText({
  children,
  as: Component = "span",
  mode = "scroll",
  className,
}: {
  children: ReactNode;
  as?: Tag;
  mode?: "scroll" | "scrub" | "load";
  className?: string;
}) {
  const counter = { i: 0 };
  const content = splitWords(children, counter);
  return (
    <Component
      className={clsx(mode === "scroll" ? "split" : mode === "scrub" ? "scrub" : "split-load", className)}
      style={{ "--n": counter.i } as CSSProperties}
    >
      {content}
    </Component>
  );
}
