export function HabitatArt() {
  return (
    <svg
      viewBox="0 -20 800 500"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="habitat-art"
      shapeRendering="crispEdges"
    >
      <defs>
        <pattern id="grass" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M8 20v-4m4 4v-6m-2 7v-3" stroke="#93ac69" strokeWidth="2" />
          <rect x="32" y="34" width="3" height="3" fill="#dfe6ab" />
        </pattern>
      </defs>
      <path fill="#abc486" d="M0 0h800v460H0z" />
      <path fill="#bacf91" d="M0 0h800v80H0z" />
      <path fill="url(#grass)" d="M0 0h800v460H0z" />
      <path d="M270 460V270h-30v-40h50v-70h80v100h130v55H350v145Z" fill="#dace9f" />
      <path
        d="M280 450V280h50v-30h160"
        fill="none"
        stroke="#e9deb9"
        strokeWidth="6"
        strokeDasharray="12 18"
      />
      <g transform="translate(62 50)">
        <path d="M10 85h195v18H10Z" fill="#667f57" opacity=".4" />
        <path d="M27 13h146v79H27Z" fill="#f8e8bd" />
        <path d="M12 14V-4h15v-15h20v-15h106v15h20v15h15v18Z" fill="#947393" />
        <path d="M27-3v-15h20v-14h106v14h20v15Z" fill="#b28eaa" />
        <path d="M37-3h120M54-19h86" stroke="#d0b2c0" strokeWidth="5" />
        <path d="M85 90V40h38v50" fill="#84674c" />
        <path d="M91 48h24v31H91Z" fill="#9e845a" />
        <rect x="114" y="66" width="4" height="4" fill="#efd594" />
        <path
          d="M42 31h28v29H42Zm96 0h23v29h-23Z"
          fill="#7daaaa"
          stroke="#ddc792"
          strokeWidth="5"
        />
        <path d="M55 32v27m-13-14h28m79-13v27m-12-14h25" stroke="#fff0c7" strokeWidth="3" />
        <path d="M21 88h161v7H21Z" fill="#d0b587" />
        <path d="M143-30v-28h16v40" fill="#a57c7b" />
        <g className="habitat-smoke" fill="#e6ecd5" opacity=".7">
          <rect x="144" y="-74" width="12" height="9" />
          <rect x="151" y="-93" width="15" height="10" />
        </g>
      </g>
      <g transform="translate(543 191)">
        <path d="M0 20h145v20h27v57h-24v20H0V99h-20V44H0Z" fill="#7da989" />
        <path d="M9 29h127v18h24v41h-25v18H10V89H-9V49H9Z" fill="#84bcbc" />
        <path d="M22 39h99v15h23v30h-22v11H22V82H3V55h19Z" fill="#9accbf" />
        <g className="habitat-water" fill="#d8e6c1">
          <path d="M25 64h32v3H25zm43 21h45v3H68zm28-35h30v3H96Z" />
        </g>
        <path d="M100 75h21v11h-21Z" fill="#79a46b" />
        <path d="M111 69h6v6h-6Z" fill="#f6c5c1" />
      </g>
      <g fill="#739459">
        {[18, 380, 650, 710, 760].map((x, i) => (
          <g key={x} transform={`translate(${x} ${30 + (i % 2) * 23})`}>
            <path d="M-5 18h10v32H-5Z" fill="#947e57" />
            <path d="M-21 10V-7h10v-12h22V-7h10v17h-7v14h-28V10Z" />
            <path d="M-12-4v-9H8v9h10V6H4V-4Z" fill="#a1bc77" />
            <rect x="-11" y="11" width="6" height="6" fill="#f0bb86" />
          </g>
        ))}
      </g>
      <g transform="translate(60 321)">
        <path d="M0 0h144v64H0Z" fill="#8e7750" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(15 ${10 + i * 20})`}>
            <path d="M0 10h112" stroke="#b09667" strokeWidth="5" />
            {[8, 36, 64, 92].map((x) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <path d="M0 5V0h5v5h5v5H-5V5Z" fill="#b3ce88" />
                <rect y="8" width="4" height="6" fill="#e3a173" />
              </g>
            ))}
          </g>
        ))}
      </g>
      <g stroke="#eee2b7" strokeWidth="7">
        <path d="M20 425h130m430 0h200M30 413v25m30-25v25m30-25v25m30-25v25m30-25v25m440-25v25m30-25v25m30-25v25m30-25v25m30-25v25m30-25v25m30-25v25" />
      </g>
      <g fill="#f6e5ac">
        {[350, 398, 500, 478, 722, 36].map((x, i) => (
          <g key={x} transform={`translate(${x} ${110 + i * 47})`}>
            <rect width="4" height="12" x="4" />
            <rect width="12" height="4" y="4" />
          </g>
        ))}
      </g>
    </svg>
  )
}
