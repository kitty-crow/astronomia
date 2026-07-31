# Astronomia

A strongly typed TypeScript library for astronomical calculations based on Jean Meeus's *Astronomical Algorithms*, full VSOP87 planetary series and ELP/MPP02 lunar data.

Astronomia calculates positions, coordinate transformations, phases, eclipses, rise and set times, orbital events, physical ephemerides, calendars and numerical astronomy entirely in-process. It does not call a remote API.

## Install

```bash
npm install astronomia
```

## Use

```ts
import {
  elliptic,
  julian,
  moonposition,
  planetposition,
  solar
} from 'astronomia'
import data from 'astronomia/data'

const jde = julian.DateToJDE(new Date('2026-07-31T12:00:00Z'))
const earth = new planetposition.Planet(data.earth)
const mars = new planetposition.Planet(data.mars)

const sun = solar.apparentEquatorialVSOP87(earth, jde)
const moon = moonposition.position(jde)
const marsEquatorial = elliptic.position(mars, earth, jde)

console.log({ sun, moon, marsEquatorial })
```

Angles are normally radians. Distances are normally astronomical units for planets and kilometres for the Moon. Each API documents its frame, epoch and units.

Import one module when bundle size matters:

```ts
import julian from 'astronomia/julian'
import data from 'astronomia/data'
```

CommonJS is also generated:

```ts
const { julian, moonphase } = require('astronomia')
```

## Capabilities

- Sun, Moon, Mercury through Neptune, Pluto and planetary satellites
- heliocentric, geocentric, astrometric, apparent and topocentric positions
- ecliptic, equatorial, horizontal and galactic coordinate transforms
- lunar phases, eclipses, nodes, apsides and maximum declinations
- conjunctions, angular separation, elongations, stations and orbital extrema
- rise, transit, set, twilight, solar noon and polar-day handling
- precession, nutation, aberration, parallax and atmospheric refraction
- elliptic, parabolic and near-parabolic orbit calculations
- Julian, Gregorian, Jewish and Moslem calendar utilities
- interpolation, curve fitting, root finding and astronomical formatting

## Documentation

- [Documentation index](docs/README.md)
- [Getting started](docs/getting-started.md)
- [Time and coordinates](docs/time-and-coordinates.md)
- [Solar-system calculations](docs/solar-system.md)
- [Events and observation](docs/events-and-observation.md)
- [Orbits and numerical tools](docs/orbits-and-numerics.md)
- [Accuracy and edge cases](docs/accuracy-and-edge-cases.md)
- [API reference](docs/api-reference.md)
- [Development](docs/development.md)

## Development

All authored executable source is strict TypeScript. Relative source imports use `.ts`; TypeScript rewrites them to `.js` only in ignored build output.

```bash
npm install
npm run ci
```

`npm run ci` typechecks the source, rejects committed JavaScript, builds ESM and CommonJS with declarations, and runs the complete test suite.

## Origin

The library is derived from Sonia Keys's Go implementation of Meeus's algorithms and the original `commenthol/astronomia` JavaScript project. Existing copyright and attribution are preserved.

## Licence

MIT. See [LICENSE](LICENSE).
