# Documentation

Astronomia is a numerical astronomy toolkit rather than a single ephemeris function. Start with the workflow closest to the result you need.

## Guides

- [Getting started](getting-started.md) — installation, imports, dates, planets, browser use and JSON output
- [Time and coordinates](time-and-coordinates.md) — JD/JDE, UTC/TT, angle units, reference frames and coordinate transformations
- [Solar-system calculations](solar-system.md) — Sun, Moon, planets, Pluto, satellites, illumination and physical ephemerides
- [Events and observation](events-and-observation.md) — phases, eclipses, conjunctions, rise/set, twilight, solstices and other events
- [Orbits and numerical tools](orbits-and-numerics.md) — Keplerian motion, orbital elements, interpolation, fitting and calendars
- [Accuracy and edge cases](accuracy-and-edge-cases.md) — validity ranges, polar conditions, convergence, units and error handling
- [API reference](api-reference.md) — every public module and exported symbol
- [Development](development.md) — strict TypeScript source, generated data, builds and testing

## Result selection

| Need | Start with |
|---|---|
| Sun apparent RA/declination | `solar.apparentEquatorialVSOP87` |
| Moon longitude, latitude and distance | `moonposition.position` |
| Planet apparent RA/declination | `elliptic.position` |
| Heliocentric planet position | `planetposition.Planet.position` |
| Pluto position | `pluto.heliocentric` or `pluto.astrometric` |
| Lunar phase date | `moonphase.newMoon`, `first`, `full`, `last` |
| Solar/lunar eclipse circumstances | `eclipse.solar`, `eclipse.lunar` |
| Planet rise/transit/set | `rise.PlanetRise` |
| Sunrise, twilight and golden hour | `sunrise.Sunrise` |
| Coordinate conversion | `coord` classes |
| Calendar/Date conversion | `julian` |
| Angular separation | `angle` |
| Custom orbit | `elliptic.Elements`, `parabolic.Elements` or `nearparabolic.Elements` |

The source modules retain detailed mathematical comments and references to Meeus chapter and formula numbers. The tests provide worked numerical examples for every module.
