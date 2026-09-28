'use client'

import type { CSSProperties } from 'react'

export type GraciePose = 'idle' | 'greeting' | 'thinking' | 'ready' | 'error'

export function GracieSprite({
  pose = 'idle',
  stage = 0,
  reducedMotion = false,
  className = '',
}: {
  pose?: GraciePose
  stage?: number
  reducedMotion?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      aria-hidden="true"
      className={`gracie-art ${className}`}
      data-pose={pose}
      data-still={reducedMotion}
    >
      <ellipse cx="61" cy="127" rx="32" ry="6" fill="#000" opacity=".18" />
      {stage > 0 && (
        <ellipse
          cx="60"
          cy="97"
          rx="49"
          ry="37"
          fill={stage === 2 ? '#e6c178' : '#abe7ce'}
          opacity=".12"
        />
      )}
      <g className="gracie-body">
        <circle cx="94" cy="100" r="13" fill="#FFF6E7" stroke="#423642" strokeWidth="3" />
        <ellipse cx="61" cy="101" rx="27" ry="26" fill="#F7EBD8" stroke="#423642" strokeWidth="3" />
        <ellipse cx="61" cy="106" rx="17" ry="16" fill="#FFF9EE" />
        <g
          className="gracie-ear gracie-ear-left"
          style={{ transformOrigin: '44px 57px' } as CSSProperties}
        >
          <path
            d="M43 64C33 48 26 12 37 9C50 5 55 39 53 59"
            fill="#FFF6E7"
            stroke="#423642"
            strokeWidth="3"
          />
          <path d="M43 49C38 34 34 18 38 17C43 15 48 36 48 49" fill="#F2B0B8" />
        </g>
        <g
          className="gracie-ear gracie-ear-right"
          style={{ transformOrigin: '73px 58px' } as CSSProperties}
        >
          <path
            d="M67 59C65 38 73 5 84 11C97 19 82 49 78 65"
            fill="#FFF6E7"
            stroke="#423642"
            strokeWidth="3"
          />
          <path d="M73 49C74 36 78 18 83 19C89 21 79 42 78 51" fill="#F2B0B8" />
        </g>
        <path
          d="M28 75C28 53 42 46 59 46C80 46 93 59 93 78C93 96 77 104 60 103C41 102 28 92 28 75Z"
          fill="#FFF6E7"
          stroke="#423642"
          strokeWidth="3"
        />
        <path d="M37 59L45 53M78 55L83 59" stroke="#FFFDF7" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="39" cy="82" rx="7" ry="4" fill="#F3B6B9" opacity=".8" />
        <ellipse cx="80" cy="82" rx="7" ry="4" fill="#F3B6B9" opacity=".8" />
        <g
          style={{
            transform: 'translate(var(--gracie-look-x, 0px), var(--gracie-look-y, 0px))',
          }}
        >
          <g className="gracie-eyes" style={{ transformOrigin: '60px 73px' }}>
            <ellipse cx="46" cy="73" rx="4" ry="6" fill="#392F3D" />
            <ellipse cx="74" cy="73" rx="4" ry="6" fill="#392F3D" />
            <circle cx="47" cy="71" r="1.3" fill="white" />
            <circle cx="75" cy="71" r="1.3" fill="white" />
          </g>
        </g>
        {stage === 2 && (
          <path
            d="m48 46 1-10 7 5 5-11 6 11 7-5-1 10Z"
            fill="#edc873"
            stroke="#886e42"
            strokeWidth="1.5"
          />
        )}
        <path d="M57 82Q60 79 63 82L60 85Z" fill="#D18391" />
        <path
          d="M60 85Q56 91 53 87M60 85Q64 91 67 87"
          stroke="#684754"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          cx="39"
          cy="113"
          rx="9"
          ry="6"
          fill="#FFF6E7"
          stroke="#423642"
          strokeWidth="2.5"
          transform="rotate(-18 39 113)"
        />
        <ellipse
          cx="81"
          cy="113"
          rx="9"
          ry="6"
          fill="#FFF6E7"
          stroke="#423642"
          strokeWidth="2.5"
          transform="rotate(18 81 113)"
        />
        <ellipse
          cx="44"
          cy="124"
          rx="13"
          ry="6"
          fill="#FFF6E7"
          stroke="#423642"
          strokeWidth="2.5"
        />
        <ellipse
          cx="76"
          cy="124"
          rx="13"
          ry="6"
          fill="#FFF6E7"
          stroke="#423642"
          strokeWidth="2.5"
        />
        <path d="M54 98L61 103L54 108Z" fill="#74DCC4" />
        <path d="M68 98L61 103L68 108Z" fill="#74DCC4" />
        <circle cx="61" cy="103" r="3" fill="#46B79D" />
      </g>
      {pose === 'thinking' && (
        <g className="gracie-thought" fill="#9AEDD7">
          <circle cx="96" cy="47" r="3" />
          <circle cx="104" cy="38" r="4" />
          <circle cx="110" cy="26" r="5" />
        </g>
      )}
      {(pose === 'ready' || pose === 'greeting') && (
        <path
          className="gracie-spark"
          d="M105 65L108 72L115 75L108 78L105 85L102 78L95 75L102 72Z"
          fill="#F5C96A"
        />
      )}
      {pose === 'error' && (
        <path d="M100 47V55M100 60V61" stroke="#F5A394" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  )
}
