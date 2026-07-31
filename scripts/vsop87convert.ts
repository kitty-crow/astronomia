/** Convert VSOP87 source datasets into strongly typed TypeScript modules. */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import serialise from 'serialize-to-module'
import { VSOP, type VSOPData } from '../src/vsop87.ts'
import type { VSOPType } from '../src/planetposition.ts'

const here = resolve(fileURLToPath(new URL('.', import.meta.url)))
const config = {
  attic: resolve(here, '../attic'),
  out: resolve(here, '../data')
}

const planets = [
  'mercury', 'venus', 'earth', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune'
] as const

type PlanetName = typeof planets[number]

function moduleText (value: Readonly<VSOPData>): string {
  const text = serialise(value, { esm: true })
  return `import type { VSOP87Planet } from '../src/planetposition.ts'\n\n${text}`
    .replace('const m = {', 'const m = {')
    .replace(/};\s*export default m;\s*$/, '} satisfies VSOP87Planet\nexport default m;\n')
}

function filename (planet: PlanetName, type: VSOPType): string {
  return resolve(config.out, `vsop87${type}${planet}.ts`)
}

function convertPlanet (planet: PlanetName, type: VSOPType): void {
  console.log(`converting ${planet}`)
  const parser = new VSOP(planet, config.attic, { type })
  parser.loadSync()
  const data = { ...parser.getData(), name: planet, type }
  writeFileSync(filename(planet, type), moduleText(data), 'utf8')
}

for (const type of ['B', 'D'] as const) {
  for (const planet of planets) convertPlanet(planet, type)
}
