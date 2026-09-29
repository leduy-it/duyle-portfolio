import type { Species } from '@/data/pets/catalog'
export function petAppearance(species: Species, stage = 0) {
  const pet = {
    gracie: 'bunny',
    ember: 'firetail',
    mochi: 'nimbus',
    pip: 'grove-evo',
    boba: 'dewel',
    tofu: 'volt',
  }[species]
  return {
    pet,
    file:
      pet === 'grove-evo'
        ? `stage-${Math.min(stage + 1, 2)}.webp`
        : pet === 'volt'
          ? `stage-${stage > 0 ? 2 : 1}.webp`
          : 'spritesheet.webp',
  }
}
