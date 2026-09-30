'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useLocale } from '@/lib/i18n'

const STAGES = [
  { en: 'Source', vi: 'Nguồn', detailEn: 'Can this claim be traced to a source?', detailVi: 'Có truy ngược được về nguồn không?' },
  { en: 'Structure', vi: 'Cấu trúc', detailEn: 'Does it fit the product schema?', detailVi: 'Có đúng schema sản phẩm không?' },
  { en: 'Evidence', vi: 'Bằng chứng', detailEn: 'Does the source actually support it?', detailVi: 'Nguồn có thật sự chứng minh điều này không?' },
  { en: 'Review', vi: 'Duyệt', detailEn: 'Publish, abstain, or send to a person.', detailVi: 'Xuất bản, từ chối, hoặc chuyển người duyệt.' },
]

function createPath(points: THREE.Vector3[], color: number, opacity: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  return new THREE.Line(geometry, material)
}

export default function AgenticGateVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { locale } = useLocale()
  const [activeStage, setActiveStage] = useState(2)
  const activeStageRef = useRef(activeStage)
  const [totalCost, setTotalCost] = useState('')
  const [webglAvailable, setWebglAvailable] = useState(true)
  const cost = Number(totalCost)
  const costPerQuestion = Number.isFinite(cost) && cost > 0 ? cost / 50000 : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      const fallbackTimer = window.setTimeout(() => setWebglAvailable(false), 0)
      return () => window.clearTimeout(fallbackTimer)
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50)
    camera.position.set(0, 3.25, 12.5)
    camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 1.1)
    const key = new THREE.PointLight(0x83fff0, 45, 18)
    key.position.set(-4, 5, 6)
    const warm = new THREE.PointLight(0xffbb78, 23, 15)
    warm.position.set(4, -2, 4)
    scene.add(ambient, key, warm)

    const gatePositions = [-4.2, -1.45, 1.3, 4.05]
    const gateMeshes: THREE.Mesh[] = []
    const gateMaterials: THREE.MeshStandardMaterial[] = []
    for (const [index, x] of gatePositions.entries()) {
      const material = new THREE.MeshStandardMaterial({
        color: index === 3 ? 0xffbc82 : 0x70f8e9,
        emissive: index === 3 ? 0x6a2f10 : 0x0c7474,
        emissiveIntensity: 0.36,
        metalness: 0.55,
        roughness: 0.24,
      })
      const gate = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.045, 12, 80), material)
      gate.position.set(x, 0, 0)
      gate.rotation.y = Math.PI / 2
      gate.rotation.z = -0.12
      gateMeshes.push(gate)
      gateMaterials.push(material)
      scene.add(gate)

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.035, 1.45),
        new THREE.MeshStandardMaterial({ color: 0x183142, metalness: 0.6, roughness: 0.35 })
      )
      base.position.set(x, -1.12, 0)
      scene.add(base)
    }

    const grid = new THREE.GridHelper(15, 24, 0x24465a, 0x173346)
    grid.position.y = -1.14
    scene.add(grid)
    scene.add(createPath([new THREE.Vector3(-5.3, 0, 0), new THREE.Vector3(5.25, 0, 0)], 0x68ecdc, 0.45))
    scene.add(createPath([new THREE.Vector3(1.3, 0, 0), new THREE.Vector3(2.9, -1.65, 0), new THREE.Vector3(5.15, -1.65, 0)], 0xffbd83, 0.55))

    const acceptedMaterial = new THREE.MeshStandardMaterial({ color: 0x9affec, emissive: 0x1c988a, emissiveIntensity: 0.8 })
    const heldMaterial = new THREE.MeshStandardMaterial({ color: 0xffbd83, emissive: 0xb15118, emissiveIntensity: 0.58 })
    const particleGeometry = new THREE.IcosahedronGeometry(0.095, 1)
    const particles = Array.from({ length: 28 }, (_, index) => {
      const held = index % 5 === 0
      const mesh = new THREE.Mesh(particleGeometry, held ? heldMaterial : acceptedMaterial)
      scene.add(mesh)
      return { mesh, held, offset: index / 28 }
    })

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth)
      const height = Math.max(1, canvas.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.01 })
    visibilityObserver.observe(canvas)
    const clock = new THREE.Clock()
    let frame = 0
    const render = () => {
      frame = requestAnimationFrame(render)
      if (!visible || document.hidden) return
      const elapsed = motionQuery.matches ? 0 : clock.getElapsedTime()
      particles.forEach(({ mesh, held, offset }) => {
        const t = (offset + elapsed * 0.065) % 1
        const x = -5.35 + t * 10.7
        const branch = held ? Math.max(0, Math.min(1, (x - 1.3) / 1.6)) : 0
        mesh.position.set(x, -1.65 * branch + Math.sin(t * 18 + indexSeed(offset)) * 0.055, Math.sin(t * 12 + offset * 18) * 0.22)
        mesh.scale.setScalar(held && x > 1.3 ? 0.75 : 1)
      })
      gateMeshes.forEach((mesh, index) => {
        mesh.rotation.x = motionQuery.matches ? 0 : Math.sin(elapsed * 0.65 + index) * 0.08
        gateMaterials[index].emissiveIntensity = index === activeStageRef.current ? 1.15 : 0.36
      })
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      grid.geometry.dispose()
      if (Array.isArray(grid.material)) grid.material.forEach((material) => material.dispose())
      else grid.material.dispose()
      renderer.dispose()
    }
  }, [])

  const stage = STAGES[activeStage]

  return (
    <figure className="not-prose my-12 overflow-hidden rounded-[28px] border border-[#385b61] bg-[#071923] text-[#e6f6ed] shadow-[0_24px_80px_-28px_rgba(0,0,0,.55)]">
      <div className="relative overflow-hidden border-b border-[#24424c] px-5 pb-1 pt-6 sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 50% 45%, #174f57, transparent 58%)' }} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#76efdb]">{locale === 'vi' ? 'Mô phỏng tương tác · Three.js' : 'Interactive model · Three.js'}</p>
            <h3 className="mb-0 mt-2 font-sans text-xl font-semibold text-[#f6f3e9] sm:text-2xl">{locale === 'vi' ? 'Một câu hỏi đi qua những cổng nào?' : 'What does a question pass through?'}</h3>
          </div>
          <span className="shrink-0 rounded-full border border-[#436369] px-2 py-1 font-mono text-[10px] text-[#a8c9c9]">0{activeStage + 1} / 04</span>
        </div>
        <div className="relative mt-3 h-[220px] sm:h-[300px]">
          <canvas ref={canvasRef} className="block h-full w-full" aria-label={locale === 'vi' ? 'Mô hình 3D bốn cổng kiểm tra, với luồng xuất bản và luồng giữ lại' : '3D model of four verification gates, with publish and hold paths'} />
          {!webglAvailable && <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-[#bed5d1]">{locale === 'vi' ? 'Thiết bị này không hỗ trợ WebGL. Các bước kiểm tra vẫn ở bên dưới.' : 'WebGL is unavailable. The gate steps are listed below.'}</div>}
        </div>
        <div className="relative mb-5 flex justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#a8c9c9]">
          <span>{locale === 'vi' ? 'Tài liệu vào' : 'Source content'}</span>
          <span className="text-[#86f2db]">{locale === 'vi' ? 'Xuất bản' : 'Publish'} →</span>
        </div>
      </div>
      <div className="grid gap-5 p-5 sm:p-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={locale === 'vi' ? 'Các cổng kiểm tra' : 'Verification gates'}>
          {STAGES.map((item, index) => (
            <button key={item.en} type="button" onClick={() => { activeStageRef.current = index; setActiveStage(index) }} aria-pressed={activeStage === index} className={`rounded-xl border px-3 py-3 text-left font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9af5e6] ${activeStage === index ? 'border-[#80ead9] bg-[#123a42] text-[#eafff9]' : 'border-[#2b4b52] bg-[#0c232d] text-[#a7c2bf] hover:border-[#6fb4aa]'}`}>
              <span className="mr-2 text-[#8bead8]">0{index + 1}</span>{locale === 'vi' ? item.vi : item.en}
            </button>
          ))}
        </div>
        <p className="min-h-10 text-sm leading-relaxed text-[#d2e7df]"><span className="mr-2 text-[#8bead8]">↗</span>{locale === 'vi' ? stage.detailVi : stage.detailEn}</p>
        <div className="grid gap-2 border-t border-[#25434b] pt-5 sm:grid-cols-3">
          <div><strong className="block font-mono text-2xl text-[#a4f6e2]">&gt;99%</strong><span className="text-xs text-[#acc7c4]">{locale === 'vi' ? 'precision báo cáo' : 'reported precision'}</span></div>
          <div><strong className="block font-mono text-2xl text-[#a4f6e2]">~73%</strong><span className="text-xs text-[#acc7c4]">{locale === 'vi' ? 'tài liệu → Q&A' : 'source → Q&A conversion'}</span></div>
          <div><strong className="block font-mono text-2xl text-[#a4f6e2]">50k+</strong><span className="text-xs text-[#acc7c4]">{locale === 'vi' ? 'câu hỏi đã populate' : 'questions populated'}</span></div>
        </div>
        <p className="m-0 text-[11px] leading-relaxed text-[#91aba9]">{locale === 'vi' ? 'Luồng 3D chỉ minh họa kiến trúc cổng kiểm tra. Ba con số là số liệu trên portfolio Growtrics; không phải phép đo từ hoạt cảnh.' : 'The 3D paths illustrate gate design. The three figures are portfolio-reported Growtrics metrics, not measurements from this animation.'}</p>
      </div>
      <div className="border-t border-[#2b4b52] bg-[#0b222c] p-5 sm:p-8">
        <p className="m-0 font-mono text-[10px] uppercase tracking-[0.23em] text-[#f5ba83]">{locale === 'vi' ? 'Chi phí trên mỗi câu hỏi dùng được' : 'Cost per usable question'}</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex-1 text-xs leading-relaxed text-[#bfd5d1]">
            {locale === 'vi' ? 'Nhập tổng chi phí kỳ đo (VND)' : 'Enter total period cost (VND)'}
            <input type="number" min="0" step="1000" inputMode="numeric" value={totalCost} onChange={(event) => setTotalCost(event.target.value)} placeholder={locale === 'vi' ? 'Chưa có số công khai' : 'No public cost figure yet'} className="mt-2 block w-full rounded-lg border border-[#45656b] bg-[#102d37] px-3 py-2 font-mono text-sm text-white placeholder:text-[#819d9e] focus:outline-2 focus:outline-[#8bead8]" />
          </label>
          <div className="min-w-[170px] rounded-lg border border-[#4e554b] bg-[#1d2b2b] px-4 py-3">
            <strong className="block font-mono text-lg text-[#f6c393]">{costPerQuestion === null ? '—' : `≤${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(costPerQuestion)} ₫`}</strong>
            <span className="text-[11px] text-[#c4d5cf]">{locale === 'vi' ? 'mỗi câu hỏi, với mẫu số ≥50.000' : 'per question, denominator ≥50,000'}</span>
          </div>
        </div>
        <p className="mb-0 mt-3 text-[11px] leading-relaxed text-[#9fb8b2]">{locale === 'vi' ? 'Tổng chi phí cần gồm crawl + model + review + hạ tầng cùng kỳ; nếu chỉ nhập tiền API, kết quả chỉ là chi phí API/câu hỏi.' : 'Use crawl + model + review + infrastructure costs from the same period. Entering API spend alone gives only API cost per question.'}</p>
      </div>
    </figure>
  )
}

function indexSeed(value: number) {
  return value * 100
}
