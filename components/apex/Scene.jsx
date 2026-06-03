'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useRef, useEffect, useState, Suspense } from 'react'
import ParticleField from './ParticleField'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function Rig({ pointerRef }) {
  const camera = useThree((s) => s.camera)
  useFrame(() => {
    const px = pointerRef.current.x
    const py = pointerRef.current.y
    camera.position.x += (px * 2.4 - camera.position.x) * 0.045
    camera.position.y += (-py * 1.6 - camera.position.y) * 0.045
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene({ progressRef, velocityRef }) {
  const pointerRef = useRef({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(max-width: 767px)')
    const up = () => setIsMobile(m.matches)
    up()
    m.addEventListener('change', up)
    const onMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onOrient = (e) => {
      if (e.gamma != null) {
        pointerRef.current.x = clamp(e.gamma / 45, -1, 1)
        pointerRef.current.y = clamp((e.beta - 45) / 45, -1, 1)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onOrient, { passive: true })
    return () => {
      m.removeEventListener('change', up)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  const count = isMobile ? 12000 : 28000

  return (
    <Canvas
      dpr={[1, isMobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 16], fov: 55 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#08080a']} />
      <fog attach="fog" args={['#08080a', 18, 46]} />
      <Suspense fallback={null}>
        <ParticleField key={count} progressRef={progressRef} count={count} />
      </Suspense>
      <Rig pointerRef={pointerRef} />
      <EffectComposer disableNormalPass>
        <Bloom
          intensity={isMobile ? 0.72 : 1.05}
          luminanceThreshold={0.08}
          luminanceSmoothing={0.22}
          mipmapBlur
          radius={0.72}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
      </EffectComposer>
    </Canvas>
  )
}
