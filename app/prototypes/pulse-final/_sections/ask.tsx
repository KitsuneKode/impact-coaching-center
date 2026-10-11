import { EnquiryForm } from "../../_enquiry"
import { KitIsland } from "../../_kit/island"
import { islandTokens } from "../../pulse/_island"
import { container, h2 } from "../_theme"

/** The enquiry form on a white card, inside the kit island. */
export function Ask() {
  return (
    <KitIsland theme="pulse" tokens={islandTokens}>
      <section
        id="ask"
        aria-labelledby="ask-h"
        className={`${container} pb-20 md:pb-28`}
      >
        <div className="mx-auto max-w-[44rem] rounded-[32px] bg-white p-6 shadow-[0_0_0_1px_rgba(11,22,51,0.06)] sm:p-10">
          <h2 id="ask-h" className={`${h2} max-w-[18ch]`}>
            Tell us your exam and your hours.
          </h2>
          <div className="mt-8">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </KitIsland>
  )
}
