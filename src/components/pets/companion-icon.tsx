export function CompanionIcon({hidden = false}: {hidden?: boolean}) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 14c-2 1-3 3-2 5 1 2 3 1 6 1s5 1 6-1c1-2 0-4-2-5l-2-2h-4Z" />
    <ellipse cx="5.5" cy="10" rx="2" ry="2.5" transform="rotate(-20 5.5 10)" /><ellipse cx="10" cy="6" rx="2" ry="2.5" /><ellipse cx="15" cy="6" rx="2" ry="2.5" /><ellipse cx="19" cy="10" rx="2" ry="2.5" transform="rotate(20 19 10)" />
    {hidden && <path d="m3 3 18 18" strokeWidth="2" />}
  </svg>
}
