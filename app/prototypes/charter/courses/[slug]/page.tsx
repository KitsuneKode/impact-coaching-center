import type { Metadata } from "next"

import { KitCourse, listed } from "../../../_kit/course"
import { base } from "../../_theme"

export function generateStaticParams() {
  return listed.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/prototypes/charter/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const course = listed.find((c) => c.slug === slug)
  return { title: course ? course.short : "Course" }
}

export default async function Page({
  params,
}: PageProps<"/prototypes/charter/courses/[slug]">) {
  const { slug } = await params
  return <KitCourse base={base} slug={slug} />
}
