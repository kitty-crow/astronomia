/** Convert ELP MPP02 source datasets into strongly typed TypeScript modules. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import serialise from 'serialize-to-module'
import { at, pmod } from '../src/base.ts'
import type { ElpData, ElpTerm } from '../src/elp.ts'

const here = resolve(fileURLToPath(new URL('.', import.meta.url)))
const config = { attic: resolve(here, '../attic'), out: resolve(here, '../data') }

const REGMAIN = /^MAIN PROBLEM\.\s+(LONGITUDE|LATITUDE|DISTANCE)\.\s+\d+/
const REGPERT = /^PERTURBATIONS\.\s+(LONGITUDE|LATITUDE|DISTANCE)\.\s+\d+\s+(\d+)/
const SEC2RAD = Math.PI / 180 / 3600
const A405 = 384747.961370173
const AELP = 384747.980674318

const FILES = ['ELP_MAIN.S1', 'ELP_PERT.S1', 'ELP_MAIN.S2', 'ELP_PERT.S2', 'ELP_MAIN.S3', 'ELP_PERT.S3'] as const
const TYPE_MAP = { LONGITUDE: 'L', LATITUDE: 'B', DISTANCE: 'R' } as const

type HeaderType = keyof typeof TYPE_MAP
type Coordinate = typeof TYPE_MAP[HeaderType]
type Series = Record<string, ElpTerm[]>
type ParsedData = Partial<Record<Coordinate, Series>>
type MutableTerm = [number, number, number, number, number, number]

interface Constants {
  readonly W1: readonly number[]
  readonly delaunay: readonly (readonly number[])[]
  readonly main_factor: readonly [number, number, number, number, number, number]
}

interface Thresholds extends Partial<Record<Coordinate, number>> { readonly T?: number }

const PLANETS: readonly (readonly number[])[] = [
  [4.4026086342191189, 2608.7903140599633],
  [3.1761344571511088, 1021.3285547385307],
  [1.7534699468639550, 628.30758504554319],
  [6.2034995986912955, 334.06124347172772],
  [0.59954667808842876, 52.969097211191368],
  [0.87401678344988065, 21.329907977851814],
  [5.4812276258103312, 7.4781665690567305],
  [5.3118941049906994, 3.8132918131353413]
]

const FIT_TO_DE405: Constants = {
  W1: [3.8103440908308803, 8399.6847300719292, -3.3189520425500942e-5, 3.1102494491060616e-8, -2.0328237648922845e-10],
  delaunay: [
    [5.1984667991566038, 7771.3771449908972, -3.3091588061916815e-5, 3.1058861259760758e-8, -2.0400959701089275e-10],
    [1.6279052434071115, 8433.4661574916008, -6.400616537648361e-5, -5.345216278336967e-9, -2.942819044334885e-11],
    [2.3555545503868025, 8328.69142462345, 1.5229240776232618e-4, 2.507188741546547e-7, -1.2359839986206508e-9],
    [-0.04312568785653048, 628.3019552140604, -2.6638814929085117e-6, 6.163921141626641e-10, -5.44397282517898e-11]
  ],
  main_factor: [7.887368121333579e-11, -4.170291580157736e-11, -3.86929798893506e-7, 8.644227934183025e-8, -6.135317134441178e-7, -9.559093688890348e-13]
}

function chunks (value: string, width: number): string[] {
  return value.match(new RegExp(`.{1,${width}}`, 'g')) ?? []
}

function integers (value: string, width: number): number[] {
  return chunks(value, width).map((part) => Number.parseInt(part.trim(), 10))
}

function decimals (value: string, width: number): number[] {
  return chunks(value, width).map((part) => Number.parseFloat(part.trim().replace('D', 'e')))
}

function coefficient (values: readonly number[], index: number): number {
  return values[index] ?? 0
}

class ELPMPP02 {
  private readonly dirname: string
  private readonly W1: number[]
  private readonly mainFactor: Constants['main_factor']
  private readonly delaunay: Constants['delaunay']
  private readonly zeta: number[]
  private readonly name: string
  private data: ParsedData = {}

  constructor (dirname: string, constants: Constants, name: string) {
    this.dirname = dirname
    this.W1 = [...constants.W1]
    this.mainFactor = constants.main_factor
    this.delaunay = constants.delaunay
    this.zeta = [...this.W1]
    this.zeta[1] = at(this.zeta, 1) + (5029.0966 - 0.29965) * SEC2RAD
    this.name = name
  }

  loadSync (): void {
    const text = FILES.map((file) => readFileSync(resolve(this.dirname, file), 'utf8')).join('\n')
    this.parse(text)
  }

  parse (text: string): void {
    this.data = {}
    let coordinate: Coordinate | undefined
    let series: ElpTerm[] | undefined
    let parser: 'main' | 'pert' | undefined

    for (const line of text.split(/\n/)) {
      const main = REGMAIN.exec(line)
      const pert = REGPERT.exec(line)
      if (main) {
        coordinate = TYPE_MAP[main[1] as HeaderType]
        const group = this.data[coordinate] ??= {}
        series = group['0'] = []
        parser = 'main'
      } else if (pert) {
        coordinate = TYPE_MAP[pert[1] as HeaderType]
        const pos = at(pert, 2)
        const group = this.data[coordinate] ??= {}
        series = group[pos] ??= []
        parser = 'pert'
      } else if (line.length > 0 && coordinate && series && parser) {
        series.push(parser === 'main' ? this.parseMain(coordinate, line) : this.parsePert(coordinate, line))
      }
    }

    for (const group of Object.values(this.data)) {
      if (!group) continue
      for (const rows of Object.values(group)) rows.sort((a, b) => at(b, 0) - at(a, 0))
    }
  }

  private parseMain (type: Coordinate, line: string): ElpTerm {
    const [FA, FB1, FB2, FB3, FB4, FB5] = this.mainFactor
    const del = integers(line.substring(0, 12), 3)
    const B = decimals(line.substring(27, 99), 12)
    let amplitude = Number.parseFloat(line.substring(14, 27).trim())
    if (type === 'R') amplitude -= amplitude * FA
    amplitude += FB1 * at(B, 0) + FB2 * at(B, 1) + FB3 * at(B, 2) + FB4 * at(B, 3) + FB5 * at(B, 4)

    const result: MutableTerm = [amplitude, 0, 0, 0, 0, 0]
    for (let t = 0; t <= 4; t++) {
      for (let i = 0; i < 4; i++) result[t + 1] = at(result, t + 1) + at(del, i) * coefficient(at(this.delaunay, i), t)
    }
    if (type === 'R') {
      result[0] *= A405 / AELP
      result[1] += Math.PI / 2
    }
    if (result[0] < 0) {
      result[0] = -result[0]
      result[1] += Math.PI
    }
    result[1] = pmod(result[1], 2 * Math.PI)
    return result
  }

  private parsePert (type: Coordinate, line: string): ElpTerm {
    const sine = Number.parseFloat(line.substring(5, 25).trim().replace('D', 'e'))
    const cosine = Number.parseFloat(line.substring(25, 45).trim().replace('D', 'e'))
    const row = integers(line.substring(45, 84), 3)
    const result: MutableTerm = [Math.hypot(sine, cosine), pmod(Math.atan2(cosine, sine), 2 * Math.PI), 0, 0, 0, 0]

    for (let t = 0; t <= 4; t++) {
      for (let i = 0; i < 4; i++) result[t + 1] = at(result, t + 1) + at(row, i) * coefficient(at(this.delaunay, i), t)
      for (let i = 0; i < 8; i++) result[t + 1] = at(result, t + 1) + at(row, i + 4) * coefficient(at(PLANETS, i), t)
      result[t + 1] = at(result, t + 1) + at(row, 12) * coefficient(this.zeta, t)
    }
    if (type === 'R') result[0] *= A405 / AELP
    return result
  }

  getData (): ElpData {
    return { name: this.name, W1: [...this.W1], L: this.data.L ?? {}, B: this.data.B ?? {}, R: this.data.R ?? {} }
  }

  getTruncatedData (thresholds: Thresholds): ElpData {
    const result: Record<Coordinate, Series> = { L: {}, B: {}, R: {} }
    for (const type of ['L', 'B', 'R'] as const) {
      for (const [position, rows] of Object.entries(this.data[type] ?? {})) {
        const limit = (thresholds[type] ?? 0) / Math.pow(thresholds.T ?? 1, Number.parseInt(position, 10))
        result[type][position] = rows.filter((row) => Math.abs(at(row, 0)) >= limit)
      }
    }
    return { name: this.name, W1: [...this.W1], ...result }
  }
}

function moduleText (value: ElpData): string {
  return `import type { ElpData } from '../src/elp.ts'\n\n${serialise(value, { esm: true })}`
    .replace(/};\s*export default m;\s*$/, '} satisfies ElpData\nexport default m;\n')
}

function write (name: string, value: ElpData): void {
  writeFileSync(resolve(config.out, name), moduleText(value), 'utf8')
}

const parser = new ELPMPP02(config.attic, FIT_TO_DE405, 'ElpMppDE405')
parser.loadSync()
write('elpMppDeFull.ts', parser.getData())
write('elpMppDe.ts', parser.getTruncatedData({ L: 0.001, B: 0.001, R: 0.001, T: 30 }))
