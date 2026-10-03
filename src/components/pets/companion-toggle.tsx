'use client'

import { CompanionIcon } from './companion-icon'
import { useCompanionSelection } from '@/lib/pets/companion-selection'
import { useLocale } from '@/lib/i18n'
import { useCompanionPreference } from '@/lib/pets/companion-preference'

export function CompanionToggle() {
  const { visible, setVisible } = useCompanionPreference()
  const { locale } = useLocale()
  const { name } = useCompanionSelection()
  const label = locale === 'vi' ? `Hiện ${name}` : `Show ${name}`
  return (
    <button
      type="button"
      role="switch"
      aria-checked={visible}
      aria-label={label}
      title={`${label}: ${visible ? 'on' : 'off'}`}
      onClick={() => setVisible(!visible)}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-overlay))] text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--accent))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--accent))]"
    >
      <CompanionIcon hidden={!visible} />
      {visible && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[rgb(var(--surface-page))] bg-[rgb(var(--accent))]"
        />
      )}
    </button>
  )
}
