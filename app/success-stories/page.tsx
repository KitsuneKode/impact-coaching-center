import {
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import type { CSSProperties } from "react"

import { Enquire } from "@/components/marketing/enquire"
import { Guests } from "@/components/marketing/guests"
import { SelectionCard } from "@/components/marketing/results"
import { StudentVoices } from "@/components/marketing/student-voices"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { links, selections } from "@/lib/brand"
import { publishedStories, thumb } from "@/lib/stories"

export const metadata: Metadata = {
  title: "Success stories and student reviews",
  description:
    "Two officers on the APSC CCE 2022 list, ICT's own success stories, student reviews by name and batch, and the serving officers who have taken sessions at the centre in North Lakhimpur.",
  alternates: { canonical: "/success-stories" },
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/**
 * Results, sorted by how well each one can be checked.
 *
 * Most coaching sites pile every name into one wall and let the reader assume
 * the institute produced all of them. This page separates three things on
 * purpose: what the commission published, what ICT published, and who visited.
 * Saying which is which is the most persuasive thing on the page, because
 * anyone can verify the top tier in one click.
 */
export default function SuccessStoriesPage() {
  return (
    <main>
      <section className="pt-26 pb-10 md:pt-30">
        <div className="container-page">
          <h1 className="enter type-display max-w-208" style={delay(0)}>
            <span className="text-foreground">
              Results, and how to check them.
            </span>
            <span className="text-muted-foreground">
              {" "}
              Three different things get called a result in this industry. Here
              they are kept apart: what the commission printed, what ICT
              published, and the officers who came to teach.
            </span>
          </h1>
        </div>
      </section>

      {/* ---- tier one: checkable in a primary source ---- */}
      <Section size="sm" className="border-t border-border">
        <Reveal>
          <Lede
            label="On the official list"
            claim="Two officers from the APSC CCE 2022 result."
            rest="Their serials are printed in the commission's own PDF, published on 17 January 2024. Open it and search the names."
            link={{
              href: links.apscResultPdf,
              label: "Open the result",
              external: true,
            }}
          />
        </Reveal>
        <Reveal
          delay={0.08}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl"
        >
          {selections.map((person) => (
            <SelectionCard key={person.serial} person={person} />
          ))}
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            Both names also appear on another institute&apos;s list. Students
            often study in more than one place, so ICT is credited with
            preparing them, never with producing them alone.
          </p>
        </Reveal>
      </Section>

      {/* ---- tier two: ICT's own published stories ---- */}
      <Section size="sm" className="border-t border-border">
        <Reveal>
          <Lede
            label="Published by ICT"
            claim="Selections the institute has announced itself."
            rest="These come from ICT's own Success Stories videos. They are not in a result we can open, so they are credited to ICT rather than presented as verified."
          />
        </Reveal>
        <Reveal
          delay={0.08}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl"
        >
          {publishedStories.map((story) => (
            <VideoDialog
              key={story.id}
              id={story.id}
              title={`${story.name}, ${story.outcome}`}
              subtitle="From ICT's Success Stories"
              vertical
              className="flex w-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-frame transition-shadow hover:shadow-lift"
            >
              <span className="relative block aspect-video bg-surface">
                <Image
                  src={thumb(story.id)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 92vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-full bg-white/95 text-foreground shadow-frame">
                    <IconPlayerPlayFilled className="size-4" />
                  </span>
                </span>
              </span>
              <span className="p-5">
                <span className="block text-[1.0625rem] font-medium">
                  {story.name}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {story.outcome}
                </span>
                <span className="mt-3 block text-sm text-muted-foreground">
                  {story.note}
                </span>
              </span>
            </VideoDialog>
          ))}

          <div className="flex flex-col justify-center rounded-card bg-surface p-6">
            <IconCircleCheckFilled
              size={20}
              className="text-verified"
              aria-hidden
            />
            <p className="mt-3 text-[0.9375rem] leading-relaxed">
              When ICT shares the result document for a selection, it moves up
              to the section above and gets a verified mark.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ---- tier three: students on the record ---- */}
      <div className="border-t border-border">
        <StudentVoices
          heading="Students who studied here, on the record."
          lead="Each of these is a review ICT filmed and published, with the student's name and batch on the card. They are not selections, they are people describing the teaching."
        />
      </div>

      {/* ---- tier four: guests, never presented as results ---- */}
      <div className="border-t border-border">
        <Guests />
      </div>

      <Enquire />
    </main>
  )
}
