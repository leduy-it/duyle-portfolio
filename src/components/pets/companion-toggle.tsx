'use client'

import { useLocale } from '@/lib/i18n'
import { useCompanionPreference } from '@/lib/pets/companion-preference'

export function CompanionToggle() {
  const { visible, setVisible } = useCompanionPreference()
  const { locale } = useLocale()
  const label = locale === 'vi' ? 'Hiện Gracie' : 'Show Gracie'
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
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M7 11C2 2 8-3 10 10M14 10C16-3 22 2 17 11" />
        <path d="M19.5 16c0 4-3 6-7.5 6s-7.5-2-7.5-6 3-6 7.5-6 7.5 2 7.5 6Z" />
        <path d="M9 15v1m6-1v1m-4 2h2" strokeLinecap="round" />
        {!visible && <path d="m3 3 18 18" />}
      </svg>
      {visible && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[rgb(var(--surface-page))] bg-[rgb(var(--accent))]"
        />
      )}
    </button>
  )
}
