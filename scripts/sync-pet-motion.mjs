import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
const source = resolve(process.argv[2] || '../hatch-pet-plus')
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim()
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'pets/bunny/motion', 'pets/inko/motion'], { cwd: source, encoding: 'utf8' }).trim()
if (dirty) throw new Error('Commit accepted motion assets before syncing the source revision.')
const registry = {}, files = {}
for (const pet of ['bunny', 'inko']) {
  const manifest = JSON.parse(readFileSync(resolve(source, 'pets', pet, 'motion/manifest.json'), 'utf8'))
  if (manifest.version !== 1 || manifest.petId !== pet) throw new Error('Unexpected motion manifest')
  const target = resolve('public/pets/hatch-pet-plus', pet, 'motion')
  mkdirSync(target, { recursive: true })
  registry[pet] = manifest.clips
  for (const filename of ['manifest.json', ...Object.values(manifest.clips).map(clip => clip.file)]) {
    if (basename(filename) !== filename || filename === '..') throw new Error('Unsafe asset path')
    const src = resolve(source, 'pets', pet, 'motion', filename)
    copyFileSync(src, resolve(target, filename))
    files[`${pet}/motion/${filename}`] = createHash('sha256').update(readFileSync(src)).digest('hex')
  }
}
writeFileSync('src/data/pets/motion-catalog.json', JSON.stringify(registry, null, 2) + '\n')
writeFileSync('public/pets/hatch-pet-plus/motion-source.json', JSON.stringify({ repository: 'https://github.com/leduy-it/hatch-pet-plus', revision, files }, null, 2) + '\n')
console.log(`Synced ${Object.keys(files).length} files at ${revision}`)
