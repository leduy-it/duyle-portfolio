import { PETS, type Species } from '@/data/pets/catalog'

// Original 20x22 sprites, shared by SVG habitat and Canvas arena.
const faces: Record<Species, string[]> = {
  gracie: [
    '     oo     oo      ',
    '    oAAo   oAAo     ',
    '    oAPo   oPAo     ',
    '    oAPo   oPAo     ',
    '    oAAo   oAAo     ',
    '     oAooooAAo      ',
    '    oAAAAAAAAAo     ',
    '   oAAAAAAAAAAAo    ',
    '  oAAAAABAAAAAAAo   ',
    '  oAAooAAAooAAAAo   ',
    '  oAAooAAAooAAAAo   ',
    '  oAPPAApAAAPPAAo   ',
    '   oAAAwwwAAAAAo    ',
    '    oAAAAAAAAAo     ',
    '    oAAAccAAAAo     ',
    '   oAAAAccAAAAAo    ',
    '  oAAAoAAAAoAAAAo   ',
    '  oAAAoAAAAoAAAAo   ',
    '   oAAAAAAAAAAAo    ',
    '   oAAAooooAAAAo    ',
    '  oAAAAo  oAAAAAo   ',
    '   oooo    ooooo    ',
  ],
  ember: [
    '   oo          oo   ',
    '  oAAo        oAAo  ',
    '  oABAo      oABAo  ',
    '  oABBAooooooABBAo  ',
    '  oAAAAAAAAAAAAAAo  ',
    '   oAAAAAAAAAAAAo   ',
    '  oAAAAABAAAAAAAao  ',
    ' oAAAAAAAAAAAAAAAao ',
    ' oAAooAAAAAAooAAAo  ',
    ' oAAooAAAAAAooAAAo  ',
    ' oAAABBBBBBBBAAAAo  ',
    '  oAABBBpBBBBAAAo   ',
    '   oABBBwBBBAAAo    ',
    '    oBBBBBBAAAo ooo ',
    '    oAABBAAAAooAAABo',
    '   oAAABBAAAoAAAABBo',
    '   oAAABBAAAAoAABBBo',
    '   oAAAAAAAAAAoBBBo ',
    '   oAAAAAAAAAAoooo  ',
    '   oAAAooooAAAoo    ',
    '   oAAAo  oAAAAo    ',
    '    ooo    oooo     ',
  ],
  mochi: [
    '   oo          oo   ',
    '  oAAo        oAAo  ',
    '  oAPAo      oAPAo  ',
    '  oAAPAo    oPAAAo  ',
    '  oAAAAooooooAAAAo  ',
    '  oAAAAAAAAAAAAAAo  ',
    ' oAAAAAABAAAAAAAAAo ',
    ' oAAAAAABAAAAAAAAAo ',
    ' oAAooAAAAAAooAAAAo ',
    ' oAAooAAAAAAooAAAAo ',
    ' oAPPAABpBAAAPPAAAo ',
    '  oAAAABwBAAAAAAAo  ',
    '   oAAAAAAAAAAAAo   ',
    '    oAAAAAAAAAAo    ',
    '    oAABBBBAAAAo    ',
    '   oAAABBBBAAAAAo   ',
    '   oAAABBBBAAAAAo oo',
    '   oAAAAAAAAAAAAooAo',
    '   oAAAAAAAAAAAAAAAo',
    '   oAAAAooooAAAAooo ',
    '   oAAAAo  oAAAAo   ',
    '    oooo    oooo    ',
  ],
  pip: [
    '         cc         ',
    '      cccAccc       ',
    '     cAAABAAAc      ',
    '      ccBAAcc       ',
    '        oBo         ',
    '    ooooAAoooo      ',
    '   oAAAAAAAAAAo     ',
    '  oAAAAABAAAAAAo    ',
    '  oAAooAAAAooAAo    ',
    '  oAAooAAAAooAAo    ',
    '  oAPPAApAAAPPAAo   ',
    '   oAAAwwwAAAAo     ',
    '   ooAAAAAAAoo      ',
    '  ocoBBBBBBBocoo    ',
    ' ocAcoBBBBBocAAco   ',
    'ocAAAoBBBBBoAAAAco  ',
    ' occoAAAAAAAoocco   ',
    '    oAAAAAAAAAo     ',
    '   oAAAABBAAAAAo    ',
    '   oAAAooooAAAAo    ',
    '   oAAAo  oAAAAo    ',
    '    ooo    oooo     ',
  ],
  boba: [
    '  PP            PP  ',
    ' PAPP          PPAP ',
    '  PAPP        PPAP  ',
    '   PAooooooooAAP    ',
    ' PPooAAAAAAAAAooPP  ',
    'PAPPAAAAAAAAAAPAPP  ',
    ' PPAAAAAAAAAAAAPP   ',
    '  oAAAAABAAAAAAAo   ',
    ' PoAAooAAAAooAAoP   ',
    'PAPAAooAAAAooAAPAP  ',
    ' PoAPPApAAAPPAAP    ',
    '  oAAAAwwwAAAAAAo   ',
    '   oAAAAAAAAAAAo    ',
    '    oAAABBAAAAo     ',
    '   oAAAABBAAAAAo    ',
    '   oAAAABBAAAAAo    ',
    '    oAAAAAAAAAo PP  ',
    '    oAAAAAAAAAoPAP  ',
    '    oAAAAAAAAAAPAP  ',
    '    oAAAooooAAAAo   ',
    '    oAAAo  oAAAo    ',
    '     ooo    ooo     ',
  ],
  tofu: [
    '      oooooooo      ',
    '   oooAAAAAAAooo    ',
    '  oCCAAAAAAAAACCo   ',
    ' oCCCAAAAAAAAACCCo  ',
    ' oCCCAAAAAAAAACCCo  ',
    ' oCCAAAAABAAAAACCo  ',
    ' oCCAAAAAAAAAAACCo  ',
    ' oCCAAAooAAooAACCo  ',
    '  oCAAABBAABBAACo   ',
    '  oAAAPPBpBPPAAA o  ',
    '   oAAAABwBAAAAo    ',
    '    oAAAAAAAAAo     ',
    '    oAAAccAAAAo     ',
    '   oAAAAccAAAAAo    ',
    '  oAAAABBBBAAAAAo   ',
    '  oAAAABBBBAAAAAo   ',
    '   oAAAAAAAAAAAoo   ',
    '   oAAAAAAAAAAAAAo  ',
    '   oAAAAAAAAAAAoo   ',
    '   oAAAAooooAAAAo   ',
    '   oAAAAo  oAAAAo   ',
    '    oooo    oooo    ',
  ],
}
export function pixels(species: Species) {
  return faces[species].flatMap((row, y) =>
    [...row].flatMap((key, x) => (key === ' ' ? [] : [{ x, y, key }]))
  )
}
export function palette(species: Species): Record<string, string> {
  const p = PETS[species]
  return {
    o: '#38473e',
    A: p.color,
    B: '#fff5dc',
    P: '#efb1b7',
    p: '#9c6675',
    w: '#77555f',
    a: p.accent,
    c: p.accent,
    C: '#b6926b',
  }
}
export function PixelPet({
  species,
  stage = 0,
  className = '',
}: {
  species: Species
  stage?: number
  className?: string
}) {
  const colors = palette(species)
  return (
    <svg
      viewBox="-3 -4 26 29"
      aria-hidden="true"
      className={`pixel-pet ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="10" cy="23" rx="8" ry="1.5" fill="#16332e" opacity=".15" />
      {stage > 0 && (
        <g fill={stage === 2 ? '#f8cc61' : '#dfcbfa'}>
          <path d="M0 4h1V3h1v1h1v1H2v1H1V5H0zm20 8h1V7h1v1h1v1h-1v1h-1V9h-1Z" />
          {stage === 2 && <path d="m6-3 2 2 2-3 2 3 2-2v5H6Z" />}
        </g>
      )}
      <g className="pixel-pet-body">
        {pixels(species).map((p) => (
          <rect
            key={`${p.x}-${p.y}`}
            x={p.x}
            y={p.y}
            width="1"
            height="1"
            fill={colors[p.key] || colors.A}
          />
        ))}
      </g>
    </svg>
  )
}
export function PixelEgg({
  color = '#b8deac',
  cracking = false,
}: {
  color?: string
  cracking?: boolean
}) {
  return (
    <svg
      viewBox="0 0 20 24"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={`pixel-egg ${cracking ? 'is-cracking' : ''}`}
    >
      <ellipse cx="10" cy="22" rx="7" ry="1.5" fill="#16332e" opacity=".15" />
      <path
        d="M8 2h4v2h2v2h2v4h1v8h-2v2H5v-2H3v-8h1V6h2V4h2Z"
        fill={color}
        stroke="#465740"
        strokeWidth="1"
      />
      <path d="M8 4h3v2H8v2H6V6h2Z" fill="#fff7db" />
      <path d="M12 8h2v3h-3V9h1ZM5 13h3v3H5Zm6 3h4v2h-4Z" fill="#fff7db" opacity=".8" />
      {cracking && <path d="m9 2 2 5-3 3 4 3-2 7" fill="none" stroke="#465740" strokeWidth="1" />}
    </svg>
  )
}
