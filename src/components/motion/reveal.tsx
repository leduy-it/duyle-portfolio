'use client'

import { useHomeMotionPreferences } from '@/components/home/home-motion'

import { motion } from 'motion/react'
import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { entrancePose,settledPose,useMotionSeed,motionPattern } from './entrance-patterns'
import { easeOutExpo, motionDurations } from './easings'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
  staggerChildren?: number
  threshold?: number
}

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  staggerChildren = 0,
  threshold = 0.2,
}: RevealProps) {
  const { prefersReducedMotion: reducedMotion } = useHomeMotionPreferences()
  const seed=useMotionSeed()
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(reducedMotion)
  const childCount = Children.count(children)
  const shouldStagger = staggerChildren > 0 && childCount > 1

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    const node = ref.current
    if (!node) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setIsVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -8% 0px',
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [once, reducedMotion, threshold])

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  const containerVariants = shouldStagger
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: {
          ...settledPose,
          transition: {
            delay,
            duration: motionDurations.reveal,
            ease: easeOutExpo,
            staggerChildren:0,
            delayChildren:0,
          },
        },
      }
    : {
        hidden:entrancePose(seed),
        visible: {
          ...settledPose,
          transition: {
            delay,
            duration: motionDurations.reveal,
            ease: easeOutExpo,
          },
        },
      }

  const itemVariants = {
    hidden:(index:number)=>entrancePose(seed,index),
    visible:(index:number)=>({...settledPose,transition:{duration:motionDurations.reveal,ease:easeOutExpo,delay:delay+Math.min(staggerChildren,.04)*(index%6)}}),
  }

  const renderedChildren = shouldStagger
    ? Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return (
            <motion.div key={`reveal-child-${index}`} variants={itemVariants}>
              {child}
            </motion.div>
          )
        }

        return child
      })
    : children

  return (
    <motion.div
      ref={ref} data-entrance-pattern={motionPattern(seed)}
      className={className}
      initial="hidden"
      animate={reducedMotion || isVisible ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {shouldStagger
        ? Children.map(renderedChildren, (child, index) => (
            <motion.div key={`reveal-wrap-${index}`} custom={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : renderedChildren}
    </motion.div>
  )
}
