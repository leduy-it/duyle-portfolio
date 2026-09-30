'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTheme } from 'next-themes'
import * as THREE from 'three'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export default function BlogThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Read accent color from CSS var
    const accentRaw = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim()
    const [r, g, b] = accentRaw.split(' ').map((v) => parseInt(v, 10) / 255)
    const isLight = resolvedTheme === 'light' || document.documentElement.classList.contains('light')
    const accentColor = isLight ? new THREE.Color('#087c78') : new THREE.Color(r, g, b)

    // Renderer
    const dpr = Math.min(window.devicePixelRatio, 2)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h, false)

    // Scene / Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(0, 0, 4)

    // Wireframe torus knot
    const geom = new THREE.TorusKnotGeometry(1, 0.32, 128, 16, 2, 3)
    const mat = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.85 : 0.55,
    })
    const mesh = new THREE.Mesh(geom, mat)
    scene.add(mesh)

    // Particle dust
    const particleCount = 180
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
      velocities[i] = 0.002 + Math.random() * 0.003
    }
    const pGeom = new THREE.BufferGeometry()
    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat = new THREE.PointsMaterial({
      color: accentColor,
      size: 0.03,
      transparent: true,
      opacity: isLight ? 0.6 : 0.45,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(pGeom, pMat)
    scene.add(particles)

    let rafId = 0

    const animate = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(animate)
        return
      }

      mesh.rotation.x += 0.003
      mesh.rotation.y += 0.005

      // drift particles upward, wrap around
      const pos = pGeom.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < particleCount; i++) {
        pos.array[i * 3 + 1] += velocities[i]
        if (pos.array[i * 3 + 1] > 3) {
          pos.array[i * 3 + 1] = -3
        }
      }
      pos.needsUpdate = true

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    if (prefersReducedMotion) renderer.render(scene, camera)
    else rafId = requestAnimationFrame(animate)

    // Resize handler
    const onResize = () => {
      const nw = canvas.clientWidth
      const nh = canvas.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh, false)
      if (prefersReducedMotion) renderer.render(scene, camera)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      geom.dispose()
      mat.dispose()
      pGeom.dispose()
      pMat.dispose()
      renderer.dispose()
    }
  }, [resolvedTheme])

  return (
    <motion.canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block' }}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        shouldReduceMotion
          ? undefined
          : {
              duration: 0.7,
              ease: EASE_OUT_EXPO,
            }
      }
    />
  )
}
