declare module 'serialize-to-module' {
  interface SerialiseOptions {
    readonly esm?: boolean
  }
  export default function serialise(value: unknown, options?: SerialiseOptions): string
}

declare const process: {
  readonly argv: readonly string[]
}
