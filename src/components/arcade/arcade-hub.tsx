'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {motion,useReducedMotion} from 'motion/react'
import {entrancePose,settledPose,useMotionSeed,motionPattern} from '@/components/motion/entrance-patterns'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/i18n'
import { usePetSave } from '@/lib/pets/pet-save-provider'
import { petAppearance } from '@/lib/pets/appearance'
import { arcadeGames, type ArcadeCategory, type ArcadeGame } from '@/data/arcade-games'
import './arcade.css'

const JupiterCover=dynamic(()=>import('@/components/showcase/three-cover'),{ssr:false})

const filters: { id: ArcadeCategory; en: string; vi: string }[] = [
  { id: 'all', en: 'Everything', vi: 'Tất cả' },
  { id: 'cozy', en: 'Little joys', vi: 'Nhẹ nhàng' },
  { id: 'flight', en: 'Take flight', vi: 'Bay lượn' },
  { id: 'combat', en: 'Into battle', vi: 'Chiến đấu' },
  { id: 'worlds', en: 'Pocket worlds', vi: 'Thế giới pet' },
]

export function ArcadeHub({initialGame}: {initialGame?:string}) {
  const seed=useMotionSeed()
  const reduced=useReducedMotion()
  const { locale } = useLocale()
  const vi = locale === 'vi'
  const { save } = usePetSave()
  const [filter, setFilter] = useState<ArcadeCategory>('all')
  const [active, setActive] = useState<ArcadeGame | null>(()=>arcadeGames.find(game=>game.id === initialGame) || null)
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pet = save.pets.find((item) => item.id === save.selected) ?? save.pets[0]
  const appearance = petAppearance(pet.species, pet.stage)
  const companionQuery = new URLSearchParams({
    pet: appearance.pet,
    file: appearance.file,
    stage: String(pet.stage),
  }).toString()
  const shown = useMemo(() => filter === 'all' ? arcadeGames : arcadeGames.filter((game) => game.category === filter), [filter])

  useEffect(() => {
    if (!active) return
    const dialog = dialogRef.current
    if (!dialog) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = priorOverflow
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [active])

  useEffect(() => {
    if (!active || loaded) return
    const timer = window.setTimeout(() => setSlow(true), 12000)
    return () => window.clearTimeout(timer)
  }, [active, loaded, attempt])

  function launch(game: ArcadeGame, trigger: HTMLButtonElement) {
    triggerRef.current = trigger
    setLoaded(false)
    setSlow(false)
    setActive(game)
  }

  const gameSrc = active
    ? active.local ? `${active.url}?${companionQuery}` : active.url
    : ''

  return (
    <div className="arcade-page">
      <nav className="arcade-topbar" aria-label={vi ? 'Điều hướng Arcade' : 'Arcade navigation'}>
        <Link href="/" className="arcade-brand">leduy<span>.py_</span></Link>
        <span>✳ &nbsp; THE ARCADE &nbsp; ✳</span>
        <Link href="/pets">{vi ? '← Về Pocket World' : '← Back to Pocket World'}</Link>
      </nav>
      <section className="arcade-hero">
        <div className="arcade-hero-sky" aria-hidden="true" />
        <div className="arcade-hero-inner">
          <div className="arcade-hero-copy">
            <p className="arcade-kicker"><span className="arcade-live" /> THE PLAYROOM <span>№ 001 — OPEN</span></p>
            <h1>{vi ? <>Một chỗ để<br /><em>chơi thật.</em></> : <>Come in.<br /><em>Play something.</em></>}</h1>
            <p className="arcade-hero-lede">
              {vi
                ? 'Bay qua vườn rêu, giữ ngọn hải đăng, rồi lao vào trận 3v3. Chọn trò nào bạn thích và chơi ngay.'
                : 'Fly through moss gardens, keep a lighthouse alive, then jump into a 3v3 match. Pick a world and play.'}
            </p>
            <a className="arcade-hero-action" href="#games">{vi ? 'Chọn một trò' : 'Pick a game'} <span>↘</span></a>
          </div>
          <div className="arcade-hero-scene" aria-hidden="true" data-arcade-jupiter>
            <JupiterCover jupiter paused={!!active} />
            <div className="arcade-scene-meta"><span>05 / JUPITER</span><span>{vi ? 'Một chút xa khỏi thường ngày' : 'A little farther from ordinary'}</span></div>
          </div>
        </div>
        <div className="arcade-hero-foot"><span>{arcadeGames.length.toString().padStart(2, '0')} {vi ? 'THẾ GIỚI ĐỂ CHƠI' : 'WORLDS TO PLAY'}</span><span>{vi ? 'Không cần đăng nhập' : 'No account needed'} ↗</span><a href="/textures/credits.json" target="_blank" rel="noopener noreferrer" aria-label="Space imagery credits">NASA · Solar System Scope ↗</a></div>
      </section>

      <section className="arcade-catalog" id="games">
        <div className="arcade-catalog-top">
          <div><p className="arcade-eyebrow">01 / THE COLLECTION</p><h2>{vi ? 'Hôm nay chơi gì?' : 'What are you in the mood for?'}</h2></div>
          <p>{vi ? 'Mỗi trò mở ngay tại đây. Game nặng có thể tải lâu hơn một chút.' : 'Every game opens right here. Larger worlds may take a moment to load.'}</p>
        </div>
        <div className="arcade-filters" aria-label={vi ? 'Lọc trò chơi' : 'Filter games'}>
          {filters.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{vi ? item.vi : item.en}<span>{item.id === 'all' ? arcadeGames.length : arcadeGames.filter((game) => game.category === item.id).length}</span></button>)}
        </div>
        <div className="arcade-grid">
          {shown.map((game, index) => (
            <motion.article data-entrance-pattern={motionPattern(seed)} initial={reduced ? false : entrancePose(seed,index)} whileInView={settledPose} viewport={{once:true,amount:.12}} transition={{duration:.7,ease:[.16,1,.3,1],delay:reduced ? 0 : (index%6)*.035}} className={`arcade-card arcade-card-${game.category} ${game.local ? '' : 'has-preview'}`} key={game.id} style={{ '--game-accent': game.accent, '--card-index': index } as React.CSSProperties}>
              <div className="arcade-card-art" aria-hidden="true">{!game.local && <Image className="arcade-card-image" src={`/arcade/previews/${game.id}.${game.id === 'surge' || game.id === 'astra-floor' ? 'png' : 'jpg'}`} alt="" fill sizes="(max-width: 720px) 100vw, (max-width: 1020px) 50vw, 33vw" />}<span className="arcade-card-art-mark">{game.mark}</span><span className="arcade-card-art-ring" /><span className="arcade-card-art-index">{String(index + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}</span></div>
              <div className="arcade-card-body">
                <div className="arcade-card-meta"><span>{game.category.toUpperCase()}</span><span>{game.device === 'desktop' ? (vi ? 'MÁY TÍNH' : 'DESKTOP') : (vi ? 'MỌI THIẾT BỊ' : 'DESKTOP + TOUCH')}</span></div>
                <h3>{game.title}</h3>
                <p>{game.description[vi ? 'vi' : 'en']}</p>
                <div className="arcade-card-bottom"><span>{vi ? 'Tác giả' : 'Created by'} <strong>{game.creator}</strong></span><button type="button" onClick={(event) => launch(game, event.currentTarget)} aria-label={`${vi ? 'Chơi' : 'Play'} ${game.title}`}>{vi ? 'Chơi ngay' : 'Play now'} <span>↗</span></button></div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="arcade-pet-invite">
        <span>✳</span><div><p className="arcade-eyebrow">02 / YOUR LITTLE WORLD</p><h2>{vi ? 'Mang pet theo nữa chứ?' : 'Bring your companion along.'}</h2><p>{vi ? 'Last Beacon và Orbital Garden có pet bạn đang chọn. Qua Pocket World để đổi bạn đồng hành.' : 'Your chosen pet joins Last Beacon and Orbital Garden. Visit Pocket World to choose a different companion.'}</p></div><Link href="/pets">{vi ? 'Đến Pocket World' : 'Visit Pocket World'} ↗</Link>
      </section>

      {active && <dialog ref={dialogRef} className="arcade-player" onCancel={() => setActive(null)} aria-label={active.title}>
        <div className="arcade-player-header"><div><span className="arcade-player-index">NOW PLAYING / {active.category.toUpperCase()}</span><strong>{active.title}</strong><small>{vi ? 'Tác giả' : 'Created by'} {active.creator}</small></div><div className="arcade-player-actions"><button type="button" onClick={() => dialogRef.current?.requestFullscreen()} aria-label={vi ? 'Toàn màn hình' : 'Fullscreen'}>⛶</button><button type="button" onClick={() => setActive(null)} aria-label={vi ? 'Đóng trò chơi' : 'Close game'}>×</button></div></div>
        <div className="arcade-player-stage">{!loaded && <div className="arcade-player-loading"><span className="arcade-player-spinner" /><strong>{vi ? 'Đang mở thế giới…' : 'Opening world…'}</strong><small>{active.id === 'sandline' ? (vi ? 'Sandline tải asset lần đầu khá nặng.' : 'Sandline has a large first download.') : (vi ? 'Chờ một chút nhé.' : 'Just a moment.')}</small>{slow && <div className="arcade-player-recovery"><p>{vi ? 'Máy chủ game hơi chậm. Bạn có thể thử tải lại hoặc xem khung game.' : 'The game host is taking longer than usual. Retry or reveal the game frame.'}</p><button type="button" onClick={() => { setSlow(false); setAttempt((n) => n + 1) }}>{vi ? 'Tải lại' : 'Retry'}</button><button type="button" onClick={() => setLoaded(true)}>{vi ? 'Xem khung game' : 'Show game'}</button></div>}</div>}<iframe key={`${active.id}-${attempt}`} src={gameSrc} title={active.title} onLoad={() => setLoaded(true)} allow="fullscreen; autoplay; gamepad; pointer-lock" allowFullScreen referrerPolicy="no-referrer" /></div>
        <div className="arcade-player-footer"><span>{active.controls[vi ? 'vi' : 'en']}</span><div><button type="button" onClick={() => { setLoaded(false); setSlow(false); setAttempt((n) => n + 1) }}>{vi ? 'Tải lại' : 'Reload'} ↻</button><button type="button" onClick={() => setActive(null)}>{vi ? 'Thoát game' : 'Exit game'} ↗</button></div></div>
      </dialog>}
    </div>
  )
}
