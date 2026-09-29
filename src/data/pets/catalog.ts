export const PETS = {
  gracie: {
    name: 'Gracie',
    species: 'Moon bunny',
    vi: 'Thỏ mặt trăng',
    color: '#c8ecd8',
    accent: '#72ba94',
    drop: 'Moon dust',
    forms: ['Cotton', 'Moonbeam', 'Lunar guardian'],
    hp: 6,
    speed: 145,
    power: 2,
  },
  ember: {
    name: 'Firetail',
    species: 'Fire companion',
    vi: 'Bạn nhỏ lửa',
    color: '#ffc6a5',
    accent: '#ed8963',
    drop: 'Sun sparks',
    forms: ['Kindle', 'Wildfire', 'Solar fox'],
    hp: 5,
    speed: 170,
    power: 2,
  },
  mochi: {
    name: 'Nimbus',
    species: 'Cloud companion',
    vi: 'Bạn nhỏ mây',
    color: '#e3d3fc',
    accent: '#a889d6',
    drop: 'Dream silk',
    forms: ['Puff', 'Daydream', 'Cloud keeper'],
    hp: 7,
    speed: 135,
    power: 2,
  },
  pip: {
    name: 'Pip',
    species: 'Grove creature',
    vi: 'Bạn nhỏ rừng',
    color: '#d7edab',
    accent: '#99b75e',
    drop: 'Forest gems',
    forms: ['Pip', 'Mossback', 'Mossback +'],
    hp: 7,
    speed: 130,
    power: 3,
  },
  boba: {
    name: 'Dewel',
    species: 'Water companion',
    vi: 'Bạn nhỏ nước',
    color: '#ffc9dd',
    accent: '#da8ba9',
    drop: 'Star pearls',
    forms: ['Bubble', 'Stargazer', 'Cosmic tide'],
    hp: 8,
    speed: 120,
    power: 2,
  },
  tofu: {
    name: 'Volt',
    species: 'Electric companion',
    vi: 'Bạn nhỏ điện',
    color: '#fae3ac',
    accent: '#d3aa60',
    drop: 'Golden fluff',
    forms: ['Volt', 'Anodane', 'Anodane +'],
    hp: 6,
    speed: 145,
    power: 3,
  },
} as const
export type Species = keyof typeof PETS
export const SPECIES = Object.keys(PETS) as Species[]
export const EGGS = {
  meadow: {
    name: 'Meadow egg',
    vi: 'Trứng đồng cỏ',
    price: 80,
    wait: 45_000,
    color: '#b8deac',
    roster: ['gracie', 'tofu', 'pip'],
  },
  sunset: {
    name: 'Sunset egg',
    vi: 'Trứng hoàng hôn',
    price: 160,
    wait: 90_000,
    color: '#f5b797',
    roster: ['ember', 'boba', 'mochi'],
  },
  cosmic: {
    name: 'Cosmic egg',
    vi: 'Trứng vũ trụ',
    price: 240,
    wait: 120_000,
    color: '#c8b6eb',
    roster: ['mochi', 'pip', 'boba', 'ember', 'gracie', 'tofu'],
  },
} as const
export type EggTier = keyof typeof EGGS
export const EVOLUTION: ReadonlyArray<{
  xp: number
  materials: number
  coins: number
}> = [
  { xp: 35, materials: 12, coins: 60 },
  { xp: 100, materials: 35, coins: 150 },
] as const
export const AREAS = ['habitat', 'hatchery', 'factory', 'arena'] as const
export type Area = (typeof AREAS)[number]
