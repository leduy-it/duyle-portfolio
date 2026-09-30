'use client'

import { useHomeMotionPreferences } from '@/components/home/home-motion'

import Link, { type LinkProps } from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from 'react'


type AnchorProps = Omit<ComponentPropsWithoutRef<'a'>, keyof LinkProps | 'href'>

type SmoothLinkProps = AnchorProps &
  LinkProps & {
    children: ReactNode
  }

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>
  }
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  )
}

export const SmoothLink = forwardRef<HTMLAnchorElement, SmoothLinkProps>(function SmoothLink(
  { children, href, onClick, replace = false, scroll = true, target, ...props },
  ref
) {
  const router = useRouter()
  const pathname = usePathname()
  const { prefersReducedMotion: reducedMotion } = useHomeMotionPreferences()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || reducedMotion || target === '_blank') {
      return
    }

    if (!isPlainLeftClick(event) || typeof href !== 'string' || typeof window === 'undefined') {
      return
    }

    const destination = new URL(href, window.location.href)
    if (destination.origin !== window.location.origin) {
      return
    }

    if (
      destination.pathname === pathname &&
      destination.search === window.location.search &&
      destination.hash === window.location.hash
    ) {
      return
    }

    const documentWithTransitions = document as ViewTransitionDocument
    if (typeof documentWithTransitions.startViewTransition !== 'function') {
      return
    }

    event.preventDefault()

    const navigate = () => {
      const nextHref = `${destination.pathname}${destination.search}${destination.hash}`
      if (replace) {
        router.replace(nextHref, { scroll })
        return
      }

      router.push(nextHref, { scroll })
    }

    documentWithTransitions.startViewTransition(navigate)
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={handleClick}
      replace={replace}
      scroll={scroll}
      target={target}
      {...props}
    >
      {children}
    </Link>
  )
})
