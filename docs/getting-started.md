# Getting started

## Installation

```bash
npm install astronomia
```

The package ships generated ESM, CommonJS and TypeScript declarations. No native dependency, network service or API key is required.

```ts
import { julian, moonphase } from 'astronomia'
```

Use a subpath import to avoid loading the root namespace in tools that do not tree-shake:

```ts
import julian from 'astronomia/julian'
import moonphase from 'astronomia/moonphase'
```

Planetary datasets are separate exports:

```ts
import data from 'astronomia/data'
import marsData from 'astronomia/data/vsop87Bmars'
```

CommonJS consumers receive the generated CommonJS build through the same package exports:

```ts
const { julian, solar } = require('astronomia')
const data = require('astronomia/data').default
```

## Dates: convert once, calculate many times

Most algorithms accept a Julian day (`jd`) or Julian ephemeris day (`jde`) as a number.

```ts
import { julian } from 'astronomia'

const date = new Date('2026-07-31T12:00:00Z')
const jd = julian.DateToJD(date)
const jde = julian.DateToJDE(date)
```

Use JD for Universal-Time and civil-time calculations. Use JDE for dynamical ephemerides. See [Time and coordinates](time-and-coordinates.md) for the distinction.

A calendar object offers richer conversions:

```ts
const cal = new julian.CalendarGregorian(2026, 7, 31.5)
const jde = cal.toJDE()
const back = new julian.Calendar().fromJDE(jde)
```

Fractional calendar days carry the time of day. A JavaScript `Date` is always converted through its UTC instant.

## Instantiate planetary series

The VSOP87 data objects are immutable coefficient sets. Wrap each dataset in `planetposition.Planet` once and reuse it.

```ts
import { planetposition } from 'astronomia'
import data from 'astronomia/data'

const planets = {
  earth: new planetposition.Planet(data.earth),
  mercury: new planetposition.Planet(data.mercury),
  venus: new planetposition.Planet(data.venus),
  mars: new planetposition.Planet(data.mars),
  jupiter: new planetposition.Planet(data.jupiter),
  saturn: new planetposition.Planet(data.saturn),
  uranus: new planetposition.Planet(data.uranus),
  neptune: new planetposition.Planet(data.neptune)
}
```

The `B` datasets are referred to the J2000 ecliptic and are precessed when `position()` is requested. The `D` datasets are referred to the ecliptic of date. Both expose the same `Planet` interface.

## Sun, Moon and planet example

```ts
import {
  elliptic,
  julian,
  moonposition,
  planetposition,
  solar
} from 'astronomia'
import data from 'astronomia/data'

const date = new Date('2026-07-31T12:00:00Z')
const jde = julian.DateToJDE(date)
const earth = new planetposition.Planet(data.earth)
const mars = new planetposition.Planet(data.mars)

const sun = solar.apparentEquatorialVSOP87(earth, jde)
const moon = moonposition.position(jde)
const marsEq = elliptic.position(mars, earth, jde)
```

The result shapes differ because the algorithms describe different frames:

- `sun`: apparent geocentric equatorial `ra`, `dec`, and Earth–Sun `range` in AU
- `moon`: mean-equinox geocentric ecliptic `lon`, `lat`, and geocentric `range` in km
- `marsEq`: observed geocentric equatorial `ra` and `dec`

Do not combine coordinates until their frame, epoch and correction level match.

## Convert radians and format angles

```ts
import { base, sexagesimal as sexa } from 'astronomia'

const degrees = base.toDeg(marsEq.ra)
const rightAscension = new sexa.RA(marsEq.ra).toString(2)
const declination = new sexa.Angle(marsEq.dec).toString(1)
```

`RA` formats radians as hours. `Angle` formats radians as signed degrees. `HourAngle` represents signed hour angles, which are not interchangeable with right ascension.

## Return serialisable JSON

Astronomia returns ordinary numbers, arrays and class instances with numeric properties. Build an explicit transport shape so units and frames are not lost.

```ts
const result = {
  date: date.toISOString(),
  timeScale: 'TT',
  frame: 'apparent geocentric equatorial of date',
  bodies: {
    sun: {
      raRad: sun.ra,
      decRad: sun.dec,
      distanceAU: sun.range
    },
    moon: {
      lonRad: moon.lon,
      latRad: moon.lat,
      distanceKm: moon.range
    },
    mars: {
      raRad: marsEq.ra,
      decRad: marsEq.dec
    }
  }
}

console.log(JSON.stringify(result, null, 2))
```

Astronomia deliberately does not attach zodiac signs, house systems, human-readable body names or application-specific JSON schemas. Those belong in a wrapper layer.

## Browser use

The generated ESM build works in modern browsers through a bundler or an ESM-capable CDN. Prefer a pinned package version.

```html
<script type="module">
  import { julian, moonposition } from 'https://cdn.jsdelivr.net/npm/astronomia@4.2.0/+esm'

  const jde = julian.DateToJDE(new Date())
  console.log(moonposition.position(jde))
</script>
```

Large VSOP87 and ELP datasets materially affect download size. Import only the datasets required by the application and cache constructed `Planet`/`Moon` objects.

## TypeScript source imports

Inside this repository, relative imports name the authored source:

```ts
import base from './base.ts'
```

`rewriteRelativeImportExtensions` changes that specifier to `./base.js` in emitted ESM and CommonJS. Consumers import package subpaths and never import repository source files directly.
