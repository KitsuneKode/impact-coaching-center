"use client"

import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type CSSProperties } from "react"

/* ------------------------------------------------------------------ */
/*  The silk field                                                     */
/* ------------------------------------------------------------------ */

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`

/**
 * Muga silk: domain-warped noise for the drape, a folded sine for the sheen
 * along each fold, and a fine striation for the thread. Gold runs over a
 * periwinkle ground and fades to the page toward the bottom.
 */
const FRAG = `
precision highp float;
uniform vec2 r;
uniform float t;
uniform vec2 m;
vec2 h2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}
float nz(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(h2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(h2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * nz(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = (gl_FragCoord.xy - 0.5 * r) / r.y;
  p += (m - 0.5) * vec2(0.06, -0.04);
  float T = t * 0.03;
  vec2 q = vec2(fbm(p * 0.55 + vec2(0.0, T)), fbm(p * 0.55 + vec2(5.2, -T)));
  vec2 w = vec2(fbm(p * 0.7 + 1.6 * q + vec2(1.7, 9.2) + 0.5 * T), fbm(p * 0.7 + 1.6 * q + vec2(8.3, 2.8) - 0.4 * T));
  float f = fbm(p * 0.6 + 1.8 * w);
  float phase = (p.x * 0.7 + p.y * 0.25 + 2.2 * w.x + 1.4 * f) * 6.2831;
  float sheen = pow(0.5 + 0.5 * sin(phase), 5.0);
  float shade = 0.5 + 0.5 * sin(phase - 1.3);
  float thread = 0.5 + 0.5 * sin((p.x * 0.35 - p.y + 1.6 * w.y) * 420.0);
  vec3 peri = vec3(0.67, 0.72, 0.95);
  vec3 muga = vec3(0.86, 0.66, 0.34);
  vec3 gleam = vec3(1.0, 0.9, 0.7);
  float gold = smoothstep(-0.3, 0.5, f * 1.4 + 0.7 * (uv.y - 0.55) - 0.55 * abs(uv.x - 0.5));
  vec3 col = mix(peri, muga, gold);
  col *= 0.93 + 0.1 * shade;
  col = mix(col, gleam, sheen * 0.3 * gold);
  col += (thread - 0.5) * 0.02 * gold;
  vec3 page = vec3(0.973, 0.973, 0.965);
  float lift = smoothstep(0.1, 0.95, uv.y);
  float clear = 1.0 - smoothstep(0.1, 0.62, length((uv - vec2(0.5, 0.4)) * vec2(1.15, 1.6)));
  col = mix(col, page, clamp(1.0 - lift + clear * 0.72, 0.0, 1.0));
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + t) * 43758.5453);
  col += (g - 0.5) * 0.024;
  gl_FragColor = vec4(col, 1.0);
}
`

export function SilkField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", {
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    })
    if (!gl) return
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const loc = gl.getAttribLocation(prog, "a")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(prog, "r")
    const uT = gl.getUniformLocation(prog, "t")
    const uM = gl.getUniformLocation(prog, "m")

    // Half resolution: the field is soft, and a phone's GPU has better things to do.
    const scale = Math.min(devicePixelRatio, 2) * 0.5
    const size = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uR, canvas.width, canvas.height)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / innerWidth
      mouse.ty = e.clientY / innerHeight
    }
    addEventListener("pointermove", onMove, { passive: true })

    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      if (visible && !still) loop()
    })
    io.observe(canvas)

    let frame = 0
    const t0 = performance.now() - 40_000
    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      gl.uniform1f(uT, (now - t0) / 1000)
      gl.uniform2f(uM, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = () => {
      cancelAnimationFrame(frame)
      const tick = (now: number) => {
        draw(now)
        if (visible && !document.hidden) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    const onVis = () => !document.hidden && visible && !still && loop()
    document.addEventListener("visibilitychange", onVis)

    draw(performance.now())
    setOn(true)
    if (!still) loop()

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      removeEventListener("pointermove", onMove)
      document.removeEventListener("visibilitychange", onVis)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [])

  return <canvas ref={ref} data-on={on || undefined} aria-hidden />
}

/* ------------------------------------------------------------------ */
/*  English and Assamese                                               */
/* ------------------------------------------------------------------ */

export type Pair = { en: string; as: string }
export type TrackCard = {
  slug: string
  tint: string
  exam: Pair
  full: Pair
  covers: Pair
  duration: Pair
  price: string
  href: string
}

/** The three tracks, readable in either language; the words blur across when you switch. */
export function TwoTongues({
  tracks,
  steps,
}: {
  tracks: TrackCard[]
  steps: { verb: Pair; body: Pair }[]
}) {
  const [lang, setLang] = useState<"en" | "as">("en")
  const reduce = useReducedMotion()
  const swap = {
    initial: reduce
      ? { opacity: 0 }
      : { opacity: 0, filter: "blur(6px)", y: 4 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", y: -4 },
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const },
  }
  const font = (l: "en" | "as") =>
    l === "as" ? ({ "data-ak-as": "" } as Record<string, string>) : {}

  return (
    <div>
      <fieldset data-ak-switch data-as={lang === "as" || undefined}>
        <legend className="sr-only">Language</legend>
        <span data-ak-thumb aria-hidden />
        <button
          type="button"
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          English
        </button>
        <button
          type="button"
          lang="as"
          aria-pressed={lang === "as"}
          onClick={() => setLang("as")}
          data-ak-as
        >
          অসমীয়া
        </button>
      </fieldset>

      <ul className="mt-10 grid gap-4 lg:grid-cols-3">
        {tracks.map((t) => (
          <li key={t.slug}>
            <a
              href={t.href}
              data-k-card
              data-ak-track
              style={{ "--ak-tint": t.tint } as CSSProperties}
              className="flex h-full min-h-[280px] flex-col p-7"
              lang={lang}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.div key={lang} {...swap} className="flex flex-1 flex-col">
                  <p data-ak-mono>{t.duration[lang]}</p>
                  <p
                    {...font(lang)}
                    data-k-display={lang === "en" ? "" : undefined}
                    className="mt-4 text-3xl leading-tight text-[var(--k-ink)]"
                  >
                    {t.exam[lang]}
                  </p>
                  <p {...font(lang)} className="mt-1 text-[var(--k-muted)]">
                    {t.full[lang]}
                  </p>
                  <p {...font(lang)} className="mt-6 text-sm leading-relaxed">
                    {t.covers[lang]}
                  </p>
                  <p className="mt-auto pt-6 text-lg font-semibold tabular-nums">
                    {t.price}
                  </p>
                </m.div>
              </AnimatePresence>
            </a>
          </li>
        ))}
      </ul>

      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.verb.en} data-k-tile className="p-6" lang={lang}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div key={lang} {...swap}>
                <p
                  {...font(lang)}
                  className="text-lg font-semibold text-[var(--k-ink)]"
                >
                  {s.verb[lang]}
                </p>
                <p {...font(lang)} className="mt-1 text-sm">
                  {s.body[lang]}
                </p>
              </m.div>
            </AnimatePresence>
          </li>
        ))}
      </ol>
    </div>
  )
}
