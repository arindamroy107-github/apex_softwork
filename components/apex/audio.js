// Generative ambient "forge hum" built entirely with the Web Audio API.
// No external assets. Muted by default; intensity swells near the APEX summit.

export class ForgeAudio {
  constructor() {
    this.ctx = null
    this.started = false
    this.intensity = 0
  }

  init() {
    if (this.ctx) return
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    this.ctx = ctx

    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)

    // warm lowpass
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 300
    this.filter.Q.value = 0.7
    this.filter.connect(this.master)

    // drone stack (low, detuned)
    const freqs = [36.71, 55, 73.42, 110]
    this.oscs = []
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator()
      o.type = i === 0 ? 'sine' : 'triangle'
      o.frequency.value = f
      o.detune.value = (Math.random() - 0.5) * 9
      const g = ctx.createGain()
      g.gain.value = i === 0 ? 0.5 : 0.22 / i
      o.connect(g)
      g.connect(this.filter)
      o.start()
      this.oscs.push({ o, g })
    })

    // shimmer that rises at the summit
    this.shimmer = ctx.createOscillator()
    this.shimmer.type = 'sine'
    this.shimmer.frequency.value = 220
    this.shimmerGain = ctx.createGain()
    this.shimmerGain.gain.value = 0
    this.shimmer.connect(this.shimmerGain)
    this.shimmerGain.connect(this.filter)
    this.shimmer.start()

    // brown-ish noise (forge air)
    const len = 2 * ctx.sampleRate
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    this.noise = ctx.createBufferSource()
    this.noise.buffer = buf
    this.noise.loop = true
    this.noiseFilter = ctx.createBiquadFilter()
    this.noiseFilter.type = 'bandpass'
    this.noiseFilter.frequency.value = 480
    this.noiseFilter.Q.value = 0.5
    this.noiseGain = ctx.createGain()
    this.noiseGain.gain.value = 0.05
    this.noise.connect(this.noiseFilter)
    this.noiseFilter.connect(this.noiseGain)
    this.noiseGain.connect(this.master)
    this.noise.start()

    // slow LFO breathing on the cutoff
    this.lfo = ctx.createOscillator()
    this.lfo.frequency.value = 0.07
    this.lfoGain = ctx.createGain()
    this.lfoGain.gain.value = 110
    this.lfo.connect(this.lfoGain)
    this.lfoGain.connect(this.filter.frequency)
    this.lfo.start()
  }

  async start() {
    this.init()
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch (e) {
        /* ignore */
      }
    }
    this.started = true
    this.setIntensity(this.intensity)
  }

  stop() {
    if (!this.ctx) return
    this.started = false
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(0, t, 0.3)
  }

  setIntensity(x) {
    this.intensity = x
    if (!this.ctx || !this.started) return
    const t = this.ctx.currentTime
    const base = 0.05
    const peak = 0.15
    const g = base + (peak - base) * x
    this.master.gain.setTargetAtTime(g, t, 0.25)
    this.filter.frequency.setTargetAtTime(260 + x * 950, t, 0.3)
    this.shimmerGain.gain.setTargetAtTime(x * x * 0.05, t, 0.35)
    this.noiseGain.gain.setTargetAtTime(0.04 + x * 0.05, t, 0.4)
  }

  dispose() {
    try {
      this.noise && this.noise.stop()
      this.oscs && this.oscs.forEach(({ o }) => o.stop())
      this.shimmer && this.shimmer.stop()
      this.lfo && this.lfo.stop()
      this.ctx && this.ctx.close()
    } catch (e) {
      /* ignore */
    }
    this.ctx = null
    this.started = false
  }
}
