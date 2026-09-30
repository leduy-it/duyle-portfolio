import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  {
    ignores: ['.next-build/**', '.vercel/**', 'reference/checkouts/**'],
  },
]

export default config
