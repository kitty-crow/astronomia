# Solar-system calculations

## VSOP87 planets

`planetposition.Planet` evaluates full VSOP87 series for Mercury through Neptune and Earth.

```ts
import { planetposition } from 'astronomia'
import data from 'astronomia/data'

const earth = new planetposition.Planet(data.earth)
const jupiter = new planetposition.Planet(data.jupiter)

const j2000 = jupiter.position2000(jde)
const ofDate = jupiter.position(jde)
```

Both results contain heliocentric ecliptic `lon`, `lat` in radians and `range` in AU.

- `position2000()` returns the dynamical equinox/ecliptic J2000 result.
- `position()` returns the equinox/ecliptic of date result.
- Dataset type `B` and `D` are handled internally so the public frame remains consistent.

Passing arbitrary objects is rejected. Use a supplied dataset or a correctly shaped `VSOP87Planet`.

## Observed planet positions

`elliptic.position(planet, earth, jde)` calculates observed geocentric equatorial right ascension and declination. It performs light-time iteration, aberration, FK5 conversion and nutation.

```ts
const equatorial = elliptic.position(jupiter, earth, jde)
```

Use `planet.position()` instead when you need the planet's heliocentric orbit rather than its apparent direction from Earth.

## Sun

Low/medium precision functions derive solar coordinates directly from Meeus polynomials:

- `trueLongitude`, `meanAnomaly`, `eccentricity`, `radius`
- `apparentLongitude`
- `trueEquatorial`, `apparentEquatorial`

Full VSOP87 functions use an Earth `Planet`:

- `trueVSOP87`
- `apparentVSOP87`
- `apparentEquatorialVSOP87`

```ts
const sun = solar.apparentEquatorialVSOP87(earth, jde)
```

The returned range is the Earth–Sun distance in AU. `solarxyz` gives rectangular Sun coordinates for date, J2000, B1950 or an arbitrary equinox.

`solardisk.ephemeris` returns physical solar-disk quantities, and `cycle` returns the start of a synodic rotation.

## Moon

### Meeus lunar position

```ts
const moon = moonposition.position(jde)
```

The result is geocentric ecliptic longitude/latitude at the mean equinox of date, without nutation, and distance in km.

`moonposition` also provides horizontal parallax, mean node, true node and perigee arguments.

### ELP/MPP02

For a larger lunar series, construct `elp.Moon` from one of the bundled datasets:

```ts
import { elp } from 'astronomia'
import data from 'astronomia/data'

const moonModel = new elp.Moon(data.elpMppDe)
const spherical = moonModel.position(jde)
const rectangular = moonModel.positionXYZ(jde)
```

`elpMppDeFull` is larger. Use it only when the additional terms justify the browser/download cost.

### Physical Moon

The `moon` module calculates libration and physical ephemeris values, topocentric corrections, selenographic solar coordinates and sunrise/sunset at a lunar location.

Do not confuse `moon` (physical observations) with `moonposition` (geocentric position) or `moonphase` (phase-event times).

## Pluto

Pluto is not included in the bundled VSOP87 planet sets.

- `pluto.heliocentric(jde)` returns J2000 heliocentric longitude, latitude and range.
- `pluto.astrometric(jde, earth)` returns J2000 astrometric equatorial coordinates.

Pluto magnitude is available through `illum.pluto84`.

## Planetary satellites

- `jupitermoons.positions` and `e5` calculate apparent positions of Io, Europa, Ganymede and Callisto.
- `saturnmoons.positions` calculates Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Hyperion and Iapetus.

Satellite positions are relative to the parent planet and use the module's documented coordinate orientation. They are not sky RA/declination values and should not be plotted as independent celestial coordinates.

## Physical ephemerides

- `jupiter.physical` / `physical2`: central meridians, position angle and related quantities
- `mars.physical`: Martian disk orientation and illuminated geometry
- `saturnring.ring`: ring opening, axes and position angles
- `saturnring.ub`: ring quantities used for photometric magnitude
- `solardisk.ephemeris`: solar rotation-axis and disk orientation
- `moon.physical`: lunar libration and axis position angle

These functions often require an Earth VSOP model and sometimes a target-planet model. Reuse constructed `Planet` objects.

## Illumination and magnitude

`illum` includes:

- phase angle from heliocentric/geocentric distances
- illuminated fraction
- dedicated apparent-magnitude formulae for Mercury through Neptune and Pluto
- older and newer formula variants where Meeus presents both

`moonillum` computes lunar phase angle from equatorial or ecliptic Sun/Moon coordinates and distances.

All distances passed to one formula must use the same unit. The numeric result is dimensionless only after the ratio is formed.

## Semidiameters and physical sizes

`semidiameter` supplies standard semidiameters for the Sun, Moon and planets and functions for:

- apparent semidiameter at a given distance
- Saturn's apparent polar semidiameter
- rigorous and approximate topocentric Moon semidiameter
- asteroid diameter from absolute magnitude and albedo
- asteroid angular size from physical diameter and distance

Distance units are formula-specific. Planet semidiameter uses AU; Moon routines use their documented lunar distance/parallax inputs.

## Planetary elements and phenomena

`planetelements` provides mean orbital elements for Mercury through Neptune and correction helpers.

`planetary` predicts mean and corrected conjunctions, oppositions, elongations and stations for supported planets. These are event approximations/polynomial series, not general numerical searches over arbitrary bodies.

`perihelion` calculates perihelion/aphelion for supported planets and can refine extrema with a supplied VSOP model. Unsupported planet names throw `RangeError`.
