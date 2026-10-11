'use client'

import { useId, useState } from 'react'
import styles from './another-portfolio-link.module.css'

const description = 'This portfolio takes inspiration from pixels, terminals, and developer culture. The other version presents the same work in a familiar format for recruiters, clients, and collaborators.'

export function AnotherPortfolioLink({ mobile = false }: { mobile?: boolean }) {
  const descriptionId = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const open = !dismissed && (hovered || focused)

  const link = (
    <a
      className={styles.link}
      href="https://another.duyle.me"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Another view of Le Duy’s portfolio (opens in a new tab)"
      aria-describedby={descriptionId}
      onFocus={() => { setFocused(true); setDismissed(false) }}
      onBlur={() => setFocused(false)}
      onKeyDown={event => { if (event.key === 'Escape') setDismissed(true) }}
    >
      <span>Another view</span>
      <svg className={styles.arrow} width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12 12 4M4 4h8v8" />
      </svg>
    </a>
  )

  if (mobile) return (
    <div className={styles.mobileCard}>
      {link}
      <div id={descriptionId} className={styles.mobileDescription}>
        <p className={styles.title}>Two styles. Same Duy.</p>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )

  return (
    <div
      className={styles.root}
      onMouseEnter={() => { setHovered(true); setDismissed(false) }}
      onMouseLeave={() => setHovered(false)}
    >
      {link}
      <div id={descriptionId} role="tooltip" aria-hidden={!open} className={styles.tooltip} data-open={open}>
        <p className={styles.title}>Two styles. Same Duy.</p>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )
}
