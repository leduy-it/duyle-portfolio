'use client'

import { useEffect, useRef } from 'react'
import { withAlpha } from '@/lib/motion/color'

interface GameOfLifeBackgroundProps {
  color: string
  active?: boolean
  mobileLite?: boolean
  pauseWhenHidden?: boolean
  reducedMotion?: boolean
}

interface Marker {
  x: number
  y: number
  phase: number
  speed: number
}

export function GameOfLifeBackground({
  color,
  active = false,
  mobileLite = false,
  pauseWhenHidden = true,
  reducedMotion = false,
}: GameOfLifeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !color) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gridSize = mobileLite ? 28 : 36
    const dotRadius = 0.7
    const sweepDuration = 14_000
    const noiseInterval = 1000 / (mobileLite ? 24 : 30)
    const markerCount = mobileLite ? 4 : 8

    let width = 0
    let height = 0
    let dpr = 1
    let markers: Marker[] = []
    let raf = 0
    let lastFrame = 0
    const startTs = performance.now()

    const seedMarkers = () => {
      markers = Array.from({ length: markerCount }, () => ({
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      }))
    }

    const resize = () => {
      width = document.documentElement.clientWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seedMarkers()
      if (reducedMotion) {
        ctx.clearRect(0, 0, width, height)
        drawDotGrid()
        drawCorners()
      }
    }

    const drawDotGrid = () => {
      const baseAlpha = active ? 0.16 : 0.12
      ctx.fillStyle = withAlpha(color, baseAlpha)
      const offset = gridSize / 2
      for (let y = offset; y < height; y += gridSize) {
        for (let x = offset; x < width; x += gridSize) {
          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const drawSweep = (ts: number) => {
      const t = ((ts - startTs) % sweepDuration) / sweepDuration
      const beamY = t * (height + 240) - 120
      const grad = ctx.createLinearGradient(0, beamY - 80, 0, beamY + 80)
      grad.addColorStop(0, withAlpha(color, 0))
      grad.addColorStop(0.5, withAlpha(color, active ? 0.1 : 0.07))
      grad.addColorStop(1, withAlpha(color, 0))
      ctx.fillStyle = grad
      ctx.fillRect(0, beamY - 80, width, 160)

      ctx.strokeStyle = withAlpha(color, active ? 0.32 : 0.22)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, beamY)
      ctx.lineTo(width, beamY)
      ctx.stroke()
    }

    const drawCorners = () => {
      const inset = 24
      const len = 14
      ctx.strokeStyle = withAlpha(color, active ? 0.28 : 0.2)
      ctx.lineWidth = 1
      const corners: [number, number, number, number][] = [
        [inset, inset, inset + len, inset],
        [inset, inset, inset, inset + len],
        [width - inset, inset, width - inset - len, inset],
        [width - inset, inset, width - inset, inset + len],
        [inset, height - inset, inset + len, height - inset],
        [inset, height - inset, inset, height - inset - len],
        [width - inset, height - inset, width - inset - len, height - inset],
        [width - inset, height - inset, width - inset, height - inset - len],
      ]
      ctx.beginPath()
      for (const [x1, y1, x2, y2] of corners) {
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
      }
      ctx.stroke()
    }

    const drawMarkers = (ts: number) => {
      ctx.font = `600 11px ${getComputedStyle(document.body).fontFamily || 'monospace'}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      for (const m of markers) {
        const blink = (Math.sin((ts / 1000) * m.speed + m.phase) + 1) / 2
        const alpha = 0.08 + blink * (active ? 0.32 : 0.22)
        ctx.fillStyle = withAlpha(color, alpha)
        ctx.fillRect(m.x, m.y, 6, 1)
        ctx.fillRect(m.x, m.y, 1, 6)
      }
    }

    const step = (ts: number) => {
      if (pauseWhenHidden && document.hidden) return
      raf = window.requestAnimationFrame(step)
      if (ts - lastFrame < noiseInterval) return
      lastFrame = ts
      ctx.clearRect(0, 0, width, height)
      drawDotGrid()
      drawSweep(ts)
      drawCorners()
      drawMarkers(ts)
    }

    resize()
    window.addEventListener('resize', resize)
    if (!reducedMotion) raf = window.requestAnimationFrame(step)
    function visibility() {
      window.cancelAnimationFrame(raf)
      if (!document.hidden && !reducedMotion) raf = window.requestAnimationFrame(step)
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [active, color, mobileLite, pauseWhenHidden, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}
