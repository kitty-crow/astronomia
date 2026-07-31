# Events and observation

## Lunar phases

`moonphase` returns JDE values for new moon, first quarter, full moon and last quarter.

```ts
import { moonphase } from 'astronomia'

const fullMoonJde = moonphase.full(2026.58)
```

The argument is a decimal year used to select the nearest lunation. `meanNew`, `meanFirst`, `meanFull` and `meanLast` return mean phases; the short names apply periodic corrections.

A decimal year is not a Julian day. Convert the returned JDE with `julian.JDEToDate` or `Calendar.fromJDE`.

## Eclipses

`eclipse.solar(year)` and `eclipse.lunar(year)` compute eclipse circumstances near the supplied decimal year and identify the event type.

Possible solar classifications include partial, annular, annular-total and total. A result may indicate that no eclipse occurs near the selected lunation. Lunar results include umbral/penumbral magnitudes and contact-related quantities.

These are geometric predictions; local visibility requires observer position, horizon and time-zone handling outside the eclipse module.

## Lunar apsides, nodes and declination

- `apsis.perigee` / `apogee`: nearest true lunar apsis
- `apsis.meanPerigee` / `meanApogee`: mean apsis
- `apsis.perigeeParallax` / `apogeeParallax`: horizontal parallax at the event
- `moonnode.ascending` / `descending`: node passages
- `moonmaxdec.north` / `south`: maximum lunar declination

Each API selects an event through a decimal year or lunation-related parameter. Inspect the returned JDE rather than assuming the event lies inside a specific civil month.

## Equinoxes, solstices and solar longitude

`solstice.march`, `june`, `september` and `december` provide polynomial estimates. The `*2` variants refine using VSOP87 Earth data.

`solstice.longitude(year, earth, lon)` searches for an arbitrary geocentric solar longitude. The longitude is radians and must represent the intended seasonal angle.

The fast formulae have an explicitly limited high-accuracy interval. Use the VSOP-backed variants when precision or dates outside that interval matter.

## Angular separation and close approaches

`angle` supports multiple separation algorithms:

- direct spherical separation
- haversine separation for small angles
- Pauwels's method
- minimum separation from three sampled positions
- relative position angle

`minSepRect` is an approximation based on rectangularised coordinates and can fail to converge or become invalid for extremely close geometry. Prefer the haversine/Pauwels variants near small separations.

The three-sample minimum functions assume the motion is represented adequately by the supplied interval. A true minimum outside the sample span will not be discovered.

## Conjunctions

`conjunction.planetary` finds a conjunction between two moving bodies from five equally spaced ephemeris rows. `conjunction.stellar` compares a moving body with a fixed star.

Exactly five rows are required. The rows must be equally spaced and refer to the same coordinate frame and epoch. The functions throw when the table shape is wrong.

## Straight-line configurations

`line.time`, `angle`, `error` and `angleError` estimate when three bodies are aligned and quantify deviation/error.

The ephemeris arrays must contain five values. This is an interpolation method and does not replace a global search over a long interval.

## Rise, transit and set

Low-level `rise` methods use observer coordinates, standard altitude, sidereal time and equatorial ephemerides.

```ts
const result = rise.times(observer, deltaT, h0, sidereal0, ra3, dec3)
```

`ra3` and `dec3` must each contain exactly three values for the day before, day of and day after at 0h dynamical time. Wrong lengths throw `RangeError`.

The return value preserves the historical hybrid API:

```ts
result[0] === result.rise
result[1] === result.transit
result[2] === result.set
```

All values are seconds of day. The named properties are clearer for new code.

`hourAngle` throws coded errors when the body is always above or always below the selected altitude. Test `error.code` (`-1` above, `1` below) rather than matching only message text.

### PlanetRise

`rise.PlanetRise` wraps the low-level calculations for a VSOP planet:

```ts
const calc = new rise.PlanetRise(jd, latitudeDeg, westLongitudeDeg, earth, mars, {
  date: true
})

const times = calc.times()
```

With `date: true`, each result is a JavaScript `Date`; otherwise it is JD. Longitude is west-positive.

## Sunrise, twilight and golden hour

`sunrise.Sunrise` provides:

- solar noon
- sunrise and sunset
- sunrise end and sunset start
- civil and nautical dawn/dusk
- astronomical night start/end
- golden-hour start/end

```ts
const day = new julian.CalendarGregorian(2026, 7, 31)
const sun = new sunrise.Sunrise(day, 57.5, 1.8) // latitude, west-positive longitude
const riseTime = sun.rise()
```

Near the poles, an event may not occur on the requested day. The class searches for the next/previous event and can return `undefined` when no result is found within its search limit. This behaviour is useful for polar day/night but is not the same as a same-day event.

The constructor is documented for latitudes roughly within `(-89.6°, 89.6°)`; behaviour at the poles is singular.

## Atmospheric refraction

Rise/set standard altitudes include a conventional mean refraction. Pass a custom refraction correction when modelling local conditions. Avoid applying the same correction once through `rise.refraction` and again to the final altitude.

## Parallactic and horizon geometry

`parallactic` calculates:

- parallactic angle
- angle on the horizon
- ecliptic intersection with the horizon
- ecliptic angle at the equator
- diurnal-path angle at the horizon

These formulae can become singular at poles, zenith/nadir or degenerate intersections. Handle non-finite values in display code.

## Sundials

`sundial.general`, `equatorial`, `horizontal` and `vertical` generate hour-line geometry for different dial planes. Results are geometric design coordinates relative to the supplied stylus and plane conventions; they are not rendered artwork.
