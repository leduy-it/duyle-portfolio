import type { Metadata } from 'next'
import { PetWorld } from '@/components/pets/pet-world'
export const metadata: Metadata = {
  title: 'The Pocket World — Duy Le',
  description:
    'Meet Gracie and friends. Hatch a companion, build a little home, make treasures, and defend the glitch garden.',
}
export default function PetsPage() {
  return <PetWorld />
}
