import { describe, expect, test } from "bun:test"

import {
  campaignPhase,
  checkCampaign,
  isLiveNow,
  isRested,
  isSafeHref,
  kindsOf,
  istInputToMs,
  matchesPath,
  msToIstInput,
  showsOn,
  parseVideos,
  youtubeId,
  wordsIn,
  type CampaignInput,
} from "./campaigns"

const base: CampaignInput = {
  name: "Free workshop",
  kinds: ["bar"],
  tag: "New batch",
  headline: "Start with a free workshop.",
  body: "",
  cta: "Join a free workshop",
  href: "/contact",
  coupon: "",
  reelIds: [],
  routes: [],
  delaySeconds: 0,
  restDays: 7,
  priority: 10,
}

const fail = (patch: Partial<CampaignInput>) => {
  const r = checkCampaign({ ...base, ...patch })
  return r.ok ? null : r.field
}

describe("checkCampaign", () => {
  test("accepts a plain announcement bar and trims it", () => {
    const r = checkCampaign({ ...base, name: "  Free workshop  ", coupon: "" })
    expect(r.ok && r.value.name).toBe("Free workshop")
  })

  test("names the first field at fault", () => {
    expect(fail({ name: " " })).toBe("name")
    expect(fail({ headline: "" })).toBe("headline")
    expect(fail({ headline: "x".repeat(91) })).toBe("headline")
    expect(fail({ cta: "" })).toBe("button")
    expect(fail({ tag: "x".repeat(25) })).toBe("label")
  })

  test("a banner and a pop-up need a message; a bar does not", () => {
    expect(fail({ kinds: ["banner"], body: "" })).toBe("message")
    expect(fail({ kinds: ["modal"], body: "" })).toBe("message")
    expect(fail({ kinds: ["bar"], body: "" })).toBeNull()
  })

  test("one campaign can show in several places at once", () => {
    const id = "dQw4w9WgXcQ"
    const r = checkCampaign({
      ...base,
      kinds: ["reel", "bar", "modal"],
      body: "Two days, on the app.",
      reelIds: [id],
    })
    expect(r.ok && r.value.kinds).toEqual(["bar", "modal", "reel"])
    expect(r.ok && r.value.reelIds).toEqual([id])
    expect(fail({ kinds: [] })).toBe("type")
    expect(fail({ kinds: ["bar", "bar"] })).toBe("type")
    expect(fail({ kinds: ["bar", "modal"], body: "" })).toBe("message")
    expect(fail({ kinds: ["bar", "reel"], reelIds: [] })).toBe("videos")
  })

  test("an older row with a single kind reads as that one place", () => {
    expect(kindsOf({ kind: "modal" })).toEqual(["modal"])
    expect(kindsOf({ kind: "modal", kinds: ["bar", "reel"] })).toEqual([
      "bar",
      "reel",
    ])
    expect(kindsOf({})).toEqual([])
  })

  test("links stay on the site or go to https", () => {
    expect(isSafeHref("/courses/lakhya-2027")).toBe(true)
    expect(isSafeHref("https://wa.me/918638061175")).toBe(true)
    expect(isSafeHref("//evil.example")).toBe(false)
    expect(isSafeHref("javascript:alert(1)")).toBe(false)
    expect(isSafeHref("http://plain.example")).toBe(false)
    expect(fail({ href: "javascript:alert(1)" })).toBe("link")
  })

  test("a coupon is upper-cased and limited to letters, digits and dashes", () => {
    const r = checkCampaign({ ...base, coupon: "firstclass" })
    expect(r.ok && r.value.coupon).toBe("FIRSTCLASS")
    expect(fail({ coupon: "has space" })).toBe("code")
    expect(fail({ coupon: "ab" })).toBe("code")
  })

  test("a reel needs one to eight distinct YouTube ids", () => {
    const id = "iMTV56lmQpQ"
    expect(fail({ kinds: ["reel"], reelIds: [] })).toBe("videos")
    expect(fail({ kinds: ["reel"], reelIds: ["short"] })).toBe("videos")
    expect(fail({ kinds: ["reel"], reelIds: [id, id] })).toBe("videos")
    expect(fail({ kinds: ["reel"], reelIds: [id] })).toBeNull()
    expect(fail({ kinds: ["bar"], reelIds: [id] })).toBe("videos")
  })

  test("pages are paths, at most ten", () => {
    expect(fail({ routes: ["courses"] })).toBe("pages")
    expect(
      fail({ routes: Array.from({ length: 11 }, (_, i) => `/p${i}`) })
    ).toBe("pages")
    expect(fail({ routes: ["/courses", "/exams"] })).toBeNull()
  })

  test("the end must come after the start", () => {
    expect(fail({ startsAt: 100, endsAt: 100 })).toBe("end")
    expect(fail({ startsAt: 100, endsAt: 50 })).toBe("end")
    expect(fail({ startsAt: 100, endsAt: 200 })).toBeNull()
    expect(fail({ startsAt: Number.NaN })).toBe("start")
  })

  test("delay, rest and priority stay in range and whole", () => {
    expect(fail({ delaySeconds: -1 })).toBe("delay")
    expect(fail({ delaySeconds: 601 })).toBe("delay")
    expect(fail({ restDays: 1.5 })).toBe("rest days")
    expect(fail({ priority: 101 })).toBe("priority")
  })
})

describe("isLiveNow and campaignPhase", () => {
  const live = { status: "live" as const, startsAt: 100, endsAt: 200 }

  test("live only inside its window", () => {
    expect(isLiveNow(live, 99)).toBe(false)
    expect(isLiveNow(live, 100)).toBe(true)
    expect(isLiveNow(live, 199)).toBe(true)
    expect(isLiveNow(live, 200)).toBe(false)
  })

  test("no dates means always, but never while drafted or paused", () => {
    expect(isLiveNow({ status: "live" }, 5)).toBe(true)
    expect(isLiveNow({ status: "draft" }, 5)).toBe(false)
    expect(isLiveNow({ status: "paused" }, 5)).toBe(false)
  })

  test("the badge reads the switch and the dates together", () => {
    expect(campaignPhase({ status: "draft" }, 5)).toBe("draft")
    expect(campaignPhase({ status: "paused", startsAt: 1 }, 5)).toBe("paused")
    expect(campaignPhase(live, 50)).toBe("scheduled")
    expect(campaignPhase(live, 150)).toBe("live")
    expect(campaignPhase(live, 250)).toBe("ended")
  })
})

describe("matchesPath", () => {
  test("no pages means everywhere", () => {
    expect(matchesPath([], "/anything")).toBe(true)
  })
  test("a slash means the home page alone", () => {
    expect(matchesPath(["/"], "/")).toBe(true)
    expect(matchesPath(["/"], "/courses")).toBe(false)
  })
  test("a path covers itself and what is under it, not a lookalike", () => {
    expect(matchesPath(["/courses"], "/courses")).toBe(true)
    expect(matchesPath(["/courses"], "/courses/lakhya-2027")).toBe(true)
    expect(matchesPath(["/courses"], "/coursework")).toBe(false)
  })
})

describe("showsOn", () => {
  test("neither pages nor exams means everywhere", () => {
    expect(showsOn({ routes: [] }, "/books", null)).toBe(true)
    expect(showsOn({ routes: [], exams: [] }, "/books", "APSC")).toBe(true)
  })
  test("an exam's promotion shows on that exam's pages only", () => {
    const c = { routes: [], exams: ["APSC"] }
    expect(showsOn(c, "/courses/lakhya-2027", "APSC")).toBe(true)
    expect(showsOn(c, "/courses/victor-9-0", "ADRE and Assam Police")).toBe(
      false
    )
    expect(showsOn(c, "/courses", null)).toBe(false)
  })
  test("pages and exams add up", () => {
    const c = { routes: ["/library"], exams: ["APSC"] }
    expect(showsOn(c, "/library", null)).toBe(true)
    expect(showsOn(c, "/books/apsc-mains-set", "APSC")).toBe(true)
    expect(showsOn(c, "/blog", null)).toBe(false)
  })
})

describe("checkCampaign exams", () => {
  test("keeps known exams in the site's order", () => {
    const r = checkCampaign({
      ...base,
      exams: ["Bank, SSC, Railway", "APSC"],
    })
    expect(r.ok && r.value.exams).toEqual(["APSC", "Bank, SSC, Railway"])
  })
  test("refuses an exam the site does not teach", () => {
    expect(fail({ exams: ["UPSC"] })).toBe("exams")
  })
  test("an older campaign without exams saves as none", () => {
    const r = checkCampaign(base)
    expect(r.ok && r.value.exams).toEqual([])
  })
})

describe("youtubeId and parseVideos", () => {
  const id = "iMTV56lmQpQ"
  test("reads every link shape ICT is likely to paste", () => {
    expect(youtubeId(id)).toBe(id)
    expect(youtubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id)
    expect(youtubeId(`https://youtu.be/${id}?si=abc`)).toBe(id)
    expect(youtubeId(`https://www.youtube.com/shorts/${id}`)).toBe(id)
    expect(youtubeId(`https://m.youtube.com/watch?v=${id}&t=10`)).toBe(id)
  })
  test("refuses anything else", () => {
    expect(youtubeId("https://example.com/watch?v=" + id)).toBeNull()
    expect(youtubeId("not a link")).toBeNull()
    expect(youtubeId("https://www.youtube.com/watch?v=short")).toBeNull()
  })
  test("one per line, duplicates dropped, bad lines named", () => {
    const r = parseVideos(`${id}\n\nhttps://youtu.be/${id}\nnope\n`)
    expect(r.ids).toEqual([id])
    expect(r.bad).toEqual(["nope"])
  })
})

describe("India time inputs", () => {
  test("round-trips a datetime-local value", () => {
    const ms = istInputToMs("2026-10-01T09:30")!
    expect(ms).toBe(Date.UTC(2026, 9, 1, 4, 0))
    expect(msToIstInput(ms)).toBe("2026-10-01T09:30")
  })
  test("blank is no date, junk is NaN", () => {
    expect(istInputToMs("")).toBeUndefined()
    expect(istInputToMs("later")).toBeNaN()
    expect(msToIstInput(undefined)).toBe("")
  })
})

describe("isRested", () => {
  const day = 86_400_000
  test("a promotion never closed may show", () => {
    expect(isRested(null, 7, 1000)).toBe(true)
  })
  test("it stays away for the rest days, then returns", () => {
    expect(isRested(0, 7, 6 * day)).toBe(false)
    expect(isRested(0, 7, 7 * day)).toBe(true)
  })
  test("zero rest days means it may show again straight away", () => {
    expect(isRested(500, 0, 500)).toBe(true)
  })
})

describe("Assamese wording", () => {
  const empty = { tag: "", headline: "", body: "", cta: "" }

  test("is dropped when every field is empty", () => {
    const r = checkCampaign({ ...base, as: { ...empty, tag: "  " } })
    expect(r.ok && r.value.as).toBeUndefined()
  })

  test("needs a headline, and a button when the English has one", () => {
    expect(fail({ as: { ...empty, body: "বাৰ্তা" } })).toBe("Assamese headline")
    expect(fail({ as: { ...empty, headline: "নতুন বেটচ" } })).toBe(
      "Assamese button"
    )
    const r = checkCampaign({
      ...base,
      as: { ...empty, headline: " নতুন বেটচ ", cta: "যোগ দিয়ক" },
    })
    expect(r.ok && r.value.as?.headline).toBe("নতুন বেটচ")
  })

  test("shows on Assamese pages, English filling what it leaves out", () => {
    const promo = {
      ...base,
      as: { tag: "", headline: "নতুন বেটচ", body: "", cta: "যোগ দিয়ক" },
    }
    expect(wordsIn(promo, "en").headline).toBe(base.headline)
    const as = wordsIn(promo, "as")
    expect(as.headline).toBe("নতুন বেটচ")
    expect(as.tag).toBe(base.tag)
    expect(as.cta).toBe("যোগ দিয়ক")
    expect(wordsIn(base, "as")).toBe(base)
  })
})
