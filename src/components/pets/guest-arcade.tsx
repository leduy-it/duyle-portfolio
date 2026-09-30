'use client'
import { useEffect, useRef, useState } from 'react'

const experiences = [
  { id: 'last-beacon', name: 'Last Beacon', tag: 'STRATEGY / 3D', author: 'stackloomdev', source: 'https://github.com/stackloomdev/last-beacon', license: 'MIT', en: 'One island. Ten waves. Keep the light alive.', vi: 'Một hòn đảo. Mười đợt tấn công. Giữ ngọn hải đăng sáng.', action: ['Defend the island', 'Bảo vệ hòn đảo'], controls: ['Build on the glowing pads. Space starts a wave. Drag to orbit.', 'Xây trên các bệ sáng. Space bắt đầu đợt mới. Kéo để xoay góc nhìn.'] },
  { id: 'orbital-garden', name: 'Orbital Garden', tag: 'OBSERVATORY / INTERACTIVE ART', author: 'jackroc', source: 'https://github.com/MartinDelophy/awesome-gpt-6-astra/tree/main/works/orbital-garden', license: 'CC0', en: '48,000 points of light. A universe at your fingertips.', vi: '48.000 điểm sáng. Một vũ trụ trong tầm tay.', action: ['Enter the observatory', 'Vào đài quan sát'], controls: ['Touch to disturb the stars. Choose a new formation. Sound is optional.', 'Chạm để khuấy động các vì sao. Đổi hình thái. Bật âm thanh nếu thích.'] },
] as const
export function GuestArcade({ vi }: { vi: boolean }) {
  const [active, setActive] = useState<typeof experiences[number] | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const launch = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (!active) return
    const node = dialog.current!
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    node.showModal()
    return () => { node.close(); document.body.style.overflow = previous; launch.current?.focus({ preventScroll: true }) }
  }, [active])
  return <section className="guest-arcade" id="guest-arcade">
    <div className="arcade-heading"><span className="pet-eyebrow">THE AFTER-HOURS ARCADE</span><h2>{vi ? 'Qua cánh cổng. Đổi thế giới.' : 'Step through. Switch worlds.'}</h2><p>{vi ? 'Hai trải nghiệm độc lập được tuyển chọn, chơi ngay tại đây. Tiến trình Pets của bạn vẫn được giữ nguyên.' : 'Two curated, independent experiences, playable right here. Your Pets progress stays with you.'}</p></div>
    <div className="arcade-portals">{experiences.map((game) => <article className={`arcade-portal portal-${game.id}`} key={game.id}>
      <div className="portal-art" aria-hidden="true" />
      <div className="portal-copy"><span>{game.tag}</span><h3>{game.name}</h3><p>{vi ? game.vi : game.en}</p><button className="pet-button" onClick={e => { launch.current = e.currentTarget; setActive(game) }}>{game.action[vi ? 1 : 0]} <span>↗</span></button><small>By <a href={game.source} target="_blank" rel="noreferrer">{game.author}</a> · {game.license}</small></div>
    </article>)}</div>
    {active && <dialog ref={dialog} className="arcade-dialog" onCancel={() => setActive(null)} aria-label={active.name}>
      <header><div><strong>{active.name}</strong><span>{active.controls[vi ? 1 : 0]}</span></div><button autoFocus onClick={() => setActive(null)} aria-label={vi ? 'Đóng trò chơi' : 'Close experience'}>×</button></header>
      <iframe src={`/play/${active.id}/index.html`} title={active.name} allow="fullscreen" />
      <footer><span>{vi ? 'Trò chơi độc lập · thành tích không cộng vào Pets' : 'Independent experience · scores are separate from Pets'}</span><a href={active.source} target="_blank" rel="noreferrer">{active.author} · {active.license} ↗</a></footer>
    </dialog>}
  </section>
}
