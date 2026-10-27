"use client"

import { useEffect, useRef } from "react"

/*
 * The blue field, alive: slow silk in ICT's blues with a fine grain, drawn
 * by one WebGL fragment shader behind a [data-hero="blue"] section.
 *
 * It only ever adds to a page that already works. The section's own CSS
 * gradient (app/pulse.css) is the fallback and stays underneath: no WebGL,
 * Save-Data, a small phone (under 4 GB or 4 cores) or reduced motion keep
 * it, the last with one still frame of the silk. The canvas draws at a
 * fraction of the screen's pixels (the silk is soft, so it upscales
 * cleanly), at 30 frames a second, and stops when the section is off
 * screen or the tab is hidden. It fades in after the page's first paint,
 * so it never delays the headline.
 */

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

/* Domain-warped noise (the "silk"), lit towards the right where the photos
   sit, so the copy on the left keeps its contrast with white text. The
   pointer stirs it like ink in water: a swirl around it whose strength is
   how fast it moves (uInk), and a soft light under it. Film grain moves
   over all of it, heavier on the left, like the paper the copy sits on. */
const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uInk;
uniform float uNear;
uniform vec3 uDeep;
uniform vec3 uBlue;
uniform vec3 uLight;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 aspect=vec2(uRes.x/uRes.y,1.);
  vec2 p=uv*aspect*1.6;
  vec2 d=(uv-uMouse)*aspect;
  float fall=exp(-dot(d,d)*9.);
  p+=vec2(-d.y,d.x)*fall*uInk*2.4+d*fall*uInk*.6;
  float t=uTime*.035;
  vec2 q=vec2(fbm(p+t),fbm(p-t+vec2(5.2,1.3)));
  vec2 r=vec2(fbm(p+2.2*q+vec2(1.7,9.2)+t*1.4),fbm(p+2.2*q+vec2(8.3,2.8)-t));
  float f=fbm(p+2.6*r);
  vec3 col=mix(uDeep,uBlue,smoothstep(.18,.62,f));
  float right=smoothstep(.15,.95,uv.x)*smoothstep(-.2,.9,uv.y);
  col=mix(col,uLight,smoothstep(.5,.92,f)*right*.6);
  float sheen=pow(max(0.,sin((p.x*.9+p.y*.5)*2.2+f*5.+uTime*.12)),14.);
  col+=sheen*.07*right;
  col+=uLight*exp(-dot(d,d)*5.)*.16*uNear;
  float grain=hash(gl_FragCoord.xy+floor(uTime*18.)*vec2(17.,31.))-.5;
  col+=grain*mix(.07,.035,uv.x);
  gl_FragColor=vec4(col,1.);
}`

/** sRGB hex to the 0-1 floats a shader reads. */
const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

/* The hero's blues as hex (Pulse --primary-deep, --primary, and a lit blue
   that still holds 4.5:1 against white text). */
const DEEP = rgb("#16449a")
const BLUE = rgb("#1f5fd1")
const LIGHT = rgb("#4a82ec")

function capable() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false
  if ((nav.hardwareConcurrency ?? 8) < 4) return false
  return true
}

export function BlueField() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const section = el?.parentElement
    if (!el || !section || !capable()) return
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const gl = el.getContext("webgl", {
      antialias: false,
      depth: false,
      alpha: false,
      powerPreference: "low-power",
      premultipliedAlpha: false,
    })
    if (!gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const position = gl.getAttribLocation(program, "p")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(program, "uRes")
    const uTime = gl.getUniformLocation(program, "uTime")
    const uMouse = gl.getUniformLocation(program, "uMouse")
    const uInk = gl.getUniformLocation(program, "uInk")
    const uNear = gl.getUniformLocation(program, "uNear")
    gl.uniform3fv(gl.getUniformLocation(program, "uDeep"), DEEP)
    gl.uniform3fv(gl.getUniformLocation(program, "uBlue"), BLUE)
    gl.uniform3fv(gl.getUniformLocation(program, "uLight"), LIGHT)

    // Soft silk upscales cleanly: draw few pixels, more on wide screens.
    const scale = matchMedia("(width >= 64rem)").matches ? 0.5 : 0.35
    const resize = () => {
      const box = section.getBoundingClientRect()
      el.width = Math.max(1, Math.round(box.width * scale))
      el.height = Math.max(1, Math.round(box.height * scale))
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform2f(uRes, el.width, el.height)
    }
    resize()
    const sized = new ResizeObserver(resize)
    sized.observe(section)

    // A start somewhere in the loop, so a reload is not the same frame.
    const offset = Math.random() * 200
    let frame = 0
    let last = 0
    let visible = true

    /* The pointer, eased: where it is (0-1 across the section, y up as the
       shader reads it), how fast it moved (the ink), and whether it is over
       the section at all. The photo wall reads the same pointer through
       --px/--py, -1 to 1, so the columns move against each other. */
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches
    const goal = { x: 0.3, y: 0.55, near: 0 }
    const now = { x: 0.3, y: 0.55, near: 0, ink: 0 }
    let speed = 0
    const onMove = (event: PointerEvent) => {
      const box = section.getBoundingClientRect()
      const x = (event.clientX - box.left) / box.width
      const y = 1 - (event.clientY - box.top) / box.height
      speed += Math.hypot(x - goal.x, y - goal.y)
      goal.x = x
      goal.y = y
      goal.near = 1
    }
    const onLeave = () => {
      goal.near = 0
    }
    if (fine && !still) {
      section.addEventListener("pointermove", onMove, { passive: true })
      section.addEventListener("pointerleave", onLeave)
    }

    const draw = (time: number) => {
      gl.uniform1f(uTime, offset + time / 1000)
      gl.uniform2f(uMouse, now.x, now.y)
      gl.uniform1f(uInk, now.ink)
      gl.uniform1f(uNear, now.near)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    let lastStep = 0
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick)
      const dt = lastStep ? Math.min((time - lastStep) / 1000, 0.05) : 1 / 60
      lastStep = time
      // Springy follow (critically damped feel), every frame for the CSS.
      const k = 1 - Math.exp(-dt / 0.18)
      now.x += (goal.x - now.x) * k
      now.y += (goal.y - now.y) * k
      now.near += (goal.near - now.near) * (1 - Math.exp(-dt / 0.4))
      // Ink rises with speed and settles over about a second.
      now.ink = Math.min(1, now.ink * Math.exp(-dt / 0.9) + speed * 2.2)
      speed = 0
      section.style.setProperty("--px", ((now.x - 0.5) * 2).toFixed(3))
      section.style.setProperty("--py", ((0.5 - now.y) * 2).toFixed(3))
      if (time - last < 1000 / 30) return
      last = time
      draw(time)
    }
    const run = () => {
      cancelAnimationFrame(frame)
      if (!still && visible && !document.hidden)
        frame = requestAnimationFrame(tick)
    }

    // After first paint and idle time: the headline is the page's LCP.
    const reveal = () => {
      draw(performance.now())
      el.dataset.ready = ""
      run()
    }
    // Safari has no requestIdleCallback; a short timeout stands in.
    const idleApi = typeof requestIdleCallback === "function"
    const idle = idleApi
      ? requestIdleCallback(reveal, { timeout: 1200 })
      : setTimeout(reveal, 300)

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      run()
    })
    seen.observe(section)
    document.addEventListener("visibilitychange", run)

    return () => {
      if (idleApi) cancelIdleCallback(idle as number)
      else clearTimeout(idle)
      cancelAnimationFrame(frame)
      sized.disconnect()
      seen.disconnect()
      document.removeEventListener("visibilitychange", run)
      section.removeEventListener("pointermove", onMove)
      section.removeEventListener("pointerleave", onLeave)
      // Not loseContext(): React's dev double effect would reuse a dead one.
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={canvas} data-blue-field aria-hidden />
}
