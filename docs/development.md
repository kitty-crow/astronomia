# Development

## Source policy

All authored executable source, tests, generated coefficient modules and maintenance scripts are TypeScript. The repository rejects tracked `.js`, `.mjs` and `.cjs` files outside ignored build output.

Relative authored imports use `.ts`:

```ts
import base from './base.ts'
```

The base compiler configuration enables:

```json
{
  "allowImportingTsExtensions": true,
  "rewriteRelativeImportExtensions": true
}
```

The emitted ESM/CommonJS therefore imports `./base.js`. Source names remain truthful without publishing unusable `.ts` specifiers in JavaScript.

## Strictness

The compiler enables strict mode plus:

- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `isolatedModules`
- `verbatimModuleSyntax`
- unreachable-code and unused-label rejection

Avoid `any`, suppression directives and unchecked tuple/index access. Add a named interface, discriminated union, overload or validation boundary instead.

## Versioning

Astronomia follows semantic versioning. Every meaningful project landmark updates `package.json` in the same change:

- **patch** for backwards-compatible fixes, documentation corrections and internal maintenance
- **minor** for backwards-compatible public functionality, modules, exports or substantial capabilities
- **major** for breaking API, runtime, package-format or behavioural changes

Versions are cumulative and incremental. Do not reuse a released version or move backwards. Release commits, tags and published packages must carry the same version.

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
npm run ci
```

`npm run ci` performs:

1. strict typechecking
2. the no-JavaScript source guard
3. clean ESM build with declarations and maps
4. CommonJS build with maps
5. the complete slow test suite

Build output is written to `dist/` and is not committed.

## Package formats

- ESM: `dist/esm`
- CommonJS: `dist/cjs`
- declarations: alongside ESM output

`package.json` subpath exports map every public module and dataset to both formats.

## Source layout

```text
src/       algorithms and public modules
data/      typed generated coefficient/data modules
scripts/   typed conversion and maintenance tools
test/      TypeScript tests and worked examples
types/     narrow declarations for tooling dependencies
docs/      user and developer documentation
dist/      generated package output, ignored
```

## Generated data

The VSOP87 and ELP coefficient modules are generated TypeScript but are checked in as source data. Changes to converter scripts must preserve:

- coefficient ordering
- numeric literal precision
- readonly tuple/record types
- deterministic output
- historical test values

Floating-point summation order is part of observable numerical compatibility.

## Updating exports

When adding a public module:

1. export it from `src/index.ts` if it belongs in the root namespace
2. add package subpath mappings for ESM, CommonJS and declarations
3. add tests
4. document units, frame, epoch and failure modes
5. update the API reference

When adding a dataset, expose it through `data/index.ts` and a direct package subpath.

## Tests

Tests are written in TypeScript and run through `tsx` and Mocha. Existing tests are also executable documentation, with worked values taken from Meeus and source datasets.

Use physically meaningful tolerances for new floating-point comparisons unless exact bit-level compatibility is the purpose of the test.
