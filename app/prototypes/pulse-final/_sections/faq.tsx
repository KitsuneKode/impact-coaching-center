import { faqs } from "../../_data"
import { container, h2 } from "../_theme"

/** Questions, as in Pulse. */
export function Faq() {
  return (
    <section aria-labelledby="faq-h" className="pb-20 md:pb-28">
      <div className={container}>
        <h2 id="faq-h" className={`${h2} mb-10`}>
          Questions.
        </h2>
        <dl className="grid gap-4 md:grid-cols-2">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-[22px] bg-[var(--pu-card)] p-6 shadow-[0_0_0_1px_var(--pu-line)]"
            >
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-2 text-[var(--pu-muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
