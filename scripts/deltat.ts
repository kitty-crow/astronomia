#!/usr/bin/env node
/** Generate the bundled ΔT dataset from the source tables in attic/. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import serialise from 'serialize-to-module'
import { CalendarGregorian } from '../src/julian.ts'
import { datafile } from './src/datafile.ts'

interface YearMonth { readonly year: number; readonly month: number }
type MonthlyRows = Record<number, Record<number, number>>
interface DecimalTable { table: number[]; first?: number; last?: number }
interface MonthlyTable { table: number[]; first: number; firstYM: readonly [number, number]; last: number; lastYM: readonly [number, number] }

const here = resolve(fileURLToPath(new URL('.', import.meta.url)))
const attic = resolve(here, '../attic')
const outdir = resolve(here, '../data')
const config = {
  fileHist: resolve(attic, 'historic_deltat.data'),
  filePreds: resolve(attic, 'deltat.preds'),
  fileLeapSecs: resolve(attic, 'tai-utc.dat'),
  fileFinals2000A: resolve(attic, 'finals2000A.daily.extended'),
  fileOut: resolve(outdir, 'deltat.ts'),
  comment: `/**\n * DO NOT EDIT MANUALLY\n * Use \`scripts/deltat.ts\` to generate this file.\n * Datasets are from <https://maia.usno.navy.mil/ser7> and\n * <ftp://ftp.iers.org/products/eop/rapid/standard>\n */\n`
}

function numberAt (row: readonly string[], index: number): number {
  const value = Number.parseFloat(row[index] ?? '')
  if (!Number.isFinite(value)) throw new TypeError(`invalid number at column ${index}`)
  return value
}

abstract class DataSet {
  first?: YearMonth
  last?: YearMonth
  readonly data: MonthlyRows = {}

  abstract read(file: string): this

  get (year: number, month: number): number {
    const value = this.data[year]?.[month]
    if (value === undefined) throw new RangeError(`missing data for ${year}-${month}`)
    return value
  }

  protected add (year: number, month: number, value: number): void {
    const months = this.data[year] ??= {}
    months[month] = value
    if (!this.first || year < this.first.year || (year === this.first.year && month < this.first.month)) {
      this.first = { year, month }
    }
    if (!this.last || year > this.last.year || (year === this.last.year && month > this.last.month)) {
      this.last = { year, month }
    }
  }

  bounds (): readonly [YearMonth, YearMonth] {
    if (!this.first || !this.last) throw new Error('dataset is empty')
    return [this.first, this.last]
  }
}

interface LeapEntry { readonly decYear: number; readonly taiMinusUtc: number }

export class TaiMinusUTC {
  private entries: LeapEntry[] = []

  read (file: string): this {
    const months = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const
    this.entries = []
    for (const row of readFileSync(file, 'utf8').split(/\n/)) {
      if (!/^ \d{4}/.test(row)) continue
      const year = Number.parseFloat(row.substring(1, 5))
      const month = months.indexOf(row.substring(6, 9) as typeof months[number])
      const taiMinusUtc = Number.parseFloat(row.substring(37, 49))
      if (!Number.isFinite(year) || month < 1 || !Number.isFinite(taiMinusUtc)) continue
      this.entries.push({ taiMinusUtc, decYear: toYear(year, month) })
    }
    return this
  }

  get (year: number, month: number): number {
    const target = toYear(year, month)
    let result: LeapEntry | undefined
    for (const entry of this.entries) {
      if (entry.decYear > target) break
      result = entry
    }
    if (!result) throw new RangeError(`missing TAI-UTC value for ${year}-${month}`)
    return result.taiMinusUtc
  }
}

export class Finals2000A extends DataSet {
  constructor (private readonly tai: TaiMinusUTC) { super() }

  read (file: string): this {
    for (const row of datafile(file, [[0, 2], [2, 4], [4, 6], [58, 68]])) {
      let year = numberAt(row, 0)
      const month = numberAt(row, 1)
      const day = numberAt(row, 2)
      const ut1MinusUtc = numberAt(row, 3)
      year += year > 72 ? 1900 : 2000
      if (day !== 1) continue
      this.add(year, month, toPrecision(32.184 + this.tai.get(year, month) - ut1MinusUtc, 7))
    }
    return this
  }
}

export class Data extends DataSet {
  constructor (private readonly finals: Finals2000A) { super() }
  read (_file: string): this { return this }

  mergeFinals (): this {
    const [first, last] = this.finals.bounds()
    for (let year = first.year; year <= last.year; year++) {
      const start = year === first.year ? first.month : 1
      const end = year === last.year ? last.month : 12
      for (let month = start; month <= end; month++) this.add(year, month, this.finals.get(year, month))
    }
    return this
  }

  toData (): MonthlyTable {
    const [first, last] = this.bounds()
    const table: number[] = []
    for (let year = first.year; year <= last.year; year++) {
      const start = year === first.year ? first.month : 1
      const end = year === last.year ? last.month : 12
      for (let month = start; month <= end; month++) table.push(this.get(year, month))
    }
    return {
      table,
      first: toYear(first.year, first.month),
      firstYM: [first.year, first.month],
      last: toYear(last.year, last.month),
      lastYM: [last.year, last.month]
    }
  }
}

abstract class DataSetDec {
  readonly data: DecimalTable = { table: [] }
  abstract read(file: string): this
  protected add (year: number, deltaT: number): void {
    this.data.first ??= year
    this.data.table.push(deltaT)
    this.data.last = year
  }
}

export class Historic extends DataSetDec {
  read (file: string): this {
    for (const row of datafile(file, [[0, 11], [11, 20]])) this.add(numberAt(row, 0), numberAt(row, 1))
    return this
  }
}

export class Prediction extends DataSetDec {
  read (file: string): this {
    const correction = 70.91 - 69.30818
    const rows = datafile(file).slice(1)
    for (const row of rows) {
      const year = numberAt(row, 0)
      if (year >= 2022) this.add(year, numberAt(row, 1) - correction)
    }
    return this
  }
}

function toPrecision (value: number, decimals: number): number {
  return Number.parseFloat(value.toFixed(decimals))
}

function toYear (year: number, month: number): number {
  return new CalendarGregorian(year, month, 1).toYear()
}

function typedModule (value: unknown): string {
  return serialise(value, { esm: true })
    .replace('const m = {', 'const m = {')
    .replace(/};\s*export default m;\s*$/, '} as const\nexport default m;\n')
}

export function main (): void {
  const tai = new TaiMinusUTC().read(config.fileLeapSecs)
  const finals = new Finals2000A(tai).read(config.fileFinals2000A)
  const result = {
    historic: new Historic().read(config.fileHist).data,
    data: new Data(finals).mergeFinals().toData(),
    prediction: new Prediction().read(config.filePreds).data
  }
  writeFileSync(config.fileOut, config.comment + typedModule(result), 'utf8')
}

const invoked = process.argv[1]
if (invoked && resolve(invoked) === fileURLToPath(import.meta.url)) main()
