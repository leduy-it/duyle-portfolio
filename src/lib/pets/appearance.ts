import catalog from '@/data/pets/atlas-catalog.json'
import type { Species } from '@/data/pets/catalog'
export function petAppearance(species: Species, stage = 0) {
  const pet = {
    gracie: 'bunny',
    ember: 'firetail',
    mochi: 'nimbus',
    pip: 'grove-evo',
    boba: 'dewel',
    tofu: 'volt',
    "blip": "blip",
    "bot-3d-toy": "bot-3d-toy",
    "bot-clay": "bot-clay",
    "bot-flat-vector": "bot-flat-vector",
    "bot-pixel": "bot-pixel",
    "bot-plush": "bot-plush",
    "bot-sticker": "bot-sticker",
    "cobble": "cobble",
    "inko": "inko",
    "kiln": "kiln",
    "mossback": "mossback",
    "classic-pip": "pip",
    "sprig": "sprig",
    "sprocket-evo": "sprocket-evo",
    "wisp": "wisp",
  }[species]
  return {
    pet,
    file: catalog.find(entry => entry.id === pet)?.stages[Math.min(stage, (catalog.find(entry => entry.id === pet)?.stages.length || 1) - 1)].spritesheetPath || 'spritesheet.webp',
  }
}
