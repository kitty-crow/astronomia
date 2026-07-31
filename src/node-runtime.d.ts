declare module 'node:fs' {
  export interface FileError extends Error {
    readonly code?: string
    readonly errno?: number
    readonly path?: string
  }

  export function readFile (
    path: string,
    encoding: 'utf8',
    callback: (error: FileError | null, data: string) => void
  ): void

  export function readFileSync (path: string, encoding: 'utf8'): string
}

declare module 'node:path' {
  export function resolve (...paths: string[]): string
}

declare module 'node:fs' {
  export function writeFileSync(path: string, data: string, encoding: 'utf8'): void
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string
}
