import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconMapPin,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import type { ReactNode } from "react"

import { timings } from "@/lib/brand"

import { BatchFinder } from "../_blocks/batch-finder"
import { RouteExplorer } from "../_blocks/route-explorer"
import { campaign } from "../_campaign"
import {
  campus,
  courses,
  faculty,
  faqs,
  fee,
  included,
  joining,
  links,
  nextBatch,
  offer,
  phone,
  place,
  reviews,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { FolderBrowser } from "../_folder-browser"
import { PlayInPlace } from "../_fx"
import { batchDay } from "../_kit/batch-day"
import { buildRoutes } from "../_kit/routes"
import { container, external, folderTones } from "../_kit/shared"
import { SiteReel, TopBar } from "../_kit/site-promos"
import { Reveal } from "../_reveal"
import { Catalogue, FacultyRoll, LitHero } from "./_client"
import { base } from "./_theme"

const routeColours: Record<string, string> = {
  apsc: "var(--vs-route-apsc)",
  adre: "var(--vs-route-adre)",
  "assam-police-si": "var(--vs-route-police)",
  banking: "var(--vs-route-banking)",
}

/** Every chapter opens the same way: a hairline that draws in, a numeral, a title. */
function Chapter({
  id,
  numeral,
  title,
  lede,
  children,
  wide,
}: {
  id: string
  numeral: string
  title: ReactNode
  lede?: ReactNode
  children: ReactNode
  wide?: boolean
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`${container} scroll-mt-20 pb-28 md:pb-36`}
    >
      <span data-vs-rule aria-hidden />
      <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-12">
        <Reveal className={wide ? "lg:col-span-12" : "lg:col-span-4"}>
          <p data-vs-chapter>Chapter {numeral}</p>
          <h2
            id={`${id}-h`}
            data-k-h2
            className={`mt-5 ${wide ? "max-w-[18ch]" : "max-w-[9ch]"}`}
          >
            {title}
          </h2>
          {lede && (
            <p className="mt-6 max-w-[38ch] text-[var(--k-muted)]">{lede}</p>
          )}
        </Reveal>
        <div className={wide ? "lg:col-span-12" : "lg:col-span-8"}>
          {children}
        </div>
      </div>
    </section>
  )
}

export default async function VesperHome() {
  const { books, folders, samples } = await shelf()
  const victor = courses.find((c) => c.name === nextBatch.name)
  const day = batchDay(nextBatch.startsOn)

  const barCampaign = {
    ...campaign,
    tag: "New batch",
    headline: `Day ${day}: ${nextBatch.name}.`,
    body: `${nextBatch.exam}, ${nextBatch.timing}, for ${nextBatch.forWho}.`,
    cta: "See the batch",
    href: victor ? `${base}${victor.href}` : `${base}/courses`,
  }

  const finderBatches = timetable.map((t) => ({
    id: t.id,
    name: t.name,
    exam: t.exam,
    when: t.when,
    days: t.days,
    price: fee(t.price),
    href: `${base}${t.href}`,
    start: t.start,
  }))
  const noTiming = courses
    .filter((c) => !c.when && c.price)
    .map((c) => ({
      exam: c.exam,
      name: c.name,
      price: rupees(c.price!),
      href: `${base}${c.href}`,
    }))

  const people = faculty.map((f) => ({
    slug: f.slug,
    name: f.name,
    called: f.called,
    teaches: f.teaches,
    note: f.note,
    portrait: f.portrait,
    lecture: f.lecture,
    still: `/yt/${f.lecture}.jpg`,
  }))

  return (
    <main>
      <TopBar c={barCampaign} />

      {/* Opening */}
      <LitHero className={`${container} pt-14 pb-24 md:pt-24 md:pb-36`}>
        <div aria-hidden data-vs-moon />
        <p
          data-rise
          data-k-wide
          className="text-[0.66rem] text-[var(--k-accent-deep)]"
        >
          Impact Career Tutorials, North Lakhimpur
        </p>
        <h1
          data-k-h1
          data-vs-lit
          data-rise
          style={{ animationDelay: "0.08s" }}
          className="mt-8 max-w-[12ch]"
        >
          Coaching for Assam&apos;s <span data-vs-italic>biggest</span> exams.
        </h1>
        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div
            data-rise
            style={{ animationDelay: "0.2s" }}
            className="lg:col-span-5"
          >
            <p className="max-w-[40ch] text-lg text-[var(--k-muted)]">
              Batches in North Lakhimpur, ICT&apos;s own books, free notes, and
              every class on the app.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={whatsapp}
                {...external}
                data-k-press
                data-k-btn
                className="group inline-flex h-12 items-center gap-2 px-6 whitespace-nowrap"
              >
                {offer.cta}
                <IconArrowRight
                  aria-hidden
                  size={18}
                  stroke={2}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#batches"
                data-k-press
                data-k-outline
                className="inline-flex h-12 items-center px-6"
              >
                Find your batch
              </a>
            </div>
          </div>
          <dl
            data-rise
            style={{ animationDelay: "0.28s" }}
            className="lg:col-span-6 lg:col-start-7"
          >
            {[
              ["Next batch", `${nextBatch.name}, day ${day}`],
              ["Timing", nextBatch.timing],
              ["For", nextBatch.forWho],
              ...(victor?.price ? [["Fee", rupees(victor.price)]] : []),
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-6 border-t border-[var(--k-line)] py-4 last:border-b"
              >
                <dt
                  data-k-wide
                  className="text-[0.62rem] text-[var(--k-muted)]"
                >
                  {k}
                </dt>
                <dd data-k-display className="text-2xl tabular-nums">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </LitHero>

      {/* I */}
      <Chapter
        id="batches"
        numeral="I"
        title={
          <>
            Find your <span data-vs-italic>batch.</span>
          </>
        }
        lede="Pick your exam and the hour you can study. The batches that fit are listed with their fees."
      >
        <div data-k-card className="p-6 sm:p-9">
          <BatchFinder
            batches={finderBatches}
            noTiming={noTiming}
            exams={[...courses.map((c) => c.exam), "Not sure yet"]}
            times={[...timings]}
            askHref={whatsapp}
          />
        </div>
        <div className="mt-12">
          <p data-k-wide className="text-[0.62rem] text-[var(--k-muted)]">
            One fee covers
          </p>
          <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
            {included.map((x) => (
              <li
                key={x.text}
                className="flex items-start gap-3 border-t border-[var(--k-line)] py-3.5 text-sm"
              >
                <IconCheck
                  aria-hidden
                  size={16}
                  stroke={1.75}
                  className="mt-0.5 shrink-0 text-[var(--k-accent)]"
                />
                {x.text}
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      {/* II */}
      <Chapter
        id="exams"
        numeral="II"
        wide
        title={
          <>
            The road to each <span data-vs-italic>exam.</span>
          </>
        }
        lede="Every line starts at a free workshop and stops at that exam's real stages. Press a line to open it."
      >
        <RouteExplorer
          routes={buildRoutes(base, routeColours)}
          hub={offer.short}
        />
      </Chapter>

      {/* III */}
      <Chapter
        id="honour"
        numeral="III"
        wide
        title={
          <>
            On the APSC CCE 2022 <span data-vs-italic>merit list.</span>
          </>
        }
        lede={
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="inline-flex min-h-11 items-center gap-1 underline decoration-[var(--k-line-hi)] underline-offset-4"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        }
      >
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {selections.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.08}>
              <article data-vs-honour>
                <p data-k-wide className="text-[0.62rem] text-[var(--k-muted)]">
                  Serial on the merit list
                </p>
                <p
                  data-vs-serial
                  className="mt-4 tabular-nums"
                  aria-label={`Serial ${s.serial}`}
                >
                  {s.serial}
                </p>
                <h3 data-k-display className="mt-8 text-4xl leading-none">
                  {s.name}
                </h3>
                <p
                  data-k-wide
                  className="mt-3 text-[0.62rem] text-[var(--k-accent-deep)]"
                >
                  {s.post}
                </p>
                <blockquote
                  data-k-display
                  data-vs-italic
                  className="mt-6 max-w-[34ch] text-xl leading-snug text-[var(--k-muted)]"
                >
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
              </article>
            </Reveal>
          ))}
        </div>
        <ul className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-[#000820] text-left"
              >
                <Image
                  src={r.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(0,8,32,0.94))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center rounded-full"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={14}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span data-k-display className="block text-xl leading-tight">
                    {r.name}
                  </span>
                  <span
                    data-k-wide
                    className="mt-1 block text-[0.58rem] text-[var(--k-muted)]"
                  >
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </Chapter>

      {/* IV */}
      <Chapter
        id="teachers"
        numeral="IV"
        wide
        title={
          <>
            Who <span data-vs-italic>teaches</span> you.
          </>
        }
        lede="Press a name to read a line about them and watch one of their classes."
      >
        <FacultyRoll people={people} />
      </Chapter>

      {/* V */}
      <Chapter
        id="library"
        numeral="V"
        wide
        title={
          <>
            The <span data-vs-italic>library.</span>
          </>
        }
        lede={
          samples
            ? "ICT's own books, and free notes for every exam. Sample titles until ICT adds its own."
            : "ICT's own books, and free notes for every exam."
        }
      >
        <Catalogue books={books.slice(0, 6)} base={base} />
        <div className="mt-24">
          <p data-vs-chapter>Free notes</p>
          <h3
            data-k-display
            className="mt-4 max-w-[20ch] text-4xl leading-none"
          >
            Six folders. Nothing to pay.
          </h3>
          <div className="mt-10">
            <FolderBrowser
              folders={folders}
              tones={folderTones}
              readHref="/resources"
            />
          </div>
        </div>
      </Chapter>

      {/* VI */}
      <Chapter
        id="questions"
        numeral="VI"
        title={
          <>
            <span data-vs-italic>Questions.</span>
          </>
        }
        lede="The ones we hear most. Anything else, message us and we reply the same day."
      >
        <div className="border-b border-[var(--k-line)]">
          {faqs.map((f) => (
            <details
              key={f.q}
              data-k-faq
              className="border-t border-[var(--k-line)]"
            >
              <summary className="flex min-h-[4.5rem] items-center justify-between gap-6 py-4">
                <span
                  data-k-display
                  className="text-2xl leading-snug sm:text-[1.7rem]"
                >
                  {f.q}
                </span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0 text-[var(--k-accent)]"
                />
              </summary>
              <p className="max-w-[62ch] pb-6 text-[var(--k-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </Chapter>

      {/* VII */}
      <Chapter
        id="begin"
        numeral="VII"
        wide
        title={
          <>
            Begin with a free <span data-vs-italic>workshop.</span>
          </>
        }
        lede={offer.promise}
      >
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ol>
              {joining.map((j, i) => (
                <li
                  key={j.verb}
                  className="grid grid-cols-[2.6rem_1fr] gap-3 border-t border-[var(--k-line)] py-5 last:border-b"
                >
                  <span data-vs-chapter className="pt-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span
                      data-k-display
                      className="block text-3xl leading-none"
                    >
                      {j.verb}
                    </span>
                    <span className="mt-2 block text-[var(--k-muted)]">
                      {j.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <figure className="mt-10">
              <span
                data-k-photo
                className="relative block aspect-[4/3] overflow-hidden rounded-[3px]"
              >
                <Image
                  src={campus[0]!.src}
                  alt={campus[0]!.alt}
                  fill
                  sizes="(min-width: 1024px) 460px, 100vw"
                  className="object-cover"
                />
              </span>
              <figcaption className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <address className="not-italic">
                  <span className="flex items-center gap-2">
                    <IconMapPin
                      aria-hidden
                      size={18}
                      stroke={1.75}
                      className="text-[var(--k-accent)]"
                    />
                    <span data-k-display className="text-2xl leading-tight">
                      {place.street}, {place.city}
                    </span>
                  </span>
                  <span className="mt-1 block pl-[26px] text-sm text-[var(--k-muted)]">
                    {place.region} {place.pin}. Ask for {place.spoken}.
                  </span>
                </address>
                <a
                  href={place.maps}
                  {...external}
                  data-k-press
                  data-k-outline
                  className="inline-flex h-11 items-center gap-2 px-4 text-sm"
                >
                  Directions
                  <IconArrowUpRight aria-hidden size={15} stroke={2} />
                </a>
              </figcaption>
            </figure>
          </div>
          <div className="lg:col-span-7">
            <div data-k-card className="p-6 sm:p-10">
              <h3 data-k-display className="text-3xl leading-tight">
                Not sure which batch? Tell us your exam and your hours.
              </h3>
              <div className="mt-8">
                <EnquiryForm />
              </div>
              <a
                href={tel}
                data-k-press
                data-k-outline
                className="mt-6 inline-flex h-11 items-center px-5 text-sm tabular-nums"
              >
                Or call {phone}
              </a>
            </div>
          </div>
        </div>
      </Chapter>

      <SiteReel c={campaign} />
    </main>
  )
}
