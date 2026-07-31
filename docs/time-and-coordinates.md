# Time and coordinates

Astronomical numbers are meaningful only with their time scale, reference frame, epoch and units. Astronomia keeps the primitives lightweight, so the caller must preserve that context.

## JD and JDE

- **JD** is the Julian day associated with Universal Time in civil/observational calculations.
- **JDE** is the Julian ephemeris day associated with dynamical time in ephemeris calculations.
- `deltat.deltaT(year)` estimates `TT − UT` in seconds.
- `Calendar.toJD()` and `Calendar.toJDE()` select the appropriate scale.

```ts
import { deltat, julian } from 'astronomia'

const cal = new julian.CalendarGregorian(2026, 7, 31.5)
const jd = cal.toJD()
const jde = cal.toJDE()
const deltaSeconds = deltat.deltaT(cal.toYear())
```

Delta-T is a historical/modelled quantity. Predictions far from the present and reconstructions in antiquity carry larger uncertainty than modern dates.

## Calendar classes

`julian` provides:

- `Calendar` with automatic Gregorian/Julian handling
- `CalendarGregorian` and `CalendarJulian` for an explicit calendar
- JD/JDE and JavaScript `Date` conversion
- modified Julian day conversion
- day-of-week and day-of-year calculations
- Gregorian and Julian leap-year rules

The Gregorian reform boundary is not a universal historical civil-calendar rule. Use an explicit calendar class when local historical practice matters.

JavaScript `Date` has a limited practical range and millisecond resolution. Keep ancient/future work as calendar/JD numbers until presentation.

## Angle units

Unless a function explicitly says otherwise:

- angular inputs and outputs are **radians**
- right ascension is still stored in radians, even when formatted as hours
- sidereal-time functions return **seconds of time** in `[0, 86400)`
- rise/transit/set low-level functions return **seconds of day**
- planet distances are **AU**
- lunar distances are usually **km**

Use `base.toRad`, `base.toDeg` and the `sexagesimal` classes at application boundaries.

## Longitude convention

Several Meeus-derived observational APIs measure longitude **positively westward**. This is the opposite of the common GIS convention where east is positive.

For example, New York is approximately `+74°` west in `sunrise.Sunrise`, while Greenwich is `0°`. Read each function's documentation before passing a normal east-positive longitude.

## Coordinate classes

### Ecliptic

`coord.Ecliptic(lon, lat)` represents longitude and latitude relative to an ecliptic plane. It converts to equatorial coordinates for a supplied obliquity.

```ts
const equatorial = new coord.Ecliptic(lon, lat).toEquatorial(obliquity)
```

### Equatorial

`coord.Equatorial(ra, dec)` converts to ecliptic, horizontal and galactic coordinates.

For horizontal conversion, sidereal time must be consistent with the coordinate type:

- apparent coordinates require apparent sidereal time
- mean coordinates require mean sidereal time

Mixing them introduces a systematic error.

### Horizontal

`coord.Horizontal(az, alt)` converts an observer-relative azimuth/altitude back to equatorial coordinates when latitude and sidereal time are supplied.

The library follows its documented astronomical azimuth convention; do not assume a navigation library's convention.

### Galactic

`coord.Galactic(lon, lat)` supports modern and B1950 conversion constants. Ensure the equatorial epoch matches the selected constants.

## Geometric, astrometric and apparent positions

These terms are not aliases:

- **geometric/true**: idealised direction before apparent corrections
- **astrometric**: includes light-time geometry but excludes some apparent effects
- **apparent**: includes precession/nutation/aberration as required by the algorithm
- **topocentric**: corrected from Earth's centre to an observer on Earth

Typical pipeline:

```text
orbital/series position
  -> light-time
  -> frame and epoch conversion
  -> aberration and nutation
  -> geocentric apparent equatorial
  -> parallax/topocentric correction
  -> refraction for observed altitude
```

Do not apply a correction twice. For example, `elliptic.position` already returns an observed apparent equatorial planet position; it is not a raw heliocentric coordinate.

## Precession, nutation and aberration

- `precess` moves equatorial/ecliptic coordinates between epochs and supports proper motion.
- `nutation` supplies nutation in longitude/obliquity, mean obliquity and RA correction.
- `apparent` combines precession, nutation and aberration for stars.
- `planetposition.toFK5` converts dynamical-frame ecliptic coordinates to FK5.

The approximate precession methods are useful for limited spans. Use the full precessor classes for larger epoch differences and include proper motion where known.

Objects extremely close to the celestial poles can make right ascension numerically unstable. The direction remains meaningful while RA may change sharply.

## Parallax and topocentric position

`parallax` converts geocentric coordinates to an observer's location. Inputs include distance, observer latitude/height and sidereal time depending on the selected function.

`globe.Ellipsoid` computes parallax constants and Earth-surface distances. `globe.Earth76` is the supplied Earth ellipsoid.

Topocentric correction matters most for the Moon and nearby objects. A planet position with no distance cannot be corrected reliably.

## Refraction

`refraction` implements high-altitude and near-horizon formulae:

- `gt15True` / `gt15Apparent` for altitudes above about 15°
- Bennett and Saemundsson formulae near the horizon

Refraction is atmosphere-dependent and becomes ill-conditioned at or below the horizon. The formulae are approximations, not meteorological ray tracing. Supply an application-specific correction to rise/sunrise APIs when pressure/temperature modelling is available.

## Sidereal time

`sidereal.mean`, `mean0UT`, `apparent` and `apparent0UT` return Greenwich sidereal time in seconds. Normalise or format with `sexagesimal.Time` as needed.

Use local longitude to convert Greenwich sidereal time to a local hour angle. Maintain the west-positive convention used by the target API.
