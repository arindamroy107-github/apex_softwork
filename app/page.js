'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  useInView,
  useAnimationFrame,
} from 'framer-motion'
import { ArrowUpRight, ArrowRight, Check, Plus } from 'lucide-react'

const Scene = dynamic(() => import('@/components/apex/Scene'), { ssr: false })

const EASE = [0.16, 1, 0.3, 1]

const CHAPTERS = ['THE ORE', 'THE MONOLITH', 'THE SYSTEM', 'THE INTELLIGENCE', 'APEX', 'CONVERGENCE']
const KEYS = [0, 0.08, 0.23, 0.39, 0.55, 0.7, 1]

/* ----------------------------- motion helpers ----------------------------- */

function MaskLine({ children, delay = 0, className = '', mount = false }) {
  const reduced = useReducedMotion()
  if (reduced) return <span className={'block ' + className}>{children}</span>
  const anim = mount
    ? { initial: { y: '115%' }, animate: { y: '0%' } }
    : { initial: { y: '115%' }, whileInView: { y: '0%' }, viewport: { once: true, amount: 0.2 } }
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={'block ' + className}
        {...anim}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function Reveal({ children, delay = 0, y = 36, className = '' }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

function Hairline({ delay = 0 }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="h-px w-full bg-[#ede8e0]/15 origin-left"
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    />
  )
}

/* --------------------------------- HUD ----------------------------------- */

function ScrollHUD({ progress }) {
  const [pct, setPct] = useState(0)
  const [chap, setChap] = useState(0)
  useMotionValueEvent(progress, 'change', (v) => {
    setPct(Math.round(v * 100))
    let s = 0
    while (s < KEYS.length - 1 && v >= KEYS[s + 1]) s++
    setChap((p) => (p === s ? p : s))
  })
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[56] hidden md:flex items-end justify-between px-8 pb-6 font-mono2 text-[11px] tracking-[0.18em] text-[#ede8e0]/60">
      <div className="flex items-center gap-3">
        <span className="text-[#ff6a2c]">{String(chap + 1).padStart(2, '0')}</span>
        <span className="h-px w-8 bg-[#ede8e0]/25" />
        <span>{CHAPTERS[chap]}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>FORGED IN UTAH</span>
        <span className="text-[#ede8e0]/40">/</span>
        <span className="tabular-nums">{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  )
}

/* ------------------------------ navigation ------------------------------- */

function Nav({ onNavigate }) {
  const links = [
    ['CRAFT', '#craft'],
    ['SYSTEMS', '#systems'],
    ['INTELLIGENCE', '#intelligence'],
    ['STUDIO', '#studio'],
  ]
  return (
    <motion.nav
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
      className="fixed top-0 inset-x-0 z-[60] flex items-center justify-between px-5 md:px-8 py-5"
    >
      <button onClick={() => onNavigate('#top')} className="flex items-center gap-2 group">
        <span className="text-[#ff6a2c] text-lg leading-none transition-transform group-hover:rotate-90 duration-500">✦</span>
        <span className="font-mono2 text-[12px] tracking-[0.28em] text-[#ede8e0]">APEXSOFTWORKS</span>
      </button>

      <div className="hidden md:flex items-center gap-9 font-mono2 text-[11px] tracking-[0.18em] text-[#ede8e0]/65">
        {links.map(([label, href]) => (
          <button
            key={href}
            onClick={() => onNavigate(href)}
            className="relative hover:text-[#ede8e0] transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#ff6a2c] hover:after:w-full after:transition-all after:duration-300"
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onNavigate('#connect')}
        className="group flex items-center gap-2 rounded-full border border-[#ede8e0]/20 px-4 py-2 font-mono2 text-[11px] tracking-[0.18em] text-[#ede8e0] hover:bg-[#ede8e0] hover:text-[#08080a] transition-colors duration-300"
      >
        START A PROJECT
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </motion.nav>
  )
}

/* --------------------------------- hero ---------------------------------- */

function Hero({ onNavigate, started }) {
  return (
    <section id="top" className="relative min-h-[100svh] w-full">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 70% at 18% 82%, rgba(8,8,10,0.78), transparent 70%)' }}
      />
      <div className="absolute left-5 right-5 top-24 md:left-8 md:right-8 flex items-start justify-between font-mono2 text-[10px] md:text-[11px] tracking-[0.22em] text-[#ede8e0]/55">
        <Reveal delay={0.5}>
          <p>SOFTWARE STUDIO</p>
          <p className="mt-1 text-[#ede8e0]/35">EST. MMXIV</p>
        </Reveal>
        <Reveal delay={0.6} className="text-right">
          <p>UTAH</p>
          <p className="mt-1 text-[#ede8e0]/35">USA</p>
        </Reveal>
      </div>

      <div className="absolute bottom-[14vh] left-5 right-5 md:left-8 md:right-8">
        <Reveal delay={0.35} className="mb-5 md:mb-7">
          <span className="inline-flex items-center gap-2 font-mono2 text-[10px] md:text-[11px] tracking-[0.24em] text-[#ff6a2c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6a2c]" />
            RAW INTENT, MADE INEVITABLE
          </span>
        </Reveal>

        <h1
          className="font-display font-extrabold uppercase leading-[0.82] tracking-[-0.035em] text-[#ede8e0]"
          style={{ fontSize: 'clamp(3.1rem, 11.5vw, 11rem)' }}
        >
          {started && (
            <>
              <MaskLine mount delay={0.15}>Forged,</MaskLine>
              <MaskLine mount delay={0.27} className="font-serif-it lowercase font-normal tracking-[-0.01em] text-[#ff8a4c]">
                not&nbsp;assembled.
              </MaskLine>
            </>
          )}
        </h1>

        <div className="mt-7 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Reveal delay={0.2} className="max-w-[30rem]">
            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#ede8e0]/70">
              ApexSoftworks is a Utah software studio engineering custom platforms,
              products, and AI systems. We treat software as a craft, not a commodity —
              and this page is the proof.
            </p>
          </Reveal>
          <Reveal delay={0.32}>
            <button
              onClick={() => onNavigate('#connect')}
              className="group inline-flex items-center gap-3 font-mono2 text-[12px] tracking-[0.2em] text-[#ede8e0]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[#ede8e0]/25 transition-colors group-hover:border-[#ff6a2c] group-hover:bg-[#ff6a2c]/10">
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              BEGIN THE ASCENT
            </button>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-mono2 text-[10px] tracking-[0.3em] text-[#ede8e0]/45">SCROLL TO IGNITE</span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-[#ede8e0]/20">
          <span className="animate-bob text-[#ede8e0]/70">↓</span>
        </span>
      </div>
    </section>
  )
}

/* ------------------------ kinetic / next-gen helpers --------------------- */

function Words({ text, className = '', delay = 0, stagger = 0.05 }) {
  const reduced = useReducedMotion()
  if (reduced) return <span className={className}>{text}</span>
  const words = String(text).split(' ')
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
  const child = {
    hidden: { y: '110%', opacity: 0, filter: 'blur(10px)' },
    show: { y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 0.95, ease: EASE } },
  }
  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden" style={{ verticalAlign: 'bottom' }}>
          <motion.span className="inline-block will-change-transform" variants={child}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

function Marquee({ items, baseSpeed = 55, dir = 1, velocityRef, className = '', style }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const x = useRef(0)
  useAnimationFrame((t, delta) => {
    if (reduced || !ref.current) return
    const dt = Math.min(delta, 50) / 1000
    const v = velocityRef ? velocityRef.current || 0 : 0
    x.current -= dir * (baseSpeed + Math.abs(v) * 0.6) * dt
    const half = ref.current.scrollWidth / 2
    if (half > 0) {
      if (x.current <= -half) x.current += half
      if (x.current > 0) x.current -= half
    }
    ref.current.style.transform = `translate3d(${x.current}px,0,0)`
  })
  const block = (key) => (
    <span key={key} className="inline-flex items-center">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center">
          <span>{it}</span>
          <span className="mx-6 md:mx-10 text-[#ff6a2c]">✦</span>
        </span>
      ))}
    </span>
  )
  return (
    <div className={'flex w-max whitespace-nowrap ' + className} ref={ref} style={style}>
      {block('a')}
      {block('b')}
    </div>
  )
}

function CountStat({ value, label }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12%' })
  const num = parseInt(String(value), 10)
  const hasNum = !Number.isNaN(num)
  const suffix = String(value).replace(/[0-9]/g, '')
  const pad = String(value).startsWith('0')
  const [disp, setDisp] = useState(hasNum && !reduced ? '0' : value)
  useEffect(() => {
    if (!hasNum || reduced) {
      setDisp(value)
      return
    }
    if (!inView) return
    let raf
    const start = performance.now()
    const dur = 1500
    const loop = (now) => {
      const p = Math.min(1, (now - start) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      const cur = Math.round(num * e)
      let s = String(cur)
      if (pad && cur < 10) s = '0' + s
      setDisp(s + suffix)
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [inView, hasNum, reduced, num, suffix, pad, value])
  return (
    <div ref={ref}>
      <div className="font-display font-extrabold tracking-[-0.03em] text-[#ede8e0]" style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)' }}>
        {disp}
      </div>
      <div className="mt-2 font-mono2 text-[10px] md:text-[11px] tracking-[0.2em] text-[#ede8e0]/45">{label}</div>
    </div>
  )
}

function Cursor() {
  const reduced = useReducedMotion()
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    setEnabled(true)
    const state = { x: -100, y: -100, tx: -100, ty: -100 }
    const move = (e) => {
      state.tx = e.clientX
      state.ty = e.clientY
      const t = e.target && e.target.closest ? e.target.closest('a,button,[data-cursor],input,textarea') : null
      setHover(!!t)
    }
    window.addEventListener('pointermove', move)
    document.documentElement.style.cursor = 'none'
    let raf
    const loop = () => {
      state.x += (state.tx - state.x) * 0.2
      state.y += (state.ty - state.y) * 0.2
      if (ringRef.current) ringRef.current.style.transform = `translate(${state.x}px, ${state.y}px) translate(-50%, -50%)`
      if (dotRef.current) dotRef.current.style.transform = `translate(${state.tx}px, ${state.ty}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
      document.documentElement.style.cursor = ''
    }
  }, [reduced])
  if (!enabled) return null
  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-[#ede8e0] mix-blend-difference"
        style={{ width: hover ? 64 : 26, height: hover ? 64 : 26, transition: 'width 0.32s cubic-bezier(0.16,1,0.3,1), height 0.32s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-[#ff6a2c]" />
    </>
  )
}

/* ------------------------------- chapters -------------------------------- */

function Chapter({ id, index, label, statement, accent, body, deliverables, align = 'left' }) {
  const right = align === 'right'
  const reduced = useReducedMotion()
  const sectionRef = useRef(null)
  const { scrollYProgress: sp } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const ghostY = useTransform(sp, [0, 1], reduced ? ['0%', '0%'] : ['26%', '-26%'])
  const headY = useTransform(sp, [0, 1], reduced ? [0, 0] : [48, -48])
  return (
    <section ref={sectionRef} id={id} className="relative min-h-[100svh] w-full flex items-center overflow-hidden">
      <motion.span
        aria-hidden
        style={{ y: ghostY }}
        className={'pointer-events-none absolute top-1/2 -translate-y-1/2 font-display font-extrabold leading-none text-[#ede8e0]/[0.04] select-none ' + (right ? 'left-[-3vw]' : 'right-[-3vw]')}
      >
        <span style={{ fontSize: 'clamp(15rem, 42vw, 46rem)' }}>{index}</span>
      </motion.span>

      <div className={'relative w-full max-w-[1500px] mx-auto px-5 md:px-8 flex ' + (right ? 'justify-end text-right' : 'justify-start')}>
        <motion.div style={{ y: headY }} className="w-full md:max-w-[44rem]">
          <Reveal>
            <div className={'flex items-baseline gap-4 ' + (right ? 'justify-end' : '')}>
              <span className="font-mono2 text-[12px] tracking-[0.2em] text-[#ff6a2c]">{index}</span>
              <span className="font-mono2 text-[11px] tracking-[0.24em] text-[#ede8e0]/45">{label}</span>
            </div>
          </Reveal>

          <h2
            className="mt-5 md:mt-7 font-display font-semibold leading-[0.98] tracking-[-0.03em] text-[#ede8e0]"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5.2rem)' }}
          >
            <Words text={statement} className="block" />
            <Words text={accent} className="block font-serif-it font-normal lowercase text-[#ff8a4c]" delay={0.12} />
          </h2>

          <Reveal delay={0.15} className={'mt-7 max-w-[34rem] ' + (right ? 'ml-auto' : '')}>
            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#ede8e0]/65">{body}</p>
          </Reveal>

          <Reveal delay={0.25} className="mt-9">
            <div className={'flex flex-wrap gap-x-3 gap-y-3 ' + (right ? 'justify-end' : '')}>
              {deliverables.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-[#ede8e0]/18 px-4 py-1.5 font-mono2 text-[11px] tracking-[0.14em] text-[#ede8e0]/75 transition-colors hover:border-[#ff6a2c] hover:text-[#ede8e0]"
                >
                  {d}
                </span>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------ apex moment ------------------------------ */

function ApexMoment() {
  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-end text-center px-6 pb-[14vh]">
      <Reveal>
        <span className="font-mono2 text-[11px] tracking-[0.34em] text-[#ff6a2c]">THE SUMMIT</span>
      </Reveal>
      <Reveal delay={0.1}>
        <p
          className="mt-5 font-serif-it text-[#ede8e0]/90"
          style={{ fontSize: 'clamp(1.4rem, 3.4vw, 2.6rem)', lineHeight: 1.2 }}
        >
          Everything we make aims here.
        </p>
      </Reveal>
    </section>
  )
}

/* -------------------------------- metrics -------------------------------- */

function Metrics() {
  const stats = [
    ['11', 'YEARS OF CRAFT'],
    ['140+', 'SYSTEMS SHIPPED'],
    ['09', 'INDUSTRIES SERVED'],
    ['∞', 'OBSESSION'],
  ]
  return (
    <section id="studio" className="relative w-full py-28 md:py-40">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8">
        <Reveal>
          <span className="font-mono2 text-[11px] tracking-[0.26em] text-[#ede8e0]/45">THE STUDIO</span>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            className="mt-6 max-w-[40rem] font-display font-medium leading-[1.05] tracking-[-0.02em] text-[#ede8e0]"
            style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.7rem)' }}
          >
            A small team of senior engineers and designers who would rather build one
            thing exceptionally than ten things adequately.
          </p>
        </Reveal>

        <div className="mt-16 md:mt-24">
          <Hairline />
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map(([n, l]) => (
              <div key={l} className="border-b border-r border-[#ede8e0]/12 last:border-r-0 md:[&:nth-child(4)]:border-r-0 px-1 py-9 md:py-12">
                <CountStat value={n} label={l} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- connect -------------------------------- */

function Connect() {
  const [form, setForm] = useState({ name: '', email: '', brief: '' })
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const reduced = useReducedMotion()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('done')
    } catch (err) {
      setStatus('error')
    }
  }

  const field =
    'w-full bg-transparent border-b border-[#ede8e0]/20 py-3 text-[#ede8e0] placeholder:text-[#ede8e0]/30 focus:border-[#ff6a2c] focus:outline-none transition-colors text-[16px]'

  return (
    <section id="connect" className="relative w-full py-28 md:py-40">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8 grid md:grid-cols-12 gap-12 md:gap-8">
        <div className="md:col-span-6">
          <Reveal>
            <span className="font-mono2 text-[11px] tracking-[0.26em] text-[#ff6a2c]">CONNECT</span>
          </Reveal>
          <h2
            className="mt-6 font-display font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-[#ede8e0]"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)' }}
          >
            <MaskLine>Begin</MaskLine>
            <MaskLine delay={0.07}>the</MaskLine>
            <MaskLine delay={0.14} className="font-serif-it lowercase font-normal text-[#ff8a4c]">
              ascent.
            </MaskLine>
          </h2>
          <Reveal delay={0.2} className="mt-10 space-y-3 font-mono2 text-[12px] tracking-[0.14em] text-[#ede8e0]/55">
            <p>STUDIO@APEXSOFTWORX.COM</p>
            <p>UTAH</p>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:pl-8">
          <Reveal delay={0.1}>
            <AnimatePresence mode="wait">
              {status === 'done' ? (
                <motion.div
                  key="done"
                  data-testid="inquiry-success"
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="flex h-full min-h-[18rem] flex-col justify-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#ff6a2c] text-[#08080a]">
                    <Check className="h-5 w-5" />
                  </span>
                  <p className="mt-6 font-display text-2xl text-[#ede8e0]">Transmission received.</p>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#ede8e0]/60">
                    Thank you, {form.name.split(' ')[0] || 'friend'}. We read every inquiry
                    ourselves and will reach out within two working days.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <label className="font-mono2 text-[10px] tracking-[0.2em] text-[#ede8e0]/40">01 — YOUR NAME</label>
                    <input
                      data-testid="inquiry-name"
                      className={field}
                      placeholder="Ada Lovelace"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-mono2 text-[10px] tracking-[0.2em] text-[#ede8e0]/40">02 — EMAIL</label>
                    <input
                      data-testid="inquiry-email"
                      className={field}
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-mono2 text-[10px] tracking-[0.2em] text-[#ede8e0]/40">03 — WHAT ARE YOU BUILDING?</label>
                    <textarea
                      data-testid="inquiry-brief"
                      rows={3}
                      className={field + ' resize-none'}
                      placeholder="A few lines about the system you have in mind…"
                      value={form.brief}
                      onChange={(e) => setForm({ ...form, brief: e.target.value })}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="font-mono2 text-[11px] tracking-[0.14em] text-[#ff6a2c]">
                      A NAME AND EMAIL ARE REQUIRED TO PROCEED.
                    </p>
                  )}

                  <button
                    data-testid="inquiry-submit"
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex items-center gap-3 rounded-full bg-[#ede8e0] px-7 py-4 font-mono2 text-[12px] tracking-[0.2em] text-[#08080a] transition-colors hover:bg-[#ff6a2c] disabled:opacity-60"
                  >
                    {status === 'sending' ? 'FORGING…' : 'SEND INQUIRY'}
                    <Plus className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- footer --------------------------------- */

function Footer({ onNavigate }) {
  return (
    <footer className="relative w-full border-t border-[#ede8e0]/12 px-5 md:px-8 py-12">
      <div className="max-w-[1500px] mx-auto">
        <div className="overflow-hidden">
          <motion.svg
            viewBox="0 0 1200 160"
            className="block w-full"
            initial={{ y: '14%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: EASE }}
            role="img"
            aria-label="ApexSoftworks"
          >
            <text
              x="0"
              y="130"
              textLength="1200"
              lengthAdjust="spacingAndGlyphs"
              fill="#ede8e0"
              fillOpacity="0.9"
              style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: '150px', letterSpacing: '-3px' }}
            >
              APEXSOFTWORKS
            </text>
          </motion.svg>
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono2 text-[11px] tracking-[0.16em] text-[#ede8e0]/45">
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <button onClick={() => onNavigate('#craft')} className="hover:text-[#ede8e0] transition-colors">CRAFT</button>
            <button onClick={() => onNavigate('#systems')} className="hover:text-[#ede8e0] transition-colors">SYSTEMS</button>
            <button onClick={() => onNavigate('#intelligence')} className="hover:text-[#ede8e0] transition-colors">INTELLIGENCE</button>
            <button onClick={() => onNavigate('#studio')} className="hover:text-[#ede8e0] transition-colors">STUDIO</button>
            <button onClick={() => onNavigate('#connect')} className="hover:text-[#ede8e0] transition-colors">CONNECT</button>
          </div>
          <p>© MMXXV APEXSOFTWORKS — FORGED IN UTAH</p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------ preloader -------------------------------- */

function Preloader({ onReveal, onComplete }) {
  const reduced = useReducedMotion()
  const [pct, setPct] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (reduced) {
      onReveal && onReveal()
      onComplete && onComplete()
      return
    }
    let raf
    const start = performance.now()
    const dur = 2600
    const loop = (now) => {
      const t = Math.min(1, (now - start) / dur)
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setPct(Math.round(e * 100))
      if (t < 1) raf = requestAnimationFrame(loop)
      else
        setTimeout(() => {
          setExiting(true)
          onReveal && onReveal()
        }, 380)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  if (reduced) return null

  const phases = ['IGNITING THE FORGE', 'SMELTING THE ORE', 'ALIGNING THE STRATA', 'FORGING FORM', 'FORGED']
  const phase = phases[Math.min(phases.length - 1, Math.floor(pct / 22))]

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#08080a]"
      initial={{ y: '0%' }}
      animate={exiting ? { y: '-100%' } : { y: '0%' }}
      transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (exiting) onComplete && onComplete()
      }}
    >
      {/* pulsing ember */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(50% 50% at 50% 48%, rgba(255,106,44,0.16), transparent 70%)' }}
      />

      <motion.div
        className="relative flex flex-col items-center gap-7 px-6 text-center"
        animate={exiting ? { opacity: 0, filter: 'blur(8px)', y: -16 } : { opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
          className="text-2xl leading-none text-[#ff6a2c]"
        >
          ✦
        </motion.div>

        <div className="font-mono2 text-[10px] md:text-[11px] tracking-[0.4em] text-[#ede8e0]/55">
          APEXSOFTWORKS — SOFTWARE STUDIO
        </div>

        <div
          className="font-display font-extrabold leading-none tabular-nums text-[#ede8e0]"
          style={{ fontSize: 'clamp(4.5rem, 18vw, 13rem)', letterSpacing: '-0.04em' }}
        >
          {String(pct).padStart(3, '0')}
        </div>

        <div className="w-[min(440px,82vw)]">
          <div className="relative h-px w-full overflow-hidden bg-[#ede8e0]/15">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff6a2c] to-[#ffb36b]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono2 text-[10px] tracking-[0.2em] text-[#ede8e0]/45">
            <span>{phase}</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
        </div>
      </motion.div>

      {/* horizon line that becomes the reveal edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6a2c] to-transparent" />
    </motion.div>
  )
}

/* --------------------------------- app ----------------------------------- */

export default function App() {
  const reduced = useReducedMotion()
  const progressRef = useRef(0)
  const lenisRef = useRef(null)
  const velRef = useRef(0)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const { scrollYProgress } = useScroll()
  const railScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const canvasOpacity = useTransform(scrollYProgress, [0.72, 0.9], [1, 0.16])

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v
    })
    return unsub
  }, [scrollYProgress])

  // lock scroll while the loader is up
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  useEffect(() => {
    if (reduced || loading) return
    let lenis
    let raf
    let mounted = true
    ;(async () => {
      const Lenis = (await import('lenis')).default
      if (!mounted) return
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.6 })
      lenisRef.current = lenis
      lenis.on('scroll', ({ velocity }) => {
        velRef.current = velocity || 0
      })
      if (typeof window !== 'undefined') window.__lenis = lenis
      const loop = (t) => {
        lenis.raf(t)
        velRef.current *= 0.9
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })()
    return () => {
      mounted = false
      cancelAnimationFrame(raf)
      if (lenis) lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const onNavigate = (target) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.4 })
    } else {
      const el = target === '#top' ? document.body : document.querySelector(target)
      if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    }
  }

  return (
    <main className="relative w-full bg-[#08080a] text-[#ede8e0]">
      {loading && (
        <Preloader onReveal={() => setStarted(true)} onComplete={() => setLoading(false)} />
      )}

      {/* fixed 3D world */}
      {!reduced ? (
        <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: canvasOpacity }}>
          <Scene progressRef={progressRef} velocityRef={velRef} />
        </motion.div>
      ) : (
        <div
          className="fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(255,106,44,0.14), transparent 70%), #08080a',
          }}
        />
      )}

      {/* grain + vignette */}
      <div className="grain-overlay" />
      <div
        className="pointer-events-none fixed inset-0 z-[57]"
        style={{ boxShadow: 'inset 0 0 220px 40px rgba(0,0,0,0.85)' }}
      />

      {/* scroll progress rail */}
      <motion.div
        style={{ scaleX: railScaleX, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 z-[62] h-[2px] bg-gradient-to-r from-[#ff6a2c] to-[#ffb36b]"
      />

      <Nav onNavigate={onNavigate} />
      {!reduced && <ScrollHUD progress={scrollYProgress} />}
      <Cursor />

      {/* content */}
      <div className="relative z-10">
        <Hero onNavigate={onNavigate} started={started} />

        <Chapter
          id="craft"
          index="01"
          label="CUSTOM SOFTWARE / PLATFORMS"
          statement="Every system begins"
          accent="as one deliberate decision."
          body="We architect bespoke software from first principles — internal platforms, complex tooling, and the load-bearing infrastructure a business is built on. No templates. No shortcuts. A foundation poured to outlast trends."
          deliverables={['Platforms', 'Internal Tools', 'APIs', 'Data Pipelines']}
          align="left"
        />

        <Chapter
          id="systems"
          index="02"
          label="WEB / PRODUCT ENGINEERING"
          statement="Then it composes"
          accent="resilient, alive at any load."
          body="From the decision grows a living product — web applications and design systems engineered to scale, to perform, and to feel inevitable in the hand. Interfaces that behave like the best object you own."
          deliverables={['Web Apps', 'Design Systems', 'Commerce', 'Real-time']}
          align="right"
        />

        <Chapter
          id="intelligence"
          index="03"
          label="AI-POWERED SYSTEMS"
          statement="And then it learns —"
          accent="intelligence in the grain."
          body="We weave AI into the structure of the product, not bolted on as a feature. Agents, retrieval, and automation that quietly do the heavy work — measured, safe, and tuned to the way your people actually operate."
          deliverables={['Agents', 'RAG / Retrieval', 'Automation', 'Evals']}
          align="left"
        />

        <section className="relative w-full overflow-hidden border-y border-[#ede8e0]/10 py-14 md:py-20">
          <Marquee
            velocityRef={velRef}
            items={['CUSTOM SOFTWARE', 'WEB PLATFORMS', 'AI SYSTEMS', 'DESIGN SYSTEMS', 'AUTOMATION', 'DATA PIPELINES']}
            className="font-display font-extrabold uppercase tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2rem, 7vw, 5.6rem)', color: 'transparent', WebkitTextStroke: '1px rgba(237,232,224,0.5)' }}
          />
        </section>

        <ApexMoment />
        <Metrics />
        <Connect />

        <section className="relative w-full overflow-hidden py-10 md:py-16">
          <Marquee
            velocityRef={velRef}
            dir={-1}
            baseSpeed={70}
            items={['AVAILABLE FOR NEW WORK', 'LET US FORGE SOMETHING INEVITABLE', 'BEGIN THE ASCENT']}
            className="font-serif-it text-[#ede8e0]/85"
            style={{ fontSize: 'clamp(1.6rem, 5vw, 3.6rem)' }}
          />
        </section>

        <Footer onNavigate={onNavigate} />
      </div>
    </main>
  )
}
