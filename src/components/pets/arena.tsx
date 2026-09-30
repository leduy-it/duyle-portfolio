'use client'
import { useEffect, useRef, useState } from 'react'
import { PETS } from '@/data/pets/catalog'
import { createArena, stepArena, type ArenaState } from '@/lib/pets/arena-engine'
import type { OwnedPet } from '@/lib/pets/save'
import { usePetSave } from '@/lib/pets/pet-save-provider'
import { awardArenaWin } from '@/lib/pets/progression'
import { useHomeMotionPreferences } from '@/components/home/home-motion'
import { palette, pixels } from './pixel-art'
import { petAppearance } from '@/lib/pets/appearance'
import { motionCatalog } from './motion-pet'

function draw(
  ctx: CanvasRenderingContext2D,
  s: ArenaState,
  still: boolean,
  bunny?: HTMLImageElement,
  scenery?: HTMLImageElement,
  walking?: HTMLImageElement
) {
  ctx.imageSmoothingEnabled = false
  if (scenery?.complete && scenery.naturalWidth) {
    ctx.drawImage(scenery, 0, 0, 640, 360)
  } else {
  ctx.fillStyle = '#254b45'
  ctx.fillRect(0, 0, 640, 360)
  for (let x = 0; x < 640; x += 32)
    for (let y = 0; y < 360; y += 32) {
      ctx.fillStyle = (x / 32 + y / 32) % 2 ? '#2b5148' : '#2e554b'
      ctx.fillRect(x + 1, y + 1, 30, 30)
      if ((x + y) % 96 === 0) {
        ctx.fillStyle = '#496e53'
        ctx.fillRect(x + 7, y + 10, 3, 4)
        ctx.fillRect(x + 11, y + 8, 2, 5)
      }
    }
  }
  ctx.strokeStyle = '#a9c77b55'
  ctx.lineWidth = 2
  ctx.strokeRect(13, 13, 614, 334)
  const bob = still ? 0 : Math.sin(s.time * 8) * 2
  for (const e of s.enemies) {
    const x = Math.round(e.x),
      y = Math.round(e.y + bob)
    ctx.fillStyle = '#132f3a55'
    ctx.fillRect(x - 14, y + 9, 28, 4)
    ctx.fillStyle = e.flash
      ? '#fff4d6'
      : e.kind === 'brute'
        ? '#dc9cab'
        : e.kind === 'wisp'
          ? '#e1cd85'
          : '#b8a4d8'
    ctx.fillRect(x - 13, y - 9, 26, 18)
    ctx.fillRect(x - 9, y - 15, 18, 8)
    ctx.fillRect(x - 9, y + 7, 6, 5)
    ctx.fillRect(x + 4, y + 7, 6, 5)
    ctx.fillStyle = '#39304e'
    ctx.fillRect(x - 7, y - 5, 3, 4)
    ctx.fillRect(x + 5, y - 5, 3, 4)
    ctx.fillRect(x - 2, y + 2, 5, 2)
  }
  for (const p of s.projectiles) {
    ctx.fillStyle = '#fff1b6'
    ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8)
    ctx.fillStyle = '#ddae72'
    ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 4, 4)
  }
  const x = Math.round(s.player.x),
    y = Math.round(s.player.y)
  if (s.slash > 0) {
    ctx.strokeStyle = `rgba(237,221,153,${s.slash / 0.22})`
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(x, y, 61 * (1 - s.slash / 0.3), -0.5, 5.5)
    ctx.stroke()
  }
  ctx.globalAlpha =
    s.player.invincible > 0 && !still ? 0.55 + 0.45 * Math.abs(Math.sin(s.time * 20)) : 1
  if (walking?.complete && walking.naturalWidth && s.slash <= 0 && s.status === 'running') {
    const frame = still ? 0 : Math.floor(s.time / .12) % 8
    ctx.drawImage(walking, frame * 192, 0, 192, 208, x - 30, y - 43, 60, 65)
  } else if (bunny?.complete && bunny.naturalWidth) {
    const row = s.slash > 0 ? 4 : s.status === 'lost' ? 5 : 0
    const frame = still ? 0 : Math.floor(s.time * 7) % (row === 4 ? 5 : row === 5 ? 8 : 6)
    ctx.drawImage(bunny, frame * 192, row * 208, 192, 208, x - 30, y - 43, 60, 65)
  } else {
    const colors = palette(s.species)
    for (const p of pixels(s.species)) {
      ctx.fillStyle = colors[p.key] || colors.A
      ctx.fillRect(x - 20 + p.x * 2, y - 29 + p.y * 2 + bob, 2, 2)
    }
  }
  ctx.globalAlpha = 1
}
export function PetArena({ pet, vi }: { pet: OwnedPet; vi: boolean }) {
  const { update } = usePetSave(),
    { prefersReducedMotion } = useHomeMotionPreferences()
  const canvas = useRef<HTMLCanvasElement>(null),
    root = useRef<HTMLDivElement>(null)
  const game = useRef(createArena(pet.species, pet.stage)),
    keys = useRef(new Set<string>()),
    run = useRef(''),
    claimed = useRef(false)
  const [hud, setHud] = useState(() => createArena(pet.species, pet.stage)),
    [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const updateRef = useRef(update)
  useEffect(() => {
    updateRef.current = update
  }, [update])
  function pause(value: boolean) {
    pausedRef.current = value
    setPaused(value)
    keys.current.clear()
  }
  function start() {
    game.current = {
      ...createArena(pet.species, pet.stage, pet.xp),
      status: 'running',
    }
    run.current = crypto.randomUUID()
    claimed.current = false
    pause(false)
    setHud(game.current)
    canvas.current?.focus()
  }
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const bunny = new Image()
    const appearance = petAppearance(pet.species, pet.stage)
    bunny.src = `/pets/hatch-pet-plus/${appearance.pet}/${appearance.file}`
    const scenery = new Image()
    scenery.src = '/pets/pixel-arena-v2.webp'
    const walks = new Map<string, HTMLImageElement>()
    const heldKeys = keys.current
    let frame = 0,
      previous = 0,
      accumulator = 0,
      lastHud = 0,
      inView = false
    function loop(time: number) {
      const dt = previous ? Math.min(0.1, (time - previous) / 1000) : 0
      previous = time
      if (!pausedRef.current && game.current.status === 'running') {
        const k = keys.current
        accumulator += dt
        const input = {
          x: Number(k.has('ArrowRight') || k.has('d')) - Number(k.has('ArrowLeft') || k.has('a')),
          y: Number(k.has('ArrowDown') || k.has('s')) - Number(k.has('ArrowUp') || k.has('w')),
          attack: k.has(' '),
        }
        while (accumulator >= 1 / 60) {
          game.current = stepArena(game.current, input, 1 / 60)
          accumulator -= 1 / 60
        }
        if (game.current.status === 'won' && !claimed.current) {
          claimed.current = true
          updateRef.current((s) => awardArenaWin(s, pet.id, run.current))
        }
      } else accumulator = 0
      const dx = Number(keys.current.has('ArrowRight') || keys.current.has('d')) - Number(keys.current.has('ArrowLeft') || keys.current.has('a'))
      const dy = Number(keys.current.has('ArrowDown') || keys.current.has('s')) - Number(keys.current.has('ArrowUp') || keys.current.has('w'))
      const direction = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'][(Math.round(Math.atan2(dx, -dy) / (Math.PI / 4)) + 8) % 8]
      const clip = motionCatalog[appearance.pet]?.[`walk-${direction}`]
      let walking: HTMLImageElement | undefined
      if ((dx || dy) && clip && !pausedRef.current) {
        if (!walks.has(direction)) {
          const sprite = new Image()
          sprite.src = `/pets/hatch-pet-plus/${appearance.pet}/motion/${clip.file}`
          walks.set(direction, sprite)
        }
        walking = walks.get(direction)
      }
      draw(ctx!, game.current, prefersReducedMotion, bunny, scenery, walking)
      if (time - lastHud > 100) {
        setHud(game.current)
        lastHud = time
      }
      if (!document.hidden && inView) frame = requestAnimationFrame(loop)
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        pause(true)
      } else if (inView) {
        previous = 0
        frame = requestAnimationFrame(loop)
      }
    }
    function blur() {
      pause(true)
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      cancelAnimationFrame(frame)
      previous = 0
      if (!inView) pause(true)
      else if (!document.hidden) frame = requestAnimationFrame(loop)
    })
    if (root.current) observer.observe(root.current)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', blur)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      heldKeys.clear()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('blur', blur)
    }
  }, [pet.id, pet.species, pet.stage, prefersReducedMotion])
  const inputKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ']
  function control(key: string, label: string, glyph: string) {
    return (
      <button
        type="button"
        aria-label={label}
        className={key === ' ' ? 'arena-attack' : 'arena-direction'}
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          keys.current.add(key)
        }}
        onPointerUp={() => keys.current.delete(key)}
        onPointerCancel={() => keys.current.delete(key)}
        onLostPointerCapture={() => keys.current.delete(key)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            keys.current.add(key)
          }
        }}
        onKeyUp={() => keys.current.delete(key)}
      >
        {glyph}
      </button>
    )
  }
  return (
    <div
      ref={root}
      className="pet-arena"
      onKeyDown={(e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
        if (inputKeys.includes(key) && e.target === canvas.current) {
          e.preventDefault()
          keys.current.add(key)
        }
        if (e.key === 'Escape') pause(!pausedRef.current)
      }}
      onKeyUp={(e) => keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key)}
    >
      <div className="arena-hud">
        <span>
          ♡ {hud.player.hp}/{hud.player.maxHp} <b>{PETS[pet.species].name}</b>
        </span>
        <span>
          {vi ? 'Đợt' : 'Wave'} {hud.wave}/3 · {hud.kills} ✦
        </span>
        <button type="button" onClick={() => pause(!paused)} disabled={hud.status !== 'running'}>
          {paused ? (vi ? 'Tiếp tục' : 'Resume') : vi ? 'Tạm dừng' : 'Pause'}
        </button>
      </div>
      <div className="arena-screen">
        <canvas
          ref={canvas}
          width={640}
          height={360}
          tabIndex={0}
          aria-label={
            vi
              ? 'Đấu trường. Di chuyển bằng WASD hoặc phím mũi tên. Space tấn công. Escape tạm dừng.'
              : 'Arena. Move with WASD or arrow keys. Space to attack. Escape to pause.'
          }
        />
        {(hud.status !== 'running' || paused) && (
          <div className="arena-overlay">
            <span className="pet-eyebrow">
              {hud.status === 'won'
                ? '✦ VICTORY ✦'
                : hud.status === 'lost'
                  ? 'A LITTLE NAP'
                  : paused
                    ? 'TAKE A BREATHER'
                    : 'THE GLITCH GARDEN'}
            </span>
            <h3>
              {hud.status === 'won'
                ? vi
                  ? 'Khu vườn an toàn rồi!'
                  : 'Garden, protected.'
                : hud.status === 'lost'
                  ? vi
                    ? 'Nghỉ xíu, làm lại thôi.'
                    : 'A nap. Then a comeback.'
                  : paused
                    ? vi
                      ? 'Đã tạm dừng'
                      : 'On a little break.'
                    : vi
                      ? 'Nhỏ xíu. Đánh cũng ghê.'
                      : 'Tiny paws. Big courage.'}
            </h3>
            <p>
              {hud.status === 'won'
                ? '+90 coins · +12 gems · +25 XP'
                : vi
                  ? 'Di chuyển, né quái, giữ Space để xoay đánh. Né tia sáng của tinh linh. Ba đợt quái, không mất tài nguyên.'
                  : 'Move, dodge, hold Space to spin. Dodge the wisps’ sparks. Three waves. Nothing to lose.'}
            </p>
            <button
              type="button"
              className="pet-button primary"
              onClick={
                paused && hud.status === 'running'
                  ? () => {
                      pause(false)
                      canvas.current?.focus()
                    }
                  : start
              }
            >
              {paused && hud.status === 'running'
                ? vi
                  ? 'Tiếp tục'
                  : 'Resume'
                : vi
                  ? 'Vào đấu trường'
                  : 'Let’s play'}{' '}
              ↗
            </button>
          </div>
        )}
      </div>
      <div className="arena-bottom">
        <p>
          {vi
            ? 'WASD / mũi tên: di chuyển · Space: đánh · Esc: nghỉ'
            : 'WASD / arrows to move · Space to attack · Esc to pause'}
          <small>{vi ? 'Hoặc dùng các nút bên dưới.' : 'Or use the controls below.'}</small>
        </p>
        <div className="arena-touch">
          <div className="arena-dpad">
            {control('ArrowUp', vi ? 'Lên' : 'Up', '↑')}
            <div>
              {control('ArrowLeft', vi ? 'Trái' : 'Left', '←')}
              {control('ArrowDown', vi ? 'Xuống' : 'Down', '↓')}
              {control('ArrowRight', vi ? 'Phải' : 'Right', '→')}
            </div>
          </div>
          {control(' ', vi ? 'Giữ để tấn công' : 'Hold to attack', '✦')}
        </div>
      </div>
      <p role="status" className="sr-only">
        {hud.status === 'won'
          ? vi
            ? 'Chiến thắng. Đã nhận thưởng.'
            : 'Victory. Rewards collected.'
          : hud.status === 'lost'
            ? vi
              ? 'Hết máu. Thử lại nhé.'
              : 'Out of hearts. Try again.'
            : ''}
      </p>
    </div>
  )
}
