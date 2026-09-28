export function withAlpha(color: string, alpha: number) {
  if (color.startsWith('rgb(')) {
    const channels = color
      .slice(4, -1)
      .trim()
      .split(/[\s,]+/)
      .slice(0, 3)
    return `rgba(${channels.join(', ')}, ${Math.max(0, Math.min(1, alpha))})`
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const value =
      hex.length === 3
        ? hex
            .split('')
            .map((p) => `${p}${p}`)
            .join('')
        : hex
    const r = Number.parseInt(value.slice(0, 2), 16)
    const g = Number.parseInt(value.slice(2, 4), 16)
    const b = Number.parseInt(value.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return color
}
