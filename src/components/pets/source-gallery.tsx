'use client'
import { useEffect, useRef, useState } from 'react'
import { useCompanionSelection } from '@/lib/pets/companion-selection'
import { useCompanionPreference } from '@/lib/pets/companion-preference'
import catalog from '@/data/pets/atlas-catalog.json'
import { AtlasPet, LANES, type PetLane } from './atlas-pet'
export function SourceGallery({ vi }: { vi: boolean }) {
  const companion = useCompanionSelection()
  const { setVisible } = useCompanionPreference()
  const [selected, setSelected] = useState('inko')
  const [stage, setStage] = useState(0)
  const [guided, setGuided] = useState(false)
  const setButton = useRef<HTMLButtonElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const openGuide = () => {
      const id = new URLSearchParams(window.location.hash.slice(1)).get('companion')
      if (!catalog.some(p => p.id === id)) return
      setSelected(id!)
      setStage(0)
      setGuided(true)
      frame = requestAnimationFrame(() => {
        preview.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
        setButton.current?.focus({ preventScroll: true })
      })
    }
    openGuide()
    window.addEventListener('hashchange', openGuide)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', openGuide) }
  }, [])
  const [lane, setLane] = useState<PetLane>('idle')
  const [transition, setTransition] = useState(0)
  const pet = catalog.find((p) => p.id === selected)!
  const form = pet.stages[stage] || pet.stages[0]
  const evolve = (next: number) => {
    setStage(next)
    setTransition((v) => v + 1)
  }
  const choose = (id: string) => {
    setSelected(id)
    setStage(0)
    setTransition((v) => v + 1)
  }
  return (
    <section className="pet-source-gallery" id="evolution-studio">
      <div className="studio-heading">
        <div>
          <span className="pet-eyebrow">03 / THE EVOLUTION STUDIO</span>
          <h2>{vi ? 'Nhỏ hôm nay. Huyền thoại ngày mai.' : 'Small today. Legendary tomorrow.'}</h2>
        </div>
        <span className="studio-counter">
          21 <small>SPECIMENS</small>
        </span>
      </div>
      <button className="inko-recommend" onClick={() => choose('inko')}>
        <AtlasPet pet="inko" />
        <span>
          <small>{vi ? 'LỰA CHỌN ĐỀ XUẤT' : 'THE RECOMMENDED SIDEKICK'}</small>
          <strong>Inko</strong>
          <span>
            {vi ? 'Một chút mực. Rất nhiều cá tính.' : 'A little ink. A lot of personality.'}
          </span>
        </span>
        <b>↗</b>
      </button>
      <div className="evolution-studio" ref={preview} id="companion-preview">
        <div className="studio-stage">
          <div className="studio-stage-top">
            <span>SPECIMEN / {pet.id.toUpperCase()}</span>
            <span className="studio-live">● LIVE PREVIEW</span>
          </div>
          <div className="studio-orbit orbit-one" />
          <div className="studio-orbit orbit-two" />
          <div className="studio-pet" key={`${selected}:${transition}`}>
            <AtlasPet pet={pet.id} file={form.spritesheetPath} lane={lane} follow />
          </div>
          <div className="studio-platform" />
          <span className="studio-spark spark-a">✧</span>
          <span className="studio-spark spark-b">✦</span>
          <div className="studio-stage-caption">
            <span>
              {String(stage + 1).padStart(2, '0')} / {String(pet.stages.length).padStart(2, '0')}
            </span>
            <strong>{form.name}</strong>
            <small>
              {vi
                ? 'Rê chuột để pet nhìn theo · chạm để khám phá'
                : 'Move your cursor. Catch their eye.'}
            </small>
          </div>
        </div>
        <div className="studio-console">
          <span className="pet-eyebrow">
            {vi ? 'PHÒNG THÍ NGHIỆM NHỎ' : 'A LITTLE LAB. A BIG WHAT IF.'}
          </span>
          <h3>
            {form.name}
            <span>✳</span>
          </h3>
          <p>
            {vi
              ? 'Xem trước mọi chuyển động và hình thái có sẵn. Không mất xu, không thay đổi tiến trình của bạn.'
              : 'Try every move. Meet every form. This is a preview — your coins and progress stay yours.'}
          </p>
          <div className="evolution-forms">
            {pet.stages.map((f, i) => (
              <button key={f.spritesheetPath} aria-pressed={stage === i} onClick={() => evolve(i)}>
                <AtlasPet pet={pet.id} file={f.spritesheetPath} />
                <span>
                  <small>
                    FORM {i + 1} · LV {f.minLevel}
                  </small>
                  <strong>{f.name}</strong>
                </span>
                <b>{stage === i ? '●' : '↗'}</b>
              </button>
            ))}
          </div>
          {pet.stages.length > 1 ? (
            <button
              className="studio-evolve"
              onClick={() => evolve((stage + 1) % pet.stages.length)}
            >
              {vi ? 'Xem chuyển hóa' : 'Preview evolution'} <span>✦</span>
            </button>
          ) : (
            <p className="studio-unbuilt">
              {vi
                ? 'Repo hiện có một form cho pet này. Chọn Volt, Grove hoặc Sprocket để xem tiến hóa.'
                : 'One form ships for this pet. Try Volt, Grove or Sprocket for evolution.'}
            </p>
          )}
          {guided && <p id="companion-guide" className="companion-guide" role="status">
            {vi ? `Xem thử ${form.name}, rồi bấm nút sáng bên dưới để chọn đi cùng bạn.` : `Preview ${form.name}, then use the highlighted button to choose your companion.`}
            <button type="button" onClick={() => setGuided(false)} aria-label={vi ? 'Ẩn hướng dẫn' : 'Dismiss guide'}>×</button>
          </p>}
          <button
            ref={setButton}
            className={`set-companion ${guided ? 'is-guided' : ''}`}
            aria-describedby={guided ? 'companion-guide' : undefined}
            onClick={() => {
              companion.setCompanion(pet.id, stage)
              setVisible(true)
              setGuided(false)
              if (window.location.hash.startsWith('#companion=')) window.history.replaceState(null, '', '#companion-preview')
            }}
          >
            {companion.pet.id === pet.id && companion.stage === stage
              ? vi
                ? '✓ Đang đi cùng bạn'
                : '✓ Your current companion'
              : vi
                ? `Chọn ${form.name} đi cùng bạn`
                : `Set ${form.name} as companion`}{' '}
            <span>↗</span>
          </button>
          <div className="studio-lines">
            {catalog
              .filter((p) => p.stages.length > 1)
              .map((p) => (
                <button key={p.id} aria-pressed={selected === p.id} onClick={() => choose(p.id)}>
                  {p.id === 'grove-evo' ? 'Grove' : p.name} <span>{p.stages.length} forms</span>
                </button>
              ))}
          </div>
        </div>
      </div>
      <div className="studio-motion-bar">
        <span>{vi ? 'CHUYỂN ĐỘNG' : 'MOTION LAB'}</span>
        <div className="pet-source-controls" aria-label="Animation states">
          {LANES.map((value) => (
            <button key={value} aria-pressed={lane === value} onClick={() => setLane(value)}>
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="studio-roster-heading">
        <h3>{vi ? 'Chọn bạn đồng hành' : 'The whole curious family'}</h3>
        <a
          href="https://github.com/leduy-it/hatch-pet-plus"
          target="_blank"
          rel="noopener noreferrer"
        >
          hatch-pet-plus ↗
        </a>
      </div>
      <div className="pet-source-grid">
        {catalog.map((p) => (
          <button
            className="pet-source-card"
            key={p.id}
            aria-pressed={selected === p.id}
            onClick={() => {
              choose(p.id)
              document.getElementById('evolution-studio')?.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'auto'
                  : 'smooth',
              })
            }}
          >
            <span className="specimen-no">
              {String(catalog.indexOf(p) + 1).padStart(2, '0')}
              {p.stages.length > 1 && <i>EVOLVES</i>}
            </span>
            <AtlasPet pet={p.id} file={p.file} lane={lane} />
            <strong>{p.name}</strong>
            <small>
              {p.stages.length > 1 ? `${p.stages.length} forms ↗` : '9 moves · 16 looks'}
            </small>
          </button>
        ))}
      </div>
    </section>
  )
}
