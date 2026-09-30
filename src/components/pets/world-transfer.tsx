'use client'
import { useRef, useState } from 'react'
import { usePetSave } from '@/lib/pets/pet-save-provider'
import { readPetSave, serializePetSave, type PetWorldSave } from '@/lib/pets/save'

export function WorldTransfer({ vi }: { vi: boolean }) {
  const { save, storage, update } = usePetSave()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PetWorldSave | null>(null)
  const [message, setMessage] = useState('')
  function download() {
    const url = URL.createObjectURL(new Blob([serializePetSave(save)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pocket-world-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <section className="world-transfer" aria-label={vi ? 'Mang thế giới theo bạn' : 'Take your world with you'}>
    <span className="pet-eyebrow">{vi ? 'THẾ GIỚI CỦA BẠN' : 'YOUR WORLD, TO GO'}</span>
    <p>{vi ? 'Lưu một bản để mang sang trình duyệt khác.' : 'Keep a copy. Bring it to another browser.'}</p>
    <div><button className="pet-button" onClick={download} disabled={storage === 'loading' || storage === 'newer'}>{vi ? 'Xuất bản lưu' : 'Export save'} ↓</button><button className="pet-button" onClick={() => input.current?.click()} disabled={storage !== 'saved'}>{vi ? 'Nhập bản lưu' : 'Import save'} ↑</button></div>
    <input ref={input} type="file" accept="application/json,.json" hidden onChange={async (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      setPending(null)
      try {
        if (file.size > 128000) throw Error()
        const next = readPetSave(await file.text())
        if (!next) throw Error()
        setPending(next); setMessage('')
      } catch { setMessage(vi ? 'Bản lưu không hợp lệ. Thế giới hiện tại vẫn an toàn.' : 'Invalid save. Your current world is safe.') }
    }} />
    {pending && <div className="world-import-confirm"><p>{vi ? `Thay thế thế giới hiện tại bằng ${pending.pets.length} pet và ${pending.coins} xu?` : `Replace this world with ${pending.pets.length} pets and ${pending.coins} coins?`}</p><button className="pet-button" onClick={async () => { download(); const result = await update(() => pending); setPending(null); setMessage(result === pending ? vi ? 'Đã nhập. Bản cũ được tải xuống.' : 'Imported. Your previous world was downloaded.' : vi ? 'Chưa nhập được. Hãy tải lại trang.' : 'Import did not complete. Please refresh.') }}>{vi ? 'Sao lưu & nhập' : 'Back up & import'}</button><button className="pet-button" onClick={() => setPending(null)}>{vi ? 'Hủy' : 'Cancel'}</button></div>}
    <output role="status">{message}</output>
  </section>
}
