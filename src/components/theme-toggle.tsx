'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Skeleton placeholder matching final dimensions to avoid layout shift
  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-overlay))]" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="theme-switch relative w-14 h-7 border border-[rgb(var(--border))] rounded-lg transition-colors duration-300 bg-[rgb(var(--surface-overlay))]"
    >
      {/* Sliding indicator — left = dark (sun shown), right = light (moon shown) */}
      <div
        className={`absolute top-px w-6 h-6 bg-[rgb(var(--accent))] rounded-md transition-transform duration-300 flex items-center justify-center text-[rgb(var(--background))] ${
          isDark ? 'translate-x-0.5' : 'translate-x-[var(--theme-slide,1.875rem)]'
        }`}
      >
        {isDark ? (
          /* Sun icon — visible in dark mode */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* Moon icon — visible in light mode */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>
    </button>
  )
}
