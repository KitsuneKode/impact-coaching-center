import { faculty } from "../../_data"
import { Reveal } from "../../_reveal"
import { container, h2 } from "../_theme"
import { TeacherCard } from "./teacher-card"

/** Teachers: click or tap a card to turn it over. */
export function Teachers() {
  return (
    <section
      id="teachers"
      aria-labelledby="teachers-h"
      className="pb-20 md:pb-28"
    >
      <div className={container}>
        <Reveal>
          <h2 id="teachers-h" className={`${h2} max-w-[18ch]`}>
            Turn a card over to meet a teacher.
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {faculty.map((f) => (
            <TeacherCard key={f.slug} f={f} />
          ))}
        </ul>
      </div>
    </section>
  )
}
