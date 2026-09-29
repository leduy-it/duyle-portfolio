'use client'
import { useState } from 'react'
import catalog from '@/data/pets/atlas-catalog.json'
import { AtlasPet, LANES, type PetLane } from './atlas-pet'
export function SourceGallery({ vi }: { vi: boolean }) {
  const [lane, setLane] = useState<PetLane>('idle')
  const [evolved, setEvolved] = useState(false)
  return (
    <section className="pet-source-gallery">
      <h2>{vi ? 'Những người bạn từ hatch-pet-plus' : 'Meet the hatch-pet-plus family'}</h2>
      <p>
        {vi
          ? '21 bộ pet và dòng tiến hóa gốc của Duy. Chọn trạng thái để xem animation thật; rê chuột lên pet để thấy cú nhảy.'
          : 'Duy’s 21 original pet packs and evolution lines. Pick a state to play its actual animation; hover a pet to see it jump.'}{' '}
        <a
          href="https://github.com/leduy-it/hatch-pet-plus"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </p>
      <div className="pet-source-controls" aria-label="Animation states">
        {LANES.map((value) => (
          <button key={value} aria-pressed={lane === value} onClick={() => setLane(value)}>
            {value}
          </button>
        ))}
        <button aria-pressed={evolved} onClick={() => setEvolved((v) => !v)}>
          Volt → Anodane ✦
        </button>
      </div>
      <div className="pet-source-grid">
        {catalog.map((p) => (
          <figure className="pet-source-card" key={p.id}>
            <AtlasPet
              pet={p.id}
              file={p.id === 'volt' && evolved ? 'stage-2.webp' : p.file}
              lane={lane}
            />
            <figcaption>{p.id === 'volt' && evolved ? 'Anodane' : p.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
