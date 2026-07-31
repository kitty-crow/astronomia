# Orbits and numerical tools

## Kepler's equation

`kepler` provides true anomaly, radius and several solvers for elliptic Kepler equations.

- `kepler1` is the simplest iterative method.
- `kepler2`, `kepler2a` and `kepler2b` offer alternate convergence strategies.
- `kepler3` is robust over a wider input range.
- `kepler4` implements another approximation described by Meeus.

Some solvers accept a maximum iteration count and throw when convergence is not reached. For high eccentricity, select a solver designed for the wider range or fall back as `elliptic.Elements.position` does.

## Elliptic orbits

`elliptic.Elements` stores:

- semimajor axis `axis` in AU
- eccentricity `ecc`
- inclination `inc` in radians
- argument of perihelion `argP` in radians
- ascending node `node` in radians
- perihelion time `timeP` as JD/JDE

```ts
const body = new elliptic.Elements({
  axis,
  ecc,
  inc,
  argP,
  node,
  timeP
})

const apparent = body.position(jde, earth)
```

`elliptic.position` is the specialised VSOP planet path. `Elements.position` is for a custom Keplerian body.

The module also provides orbital velocity at arbitrary anomaly, aphelion/perihelion velocities and multiple approximations for ellipse circumference.

## Parabolic and near-parabolic motion

`parabolic.Elements` models a parabolic orbit. `nearparabolic.Elements` handles eccentricities close to one without treating the orbit as exactly parabolic.

These algorithms require physically coherent elements and perihelion distance. Invalid/degenerate values may yield non-finite results even when the type is correct; validate eccentricity, distance and time in application code.

## Node passages

`node` returns time and heliocentric distance for ascending/descending node passages in elliptic or parabolic orbits.

Inputs use radians, AU and JD/JDE. The result is `[jde, distanceAU]`.

## Orbital-element frame reduction

`elementequinox.Elements` and its reduction methods move orbital elements between equinoxes. Dedicated helpers convert B1950/FK4 elements to J2000/FK5.

The source and target frames must be known. Do not apply these transformations to elements already expressed in the target frame.

`planetelements` supplies mean planetary elements and their rates/corrections, not instantaneous osculating elements.

## Binary stars and stellar magnitudes

`binary` calculates mean anomaly, apparent binary-star separation/position angle and apparent eccentricity from orbital elements.

`stellar` combines magnitudes, converts magnitude differences to brightness ratios and derives absolute magnitude from parallax or distance.

Magnitude is logarithmic. `stellar.sumN` expects an array, including for a single star. Empty arrays produce a non-physical logarithmic result and should be rejected by the caller.

## Interpolation

### Len3 and Len5

`interpolation.Len3` and `Len5` operate on exactly three or five equally spaced ordinates.

They support:

- interpolation by normalised factor or x-coordinate
- extrema
- zero/root location
- higher-order correction with five samples

Validation/error cases include:

- wrong table length
- identical x endpoints
- normalised factor outside `[-1, 1]`
- extremum outside the sample range
- no extremum
- root outside the range
- failure to converge

These errors are exported as stable error objects for callers that need identity checks.

### Lagrange and linear interpolation

`lagrange` accepts unequally spaced `[x, y]` rows. `lagrangePoly` returns polynomial coefficients. Duplicate x-values make the denominator zero and must be rejected by the caller.

`linear` maps a value across an evenly spaced numeric table and requires a non-zero x range.

## Iteration and roots

`iterate.decimalPlaces` and `fullPrecision` iterate a callback until a decimal/full-precision criterion is met. `binaryRoot` finds a root in a bracket.

The callback must converge and the root interval must actually bracket the intended root. Maximum-iteration failures throw.

## Curve fitting

`fit` includes:

- linear least squares
- correlation coefficient
- quadratic fit
- fit against three supplied basis functions
- fit against one supplied basis function

Input points are ordinary `{x, y}` objects. Empty, underdetermined or singular datasets can create division by zero or non-finite coefficients; validate sample count and basis independence.

## Calendars beyond Gregorian/Julian

`jm` implements Jewish calendar dates, Moslem-to-JD conversion, Islamic leap-year rules, Julian-to-Moslem conversion and month naming.

These are arithmetic calendar algorithms. Religious or civil observation-based calendars can differ from arithmetic results.

## Sexagesimal values

`sexagesimal` provides:

- `Angle` for signed angular values
- `HourAngle` for signed hours
- `RA` for right ascension
- `Time` for durations/time-of-day formatting
- degree/minute/second conversion helpers

Constructors accept either radians/seconds or component values depending on overload. Use the class matching the semantic quantity; formatting RA with `Angle` changes hours into degrees.

## Base utilities

`base` contains common constants and numerical helpers:

- AU in km, Gaussian gravitational constant and J2000 constants
- Julian/Besselian year conversion
- light time
- Horner polynomial evaluation
- positive modulo
- degree/radian conversion
- safe indexed access through `at`
- coded errors

`base.at` throws on an absent index. `base.horner` throws when no coefficient is supplied. `pmod` is designed around a positive modulus.
