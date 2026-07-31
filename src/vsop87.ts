/**
 * @copyright 2016 commenthol
 * @license MIT
 * @module vsop87
 */
/**
 * Converts VSOP87 data files to TypeScript-compatible data structures.
 */

import { readFile, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { VSOPTerm } from './planetposition.ts'

const REGVSOP = /^\sVSOP87.*VARIABLE (\d) \((LBR|XYZ)\).{1,20}\*T\*\*(\d)\s{1,20}(\d{1,20}) TERMS/

const extensions = {
  mercury: 'mer',
  venus: 'ven',
  earth: 'ear',
  mars: 'mar',
  jupiter: 'jup',
  saturn: 'sat',
  uranus: 'ura',
  neptune: 'nep'
} as const

export type VSOPPlanetName = keyof typeof extensions
export type VSOPCoordinate = 'L' | 'B' | 'R' | 'X' | 'Y' | 'Z'
export type VSOPData = Partial<Record<VSOPCoordinate, Record<string, VSOPTerm[]>>>
export interface VSOPOptions {
  readonly type?: string
}
export type LoadCallback = (error: Error | null) => void

const toFloat = (value: string): number => Number.parseFloat(value)

function isPlanetName (planet: string): planet is VSOPPlanetName {
  return Object.prototype.hasOwnProperty.call(extensions, planet)
}

function isCoordinate (value: string): value is VSOPCoordinate {
  return value === 'L' || value === 'B' || value === 'R' ||
    value === 'X' || value === 'Y' || value === 'Z'
}

export class VSOP {
  readonly planet: VSOPPlanetName
  readonly dirname: string
  readonly type: string
  private data: VSOPData = {}

  /**
   * Load VSOP87 planet data from VSOP87 files.
   * Data can be obtained from ftp://cdsarc.u-strasbg.fr/pub/cats/VI%2F81/
   */
  constructor (planet: string, dirname: string, opts: VSOPOptions = {}) {
    const normalised = planet.toLowerCase()
    if (!isPlanetName(normalised)) {
      throw new RangeError(`Invalid planet ${planet}`)
    }
    this.planet = normalised
    this.dirname = dirname
    this.type = opts.type ?? 'B'
  }

  private getExtension (): string {
    return extensions[this.planet]
  }

  load (cb: LoadCallback): void {
    const filename = resolve(this.dirname, `VSOP87${this.type}.${this.getExtension()}`)
    readFile(filename, 'utf8', (error, data) => {
      if (!error) this.parse(data)
      cb(error)
    })
  }

  loadSync (): void {
    const filename = resolve(this.dirname, `VSOP87${this.type}.${this.getExtension()}`)
    this.parse(readFileSync(filename, 'utf8'))
  }

  parse (source: string): void {
    const data: VSOPData = {}
    let ref: VSOPTerm[] | undefined

    for (const line of source.split('\n')) {
      const match = REGVSOP.exec(line)
      if (match) {
        const variableIndex = Number(match[1]) - 1
        const coordinate = match[2]?.charAt(variableIndex) ?? ''
        const order = match[3]
        if (!isCoordinate(coordinate) || order === undefined) {
          throw new SyntaxError(`Invalid VSOP header: ${line}`)
        }
        const series = data[coordinate] ?? (data[coordinate] = {})
        ref = series[order] = []
        continue
      }

      if (line.length > 79 && ref) {
        ref.push([
          toFloat(line.slice(79, 97).trim()),
          toFloat(line.slice(98, 111).trim()),
          toFloat(line.slice(111, 131).trim())
        ])
      }
    }

    this.data = data
  }

  getData (): Readonly<VSOPData> {
    return this.data
  }
}

export default {
  VSOP
}
