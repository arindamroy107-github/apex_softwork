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

function Hero({ onNavigate }) {
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
          <p>SALT LAKE CITY</p>
          <p className="mt-1 text-[#ede8e0]/35">UTAH, USA</p>
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
          <MaskLine mount delay={0.45}>Forged,</MaskLine>
          <MaskLine mount delay={0.56} className="font-serif-it lowercase font-normal tracking-[-0.01em] text-[#ff8a4c]">
            not&nbsp;assembled.
          </MaskLine>
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

/* ------------------------------- chapters -------------------------------- */

function Chapter({ id, index, label, statement, accent, body, deliverables, align = 'left' }) {
  const right = align === 'right'
  return (
    <section id={id} className="relative min-h-[100svh] w-full flex items-center">
      <div className={'w-full max-w-[1500px] mx-auto px-5 md:px-8 flex ' + (right ? 'justify-end text-right' : 'justify-start')}>
        <div className="w-full md:max-w-[44rem]">
          <Reveal>
            <div className={'flex items-baseline gap-4 ' + (right ? 'justify-end' : '')}>
              <span className="font-mono2 text-[12px] tracking-[0.2em] text-[#ff6a2c]">{index}</span>
              <span className="font-mono2 text-[11px] tracking-[0.24em] text-[#ede8e0]/45">{label}</span>
            </div>
          </Reveal>

          <h2
            className="mt-5 md:mt-7 font-display font-semibold leading-[0.95] tracking-[-0.03em] text-[#ede8e0]"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5.2rem)' }}
          >
            <MaskLine>{statement}</MaskLine>
            <MaskLine delay={0.08} className="font-serif-it font-normal lowercase text-[#ff8a4c]">
              {accent}
            </MaskLine>
          </h2>

          <Reveal delay={0.15} className={'mt-7 max-w-[34rem] ' + (right ? 'ml-auto' : '')}>
            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#ede8e0]/65">{body}</p>
          </Reveal>

          <Reveal delay={0.25} className="mt-9">
            <div className={'flex flex-wrap gap-x-3 gap-y-3 ' + (right ? 'justify-end' : '')}>
              {deliverables.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-[#ede8e0]/18 px-4 py-1.5 font-mono2 text-[11px] tracking-[0.14em] text-[#ede8e0]/75"
                >
                  {d}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
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
            {stats.map(([n, l], i) => (
              <Reveal key={l} delay={i * 0.08} className="border-b border-r border-[#ede8e0]/12 last:border-r-0 md:[&:nth-child(4)]:border-r-0 px-1 py-9 md:py-12">
                <div className="font-display font-extrabold tracking-[-0.03em] text-[#ede8e0]" style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)' }}>
                  {n}
                </div>
                <div className="mt-2 font-mono2 text-[10px] md:text-[11px] tracking-[0.2em] text-[#ede8e0]/45">{l}</div>
              </Reveal>
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
            <p>STUDIO@APEXSOFTWORKS.DEV</p>
            <p>+1 (000) 000-0000</p>
            <p>SALT LAKE CITY · UTAH</p>
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
          <h3
            className="font-display font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-[#ede8e0]/90"
            style={{ fontSize: 'clamp(2.6rem, 13vw, 13rem)' }}
          >
            APEXSOFTWORKS
          </h3>
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

/* --------------------------------- app ----------------------------------- */

export default function App() {
  const reduced = useReducedMotion()
  const progressRef = useRef(0)
  const lenisRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const railScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const canvasOpacity = useTransform(scrollYProgress, [0.72, 0.9], [1, 0.16])

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v
    })
    return unsub
  }, [scrollYProgress])

  useEffect(() => {
    if (reduced) return
    let lenis
    let raf
    let mounted = true
    ;(async () => {
      const Lenis = (await import('lenis')).default
      if (!mounted) return
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.6 })
      lenisRef.current = lenis
      if (typeof window !== 'undefined') window.__lenis = lenis
      const loop = (t) => {
        lenis.raf(t)
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
      {/* fixed 3D world */}
      {!reduced ? (
        <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: canvasOpacity }}>
          <Scene progressRef={progressRef} />
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

      {/* content */}
      <div className="relative z-10">
        <Hero onNavigate={onNavigate} />

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

        <ApexMoment />
        <Metrics />
        <Connect />
        <Footer onNavigate={onNavigate} />
      </div>
    </main>
  )
}
