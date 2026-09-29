'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { CompanionToggle } from './pets/companion-toggle'
import { LocaleToggle } from './locale-toggle'
import { useLocale } from '@/lib/i18n'
import {
  Magnetic,
  RippleButton,
  SmoothLink,
  easeInOutQuart,
  easeOutExpo,
  easeSpringSoft,
  motionDurations,
} from '@/components/motion'

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const { t, locale } = useLocale()

  const navLinks = [
    { label: t('nav.about'), href: '/' },
    { label: t('nav.experience'), href: '/experience' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.cinema'), href: '/movie' },
    { label: 'Pets', href: '/pets' },
  ]

  const brandLower = t('brand.lower')
  const [brandName, brandExt] = brandLower.split('.')

  return (
    <header
      className="portfolio-header sticky top-0 py-3 xl:py-4 text-foreground backdrop-blur-md border-b"
      style={{
        backgroundColor: 'rgb(var(--surface-page) / 0.72)',
        borderColor: 'rgb(var(--border) / 0.6)',
        zIndex: 30,
      }}
    >
      <div className="container mx-auto flex justify-between items-center max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
        {/* Logo */}
        <Magnetic strength={4}>
          <SmoothLink href="/" className="group">
            <span className="inline-flex items-center text-xl xl:text-2xl font-semibold font-mono tracking-tight">
              {brandName}
              <span className="text-[rgb(var(--accent))]">.{brandExt}</span>
              <span className="ml-0.5 animate-pulse text-[rgb(var(--accent))]">_</span>
            </span>
          </SmoothLink>
        </Magnetic>

        {/* Desktop nav + controls */}
        <div className="hidden xl:flex items-center gap-8">
          <nav className="flex gap-7">
            {navLinks.map(({ label, href }) => {
              const isActive = isActivePath(pathname, href)
              return (
                <Magnetic key={href} strength={4}>
                  <SmoothLink
                    href={href}
                    className={`group relative inline-flex text-sm font-medium tracking-tight transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] ${
                      isActive
                        ? 'text-[rgb(var(--accent))]'
                        : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))]'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-1.5 h-px origin-center scale-x-0 bg-[rgb(var(--accent))] opacity-70 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                    />
                    {isActive ? (
                      <motion.span
                        layoutId="header-active-link"
                        className="absolute inset-x-0 -bottom-1.5 h-px bg-[rgb(var(--accent))]"
                        transition={reducedMotion ? { duration: 0 } : easeSpringSoft}
                      />
                    ) : null}
                  </SmoothLink>
                </Magnetic>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <LocaleToggle />
            <ThemeToggle />
            <CompanionToggle />
            <Magnetic>
              <RippleButton className="rounded-full">
                <Link
                  href="/Le_Van_Duy_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent))] px-5 py-2 text-sm font-medium tracking-tight text-[rgb(var(--surface-page))] transition-[transform,box-shadow,filter] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] hover:-translate-y-px hover:brightness-110 active:scale-[0.98] active:brightness-95"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.boxShadow = 'var(--shadow-card)'
                  }}
                >
                  {t('nav.resume')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </Link>
              </RippleButton>
            </Magnetic>
          </div>
        </div>

        {/* Mobile: locale + theme + hamburger */}
        <div className="site-mobile-controls flex xl:hidden items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
          <CompanionToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="mobile-menu-toggle w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--accent))" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <>
                <span className="w-5 h-0.5 bg-[rgb(var(--accent))]" />
                <span className="w-5 h-0.5 bg-[rgb(var(--accent))]" />
                <span className="w-3 h-0.5 bg-[rgb(var(--accent))] self-end" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      <AnimatePresence initial={false}>
        {mobileOpen ? (
          <motion.div
            initial={reducedMotion ? false : 'closed'}
            animate="open"
            exit="closed"
            variants={{
              open: {
                height: 'auto',
                opacity: 1,
                transition: reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: motionDurations.drawer,
                      ease: easeOutExpo,
                      when: 'beforeChildren',
                      staggerChildren: 0.04,
                    },
              },
              closed: {
                height: 0,
                opacity: 0,
                transition: reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: motionDurations.exit,
                      ease: easeInOutQuart,
                      when: 'afterChildren',
                    },
              },
            }}
            className="xl:hidden mt-3 overflow-hidden border-t"
            style={{
              backgroundColor: 'rgb(var(--surface-page) / 0.92)',
              borderColor: 'rgb(var(--border) / 0.6)',
            }}
          >
            <motion.div
              className="flex flex-col gap-2 px-4 py-4 backdrop-blur-md"
              variants={{
                open: { transition: { staggerChildren: 0.04 } },
                closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
              }}
            >
              {navLinks.map(({ label, href }) => {
                const isActive = isActivePath(pathname, href)
                return (
                  <motion.div
                    key={href}
                    variants={{
                      open: {
                        opacity: 1,
                        y: 0,
                        transition: reducedMotion
                          ? { duration: 0 }
                          : { duration: motionDurations.quick, ease: easeOutExpo },
                      },
                      closed: {
                        opacity: 0,
                        y: -8,
                        transition: reducedMotion
                          ? { duration: 0 }
                          : { duration: motionDurations.quick, ease: easeInOutQuart },
                      },
                    }}
                  >
                    <SmoothLink
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`block border-b py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] ${
                        isActive ? 'text-[rgb(var(--accent))]' : 'hover:text-[rgb(var(--accent))]'
                      }`}
                      style={{ borderColor: 'rgb(var(--border) / 0.5)' }}
                    >
                      {label}
                    </SmoothLink>
                  </motion.div>
                )
              })}
              <motion.div
                variants={{
                  open: {
                    opacity: 1,
                    y: 0,
                    transition: reducedMotion
                      ? { duration: 0 }
                      : { duration: motionDurations.quick, ease: easeOutExpo },
                  },
                  closed: {
                    opacity: 0,
                    y: -8,
                    transition: reducedMotion
                      ? { duration: 0 }
                      : { duration: motionDurations.quick, ease: easeInOutQuart },
                  },
                }}
              >
                <Magnetic className="mt-3 w-fit">
                  <RippleButton className="rounded-full">
                    <Link
                      href="/Le_Van_Duy_Resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[rgb(var(--accent))] px-5 py-2 text-sm font-medium tracking-tight text-[rgb(var(--surface-page))] transition-[transform,box-shadow,filter] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] hover:-translate-y-px hover:brightness-110 active:scale-[0.98]"
                      style={{ boxShadow: 'var(--shadow-card)' }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.boxShadow = 'var(--shadow-card)'
                      }}
                    >
                      {t('nav.resume')}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </Link>
                  </RippleButton>
                </Magnetic>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
