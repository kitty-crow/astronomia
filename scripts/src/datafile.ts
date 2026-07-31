import { readFileSync } from 'node:fs'

export type ColumnBreak = readonly [start: number, end: number]

function splitRows (rows: readonly string[], breaks: readonly ColumnBreak[]): string[][] {
  return rows.map((line) => breaks.map(([start, end]) => line.substring(start, end).trim()))
}

/** Split a fixed-width or tab-separated data file into rows and columns. */
export function datafile (filename: string, breaks?: readonly ColumnBreak[]): string[][] {
  const content = readFileSync(filename, 'utf8')
  const rows = content.split(/[\n\r]/)
  return breaks ? splitRows(rows, breaks) : rows.map((line) => line.split('\t'))
}
