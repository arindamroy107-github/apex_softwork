'use client'

import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeShapes } from './shapes'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
const gauss = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s))

// progress positions where each shape is fully formed (aligned to DOM section centers)
const KEYS = [0, 0.14, 0.28, 0.42, 0.56, 0.68, 0.84, 1.0]

const vert = `
  uniform float uTime;
  uniform float uBlend;
  uniform float uSize;
  uniform float uDpr;
  attribute vec3 aPos0;
  attribute vec3 aPos1;
  attribute float aSeed;
  attribute float aSize;
  attribute float aCmix;
  varying float vSeed;
  varying float vCmix;
  varying float vView;
  void main() {
    vec3 p = mix(aPos0, aPos1, uBlend);
    float s = aSeed * 6.2831853;
    p.x += sin(uTime * 0.40 + s) * 0.06;
    p.y += cos(uTime * 0.33 + s * 1.3) * 0.06;
    p.z += sin(uTime * 0.45 + s * 0.7) * 0.06;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = max(0.001, -mv.z);
    gl_PointSize = clamp(uSize * aSize * (1.0 / dist) * uDpr, 1.0, 16.0);
    vSeed = aSeed;
    vCmix = aCmix;
    vView = dist;
  }
`

const frag = `
  precision highp float;
  uniform vec3 uIvory;
  uniform vec3 uAmberCol;
  uniform float uAmber;
  uniform float uTime;
  uniform float uOpacity;
  varying float vSeed;
  varying float vCmix;
  varying float vView;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    alpha = pow(alpha, 1.6);
    float tw = 0.65 + 0.35 * sin(uTime * 1.6 + vSeed * 42.0);
    float amberMix = smoothstep(0.45, 1.0, vCmix) * uAmber;
    vec3 col = mix(uIvory, uAmberCol, amberMix);
    col += amberMix * 0.15;
    float depthFade = clamp(1.0 - (vView - 7.0) / 34.0, 0.22, 1.0);
    gl_FragColor = vec4(col, alpha * tw * uOpacity * 0.5 * depthFade);
  }
`

export default function ParticleField({ progressRef, count }) {
  const pts = useRef()
  const lastSeg = useRef(-1)
  const gl = useThree((s) => s.gl)

  const { geometry, material, shapes } = useMemo(() => {
    const base = makeShapes(count)
    const shapes = [...base, base[base.length - 1]] // hold galaxy through the finale
    const g = new THREE.BufferGeometry()
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)
    const cmix = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random()
      sizes[i] = 0.55 + Math.random() * 1.8
      cmix[i] = Math.pow(Math.random(), 1.8)
    }
    g.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3))
    g.setAttribute('aPos0', new THREE.BufferAttribute(shapes[0].slice(), 3))
    g.setAttribute('aPos1', new THREE.BufferAttribute(shapes[1].slice(), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aCmix', new THREE.BufferAttribute(cmix, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBlend: { value: 0 },
        uSize: { value: 48 },
        uAmber: { value: 0.1 },
        uOpacity: { value: 0 },
        uDpr: { value: 1 },
        uIvory: { value: new THREE.Color('#ede8e0') },
        uAmberCol: { value: new THREE.Color('#ff6a2c') },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry: g, material: m, shapes }
  }, [count])

  useEffect(() => {
    material.uniforms.uDpr.value = gl.getPixelRatio()
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material, gl])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const p = clamp(progressRef.current || 0, 0, 1)
    let seg = 0
    while (seg < KEYS.length - 2 && p > KEYS[seg + 1]) seg++
    const span = KEYS[seg + 1] - KEYS[seg] || 1
    const lt = clamp((p - KEYS[seg]) / span, 0, 1)
    if (seg !== lastSeg.current) {
      geometry.attributes.aPos0.array.set(shapes[seg])
      geometry.attributes.aPos0.needsUpdate = true
      geometry.attributes.aPos1.array.set(shapes[seg + 1])
      geometry.attributes.aPos1.needsUpdate = true
      lastSeg.current = seg
    }
    const u = material.uniforms
    u.uBlend.value = easeInOut(lt)
    u.uTime.value = t
    u.uOpacity.value += (1 - u.uOpacity.value) * Math.min(1, dt * 1.4)
    const amber = clamp(Math.max(gauss(p, 0.14, 0.05), gauss(p, 0.56, 0.07), gauss(p, 0.68, 0.06)) * 0.95 + 0.06, 0, 1)
    u.uAmber.value += (amber - u.uAmber.value) * 0.06
    const o = pts.current
    if (o) {
      o.rotation.y = t * 0.022 + p * 0.35
      o.rotation.x = Math.sin(p * Math.PI) * 0.1
      const sc = 1 + Math.sin(t * 0.4) * 0.01
      o.scale.setScalar(sc)
    }
  })

  return <points ref={pts} geometry={geometry} material={material} frustumCulled={false} />
}
