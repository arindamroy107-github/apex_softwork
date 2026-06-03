// Particle shape generators. Each returns Float32Array(count * 3).
// Every shape uses the same `count` so morphing is a 1:1 interpolation.

const TAU = Math.PI * 2
const rand = () => Math.random()

export function nebula(count) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = rand(), v = rand()
    const theta = u * TAU
    const phi = Math.acos(2 * v - 1)
    const r = 6.8 * Math.cbrt(rand()) * (0.55 + 0.45 * rand())
    out[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.15
    out[i * 3 + 1] = r * Math.cos(phi) * 0.9
    out[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 1.05
  }
  return out
}

export function sphereShape(count) {
  const out = new Float32Array(count * 3)
  const R = 5.3
  const ga = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const rad = Math.sqrt(Math.max(0, 1 - y * y))
    const th = ga * i
    const jitter = 0.97 + 0.06 * rand()
    out[i * 3] = Math.cos(th) * rad * R * jitter
    out[i * 3 + 1] = y * R * jitter
    out[i * 3 + 2] = Math.sin(th) * rad * R * jitter
  }
  return out
}

export function monolith(count) {
  const out = new Float32Array(count * 3)
  const H = 12.5, half = H / 2, facets = 6
  for (let i = 0; i < count; i++) {
    const yy = Math.pow(rand(), 0.85)
    const y = -half + yy * H
    const taper = 1 - yy * 0.82
    const baseR = 2.8 * taper + 0.05
    const fa = Math.floor(rand() * facets) / facets * TAU + (rand() - 0.5) * 0.05
    const rr = baseR * (0.92 + 0.08 * Math.sin(fa * 6 + yy * 9))
    if (rand() < 0.22) {
      const k = rand()
      out[i * 3] = Math.cos(fa) * rr * k
      out[i * 3 + 2] = Math.sin(fa) * rr * k
    } else {
      out[i * 3] = Math.cos(fa) * rr
      out[i * 3 + 2] = Math.sin(fa) * rr
    }
    out[i * 3 + 1] = y
  }
  return out
}

export function torusKnot(count) {
  const out = new Float32Array(count * 3)
  const S = 1.55, tube = 0.5, p = 2, q = 3
  for (let i = 0; i < count; i++) {
    const u = rand() * TAU
    const r = Math.cos(q * u) + 2.2
    const cx = r * Math.cos(p * u)
    const cy = r * Math.sin(p * u)
    const cz = -Math.sin(q * u)
    const a = rand() * TAU
    const b = Math.acos(2 * rand() - 1)
    const rr = Math.cbrt(rand()) * tube
    const ox = rr * Math.sin(b) * Math.cos(a)
    const oy = rr * Math.sin(b) * Math.sin(a)
    const oz = rr * Math.cos(b)
    out[i * 3] = (cx + ox) * S
    out[i * 3 + 1] = (cy + oy) * S
    out[i * 3 + 2] = (cz + oz) * S
  }
  return out
}

export function textShape(count, text) {
  const out = new Float32Array(count * 3)
  if (typeof document === 'undefined') return nebula(count)
  const w = 1024, h = 512
  const cv = document.createElement('canvas')
  cv.width = w; cv.height = h
  const ctx = cv.getContext('2d')
  if (!ctx) return nebula(count)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fff'
  ctx.font = "900 280px 'Archivo', Arial, sans-serif"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2 + 10)
  let data
  try { data = ctx.getImageData(0, 0, w, h).data } catch (e) { return nebula(count) }
  const pts = []
  for (let y = 0; y < h; y += 3) {
    for (let x = 0; x < w; x += 3) {
      if (data[(y * w + x) * 4] > 120) pts.push([x, y])
    }
  }
  if (pts.length === 0) return nebula(count)
  const planeW = 15
  const sx = planeW / w
  const sy = (planeW * (h / w)) / h
  for (let i = 0; i < count; i++) {
    const pt = pts[(rand() * pts.length) | 0]
    out[i * 3] = (pt[0] - w / 2) * sx + (rand() - 0.5) * 0.05
    out[i * 3 + 1] = -(pt[1] - h / 2) * sy + (rand() - 0.5) * 0.05
    out[i * 3 + 2] = (rand() - 0.5) * 0.5
  }
  return out
}

export function galaxy(count) {
  const out = new Float32Array(count * 3)
  const arms = 5, R = 10
  for (let i = 0; i < count; i++) {
    const t = Math.pow(rand(), 0.55)
    const rad = t * R + 0.2
    const arm = Math.floor(rand() * arms) / arms * TAU
    const spin = rad * 0.5
    const spread = (rand() - 0.5) * (0.6 + (1 - t) * 0.8)
    const ang = arm + spin + spread
    out[i * 3] = Math.cos(ang) * rad
    out[i * 3 + 1] = Math.sin(ang) * rad
    out[i * 3 + 2] = (rand() - 0.5) * (0.8 + (1 - t) * 2.2)
  }
  return out
}

// A layered Utah canyon: terraced mesa strata carved by a meandering river gorge.
// Baked with a forward tilt so it reads as an aerial fly-through. Nods to the
// studio's red-rock home (Orem, Utah).
export function utahCanyon(count) {
  const out = new Float32Array(count * 3)
  const W = 22, D = 20
  const tilt = 0.6
  const cs = Math.cos(tilt), sn = Math.sin(tilt)

  const strata = (x, z) => {
    let h = 0
    h += Math.sin(x * 0.42 + 0.6) * Math.cos(z * 0.36) * 1.5
    h += Math.sin(x * 0.9 - z * 0.5) * 0.7
    h += Math.cos(x * 1.7 + z * 0.32) * 0.35
    h += Math.sin((x + z) * 1.3) * 0.18
    return h
  }

  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * W
    const z = (rand() - 0.5) * D
    let h = strata(x, z)
    // terrace into mesa steps (Utah rock strata)
    const steps = 6
    h = Math.round(h * steps) / steps
    let y = h * 2.4 + 2.2
    // carve a meandering river gorge down the middle
    const center = Math.sin(z * 0.42) * 4.2 + Math.sin(z * 0.16) * 2.0
    const dx = x - center
    y -= Math.exp(-(dx * dx) / 7.0) * 9.0
    // sharpen the inner canyon walls
    y -= Math.exp(-(dx * dx) / 1.3) * 1.6
    y -= 1.0
    // bake a forward tilt — aerial fly-through perspective (rotate about X)
    const yt = y * cs - z * sn
    const zt = y * sn + z * cs
    out[i * 3] = x
    out[i * 3 + 1] = yt
    out[i * 3 + 2] = zt
  }
  return out
}

export function makeShapes(count) {
  return [
    nebula(count),
    monolith(count),
    sphereShape(count),
    torusKnot(count),
    utahCanyon(count),
    textShape(count, 'APEX'),
    galaxy(count),
  ]
}
