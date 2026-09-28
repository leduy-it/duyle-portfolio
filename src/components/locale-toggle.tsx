'use client'

import { useLocale } from '@/lib/i18n'

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      role="group"
      aria-label={t('locale.label')}
      className="locale-switch inline-flex items-center rounded-full border p-0.5"
      style={{
        borderColor: 'rgb(var(--border) / 0.6)',
        backgroundColor: 'rgb(var(--surface-overlay) / 0.6)',
      }}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-label={t('locale.en')}
        aria-pressed={locale === 'en'}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight transition-colors duration-200"
        style={{
          backgroundColor:
            locale === 'en' ? 'rgb(var(--accent) / 0.18)' : 'transparent',
          color:
            locale === 'en'
              ? 'rgb(var(--accent))'
              : 'rgb(var(--text-muted))',
        }}
      >
        <UkFlag />
        <span className="locale-label">EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLocale('vi')}
        aria-label={t('locale.vi')}
        aria-pressed={locale === 'vi'}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight transition-colors duration-200"
        style={{
          backgroundColor:
            locale === 'vi' ? 'rgb(var(--accent) / 0.18)' : 'transparent',
          color:
            locale === 'vi'
              ? 'rgb(var(--accent))'
              : 'rgb(var(--text-muted))',
        }}
      >
        <VnFlag />
        <span className="locale-label">VI</span>
      </button>
    </div>
  )
}

/* Inline SVG flags — uniform 14px, no emoji glyph fallback issues. */

function UkFlag() {
  return (
    <svg width="14" height="10" viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id="uk-clip">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          stroke="#C8102E"
          strokeWidth="4"
          clipPath="url(#uk-clip)"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

function VnFlag() {
  return (
    <svg width="14" height="10" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        points="15,4 16.76,9.42 22.46,9.42 17.85,12.77 19.61,18.19 15,14.84 10.39,18.19 12.15,12.77 7.54,9.42 13.24,9.42"
        fill="#FFFF00"
      />
    </svg>
  )
}
