# Accuracy and edge cases

## Algorithm sources

Astronomia combines several classes of algorithms:

- polynomial/periodic formulae from Jean Meeus's *Astronomical Algorithms*, second edition
- full VSOP87 planetary coefficient series
- ELP/MPP02 lunar coefficient series
- supporting interpolation and numerical methods

Accuracy therefore varies by module. A result with many floating-point digits is not a claim that every digit is physically accurate.

## Time-scale uncertainty

Ephemerides normally use dynamical time. Civil observations normally use Universal Time. The conversion depends on Delta-T, which is measured historically, estimated for the recent past and predicted for the future.

For ancient or far-future dates, Delta-T uncertainty can dominate event timing. Preserve the selected model and time scale in stored output.

## Validity ranges

Many Meeus polynomial series have stated date ranges. Examples include:

- high-accuracy solstice shortcuts restricted to a modern interval
- precession approximations with different accuracy over millennia
- planetary phenomenon polynomials intended for bounded eras

The library generally evaluates numeric input rather than enforcing every published validity interval. Check the module comments and Meeus reference before extrapolating.

Full VSOP87/ELP data reduce truncation error but do not eliminate time-scale, model or reference-frame errors.

## Frames and epochs

Common mistakes:

- treating heliocentric longitude as a geocentric sky position
- mixing J2000 coordinates with coordinates of date
- combining mean and apparent coordinates
- applying nutation, aberration or parallax twice
- converting to horizontal coordinates with inconsistent sidereal time

Store frame metadata beside every serialised coordinate.

## Units

Common units:

| Quantity | Typical unit |
|---|---|
| angle, RA, declination, longitude, latitude | radians |
| sidereal time | seconds of time |
| low-level rise/set result | seconds of day |
| planet/Sun distance | AU |
| Moon distance | km |
| calendar event | JD or JDE |
| physical velocity | module-specific, normally km/s |

Do not infer a distance unit from the property name `range`; inspect the producing function.

## Floating-point behaviour

The refactor preserves the original coefficient summation order because changing order can alter least-significant bits. Consumers should still compare calculated astronomy values with a physically meaningful tolerance rather than exact equality.

Normalise cyclic angles with `base.pmod(angle, 2 * Math.PI)` when a stable `[0, 2π)` representation is required. Some functions intentionally return unnormalised angles to preserve polynomial continuity.

## Convergence

Iterative algorithms can fail:

- minimum-separation interpolation
- interpolation roots/extrema
- Kepler solvers
- general iterative/root helpers

Catch errors and either widen/change the sample interval, select a more robust solver or report that the requested result is not resolved.

Never suppress a convergence failure and present the last iterate as a valid ephemeris.

## Singular geometry

Watch for:

- celestial poles, where RA becomes unstable
- observer poles, where longitude/hour angle can be singular
- zenith/nadir and horizon intersections
- zero distances
- circular/degenerate orbital elements
- duplicate interpolation abscissae
- brightness/parallax values at or below zero

TypeScript prevents shape mistakes, not invalid physics.

## Circumpolar and polar-day conditions

`rise.hourAngle` throws coded errors when a body never reaches the requested altitude:

```ts
try {
  const h = rise.hourAngle(latitude, altitude, declination)
} catch (error) {
  if (error instanceof Error && 'code' in error) {
    // -1: always above; +1: always below
  }
}
```

`sunrise.Sunrise` searches away from the requested date for polar events and may return `undefined`. Decide whether the application needs:

- an event strictly on the selected civil date
- the nearest next/previous event
- a state such as polar day or polar night

## Atmospheric uncertainty

Near-horizon timings depend on refraction, pressure, temperature, elevation, terrain and the adopted solar/lunar limb. Standard-altitude formulae are conventional estimates.

For operational navigation, legal timing or safety-critical observation, use a specialised validated ephemeris and local environmental model.

## JavaScript Date limitations

`Date` stores milliseconds and uses a proleptic Gregorian representation. It is unsuitable as the sole internal form for very ancient dates, very distant dates or sub-millisecond timing. Use JD/JDE numbers and convert only for UI output.

## Data and bundle size

The full coefficient datasets are large. Browser applications should:

- import only required planets/data
- lazy-load optional ELP full data
- cache constructed models
- avoid serialising coefficient tables into application state

The data objects are read-only by type. Mutating them at runtime can silently corrupt all later calculations.

## Input validation policy

The library validates structural requirements where the original API depends on them, such as table lengths, missing coefficients and unsupported planets. It does not validate every physical domain.

Validate user-facing inputs before calling the library:

- finite numbers only
- latitude and longitude ranges
- positive distances
- eccentricity appropriate to the chosen orbit model
- chronological sample ordering
- matching coordinate frames and units
