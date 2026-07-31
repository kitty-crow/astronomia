# API reference

Every public algorithm module has a package subpath such as `astronomia/solar`. Most are also exposed as namespaces from `astronomia`; modules marked **subpath only** are not present in the root namespace.

The generated declarations remain the exact type authority. This reference lists every exported declaration and the public members of exported classes/interfaces, then links those names to the workflow guides.

## Data exports

`astronomia/data` exports Delta-T tables, VSOP87 B/D series for Earth and Mercury through Neptune, plus compact and full ELP/MPP02 lunar datasets. Every dataset also has a direct package subpath. Coefficient objects should be treated as immutable.

## Modules

### `angle`

Angular separation, minimum separation and relative position angles. **Availability:** root namespace and subpath.

- **Functions:** `sep`, `minSep`, `minSepRect`, `hav`, `sepHav`, `minSepHav`, `sepPauwels`, `minSepPauwels`, `relativePosition`
- **Types:** `SeparationFunction`
- **Operational notes:** Minimum functions use sampled interpolation; they do not search outside the supplied interval. `minSepRect` can fail to converge and is less suitable for extremely close approaches.

### `apparent`

Nutation, aberration and apparent stellar positions. **Availability:** root namespace and subpath.

- **Functions:** `nutation`, `perihelion`, `eclipticAberration`, `aberration`, `position`, `aberrationRonVondrak`, `positionRonVondrak`
- **Operational notes:** Inputs must have a known epoch and proper motion. Results are invalid or unstable extremely close to the celestial poles.

### `apsis`

Lunar perigee/apogee timing, parallax and distance. **Availability:** root namespace and subpath.

- **Functions:** `meanPerigee`, `perigee`, `meanApogee`, `apogee`, `apogeeParallax`, `perigeeParallax`, `distance`
- **Constants:** `EARTH_RADIUS`, `MOON_RADIUS`
- **Operational notes:** Event selectors use decimal years/lunation parameters and return JDE. Parallax is radians; `distance` converts parallax to geocentric km.

### `base`

Shared constants, coordinate container, time conversions and numerical helpers. **Availability:** root namespace and subpath.

- **Classes:** `Coord`, `CodeError`
- **Functions:** `lightTime`, `JulianYearToJDE`, `JDEToJulianYear`, `BesselianYearToJDE`, `JDEToBesselianYear`, `J2000Century`, `illuminated`, `limb`, `at`, `pmod`, `horner`, `floorDiv`, `cmp`, `sincos`, `toRad`, `toDeg`, `modf`, `round`, `errorCode`
- **Constants:** `K`, `AU`, `SOblJ2000`, `COblJ2000`, `JMod`, `J2000`, `J1900`, `B1900`, `B1950`, `JulianYear`, `JulianCentury`, `BesselianYear`, `meanSiderealYear`, `SmallAngle`, `CosSmallAngle`
- **Types:** `ErrorCode`
- **`Coord` class members:** `_ra: number`, `_dec: number`, `range: number`, `elongation: number`, `ra`, `dec`, `lon`, `lat`
- **`CodeError` class members:** `code: ErrorCode`
- **Operational notes:** `at` throws for a missing index; `horner` requires at least one coefficient. `Coord.range` has no universal unit.

### `binary`

Binary-star anomaly, apparent position and apparent eccentricity. **Availability:** root namespace and subpath.

- **Functions:** `meanAnomaly`, `position`, `apparentEccentricity`

### `circle`

Smallest spherical circle containing three celestial positions. **Availability:** root namespace and subpath.

- **Functions:** `smallest`
- **Operational notes:** Inputs are spherical coordinates in radians. Degenerate or nearly collinear cases deserve tolerance checks.

### `conjunction`

Planet–planet and planet–star conjunction interpolation. **Availability:** root namespace and subpath.

- **Functions:** `planetary`, `stellar`
- **Operational notes:** Exactly five equally spaced ephemeris rows are required and all rows must share a frame/epoch.

### `coord`

Ecliptic, equatorial, horizontal and galactic coordinate classes and conversions. **Availability:** root namespace and subpath.

- **Classes:** `Ecliptic`, `Equatorial`, `Horizontal`, `Galactic`
- **Constants:** `galacticNorth`, `galacticNorth1950`, `galacticLon0`, `galactic0Lon1950`
- **Interfaces:** `LonLat`
- **`LonLat` interface members:** `lon: number`, `lat: number`
- **`Ecliptic` class members:** `lon: number`, `lat: number`, `toEquatorial(ε: number)`
- **`Equatorial` class members:** `ra: number`, `dec: number`, `toEcliptic(ε: number)`, `toHorizontal(g: GlobeCoord, st: number)`, `toGalactic()`
- **`Horizontal` class members:** `az: number`, `alt: number`, `toEquatorial(g: GlobeCoord, st: number)`
- **`Galactic` class members:** `lon: number`, `lat: number`, `toEquatorial()`
- **Operational notes:** Sidereal time must match mean/apparent equatorial coordinates. Several observer longitudes are west-positive.

### `deltat`

Delta-T estimation between dynamical and Universal Time. **Availability:** root namespace and subpath.

- **Functions:** `deltaT`
- **Operational notes:** Historical/future accuracy varies; the returned value is seconds.

### `eclipse`

Solar and lunar eclipse classification and circumstances. **Availability:** root namespace and subpath.

- **Functions:** `solar`, `lunar`
- **Constants:** `TYPE`
- **Types:** `EclipseType`
- **Operational notes:** An eclipse calculation is global geometry. Local contact times and visibility need observer-specific work.

### `elementequinox`

Reduction of orbital elements between equinoxes and reference systems. **Availability:** root namespace and subpath.

- **Classes:** `Elements`
- **Functions:** `reduceB1950ToJ2000`, `reduceB1950FK4ToJ2000FK5`
- **`Elements` class members:** `inc: number`, `node: number`, `peri: number`

### `elliptic`

Observed planetary positions and custom elliptic-orbit calculations. **Availability:** root namespace and subpath.

- **Classes:** `Elements`
- **Functions:** `position`, `astrometricJ2000`, `velocity`, `vAphelion`, `vPerihelion`, `length1`, `length2`, `length4`
- **Interfaces:** `ElementsInit`
- **`ElementsInit` interface members:** `axis: number`, `ecc: number`, `inc: number`, `argP: number`, `node: number`, `timeP: number`
- **`Elements` class members:** `axis: number`, `ecc: number`, `inc: number`, `argP: number`, `node: number`, `timeP: number`, `position(jde: number, earth: Planet)`
- **Operational notes:** `position` expects valid Earth and target VSOP planets. Custom elements must be physically coherent; solver fallback is used for difficult eccentricities.

### `elp`

ELP/MPP02 lunar spherical and rectangular positions. **Availability:** root namespace and subpath.

- **Classes:** `Moon`
- **Functions:** `position`
- **Interfaces:** `ElpData`, `RectangularCoordinates`
- **Types:** `ElpTerm`, `ElpSeries`
- **`ElpData` interface members:** `name?: string`, `W1: readonly number[]`, `L: ElpSeries`, `B: ElpSeries`, `R: ElpSeries`
- **`RectangularCoordinates` interface members:** `x: number`, `y: number`, `z: number`
- **`Moon` class members:** `series: ElpData`, `_calcLBR(T: number)`, `positionXYZ(jde: number): RectangularCoordinates`, `lightTime(jde: number)`, `position(jde: number)`
- **Operational notes:** Constructor rejects invalid data. Full data is large; ranges are km for spherical Moon results.

### `eqtime`

Equation of time. **Availability:** root namespace and subpath.

- **Functions:** `e`, `eSmart`

### `fit`

Linear, quadratic and custom-basis least-squares fitting. **Availability:** root namespace and subpath.

- **Functions:** `linear`, `correlationCoefficient`, `quadratic`, `func3`, `func1`
- **Interfaces:** `Point`
- **Types:** `BasisFunction`
- **`Point` interface members:** `x: number`, `y: number`
- **Operational notes:** Callers must avoid underdetermined or singular datasets and non-independent basis functions.

### `globe`

Earth ellipsoids, observer coordinates and surface/angular distances. **Availability:** root namespace and subpath.

- **Classes:** `Ellipsoid`, `Coord`
- **Functions:** `oneDegreeOfLongitude`, `oneDegreeOfLatitude`, `geocentricLatitudeDifference`, `approxAngularDistance`, `approxLinearDistance`
- **Constants:** `Earth76`, `RotationRate1996_5`
- **`Ellipsoid` class members:** `radius: number`, `flat: number`, `A()`, `B()`, `eccentricity()`, `parallaxConstants(φ: number, h: number): [number, number]`, `rho(φ: number)`, `radiusAtLatitude(φ: number)`, `radiusOfCurvature(φ: number)`, `distance(c1: Coord, c2: Coord)`
- **`Coord` class members:** `lat: number`, `lon: number`

### `illum`

Planet phase angle, illuminated fraction and apparent magnitude. **Availability:** root namespace and subpath.

- **Functions:** `phaseAngle`, `fraction`, `phaseAngle2`, `phaseAngle3`, `fractionVenus`, `mercury`, `venus`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `mercury84`, `venus84`, `mars84`, `jupiter84`, `saturn84`, `uranus84`, `neptune84`, `pluto84`

### `interpolation`

Three/five-point interpolation, extrema, roots, Lagrange and linear interpolation. **Availability:** root namespace and subpath.

- **Classes:** `Len3`, `Len5`
- **Functions:** `len3ForInterpolateX`, `len4Half`, `lagrange`, `lagrangePoly`, `linear`
- **Constants:** `errorNot3`, `errorNot4`, `errorNot5`, `errorNoXRange`, `errorNOutOfRange`, `errorNoExtremum`, `errorExtremumOutside`, `errorZeroOutside`, `errorNoConverge`, `iterate`
- **`Len3` class members:** `x1: number`, `x3: number`, `y: Array<number>`, `a: number`, `b: number`, `c: number`, `abSum: number`, `xSum: number`, `xDiff: number`, `interpolateX(x: number)`, `interpolateXStrict(x: number)`, `interpolateN(n: number)`, `interpolateNStrict(n: number)`, `extremum(): [number, number]`, `zero(strong: boolean)`
- **`Len5` class members:** `x1: number`, `x5: number`, `y: readonly number[]`, `y3: number`, `xSum: number`, `a: number`, `b: number`, `c: number`, `d: number`, `e: number`, `f: number`, `g: number`, `h: number`, `j: number`, `k: number`, `xDiff: number`, `interpCoeff: number[]`, `interpolateX(x: number)`, `interpolateXStrict(x: number)`, `interpolateN(n: number)`, `interpolateNStrict(n: number)`, `extremum(): [number, number]`, `zero(strong: boolean)`
- **Operational notes:** Table lengths and x-ranges are validated. Root/extremum searches can throw for out-of-range or non-convergent cases.

### `iterate`

Precision iteration and bracketed root finding. **Availability:** root namespace and subpath.

- **Functions:** `decimalPlaces`, `fullPrecision`, `binaryRoot`
- **Operational notes:** Callbacks must converge; root brackets must contain the intended root.

### `jm`

Jewish and Moslem arithmetic-calendar calculations. **Availability:** root namespace and subpath.

- **Functions:** `JewishCalendar`, `MoslemToJD`, `MoslemLeapYear`, `JulianToMoslem`, `moslemMonth`

### `julian`

Julian/Gregorian calendars, JD/JDE, Date, MJD, weekday and day-of-year conversion. **Availability:** root namespace and subpath.

- **Classes:** `Calendar`, `CalendarJulian`, `CalendarGregorian`
- **Functions:** `CalendarToJD`, `CalendarGregorianToJD`, `CalendarJulianToJD`, `LeapYearJulian`, `LeapYearGregorian`, `JDToCalendar`, `JDToCalendarGregorian`, `JDToCalendarJulian`, `isJDCalendarGregorian`, `isCalendarGregorian`, `JDToDate`, `DateToJD`, `JDEToDate`, `DateToJDE`, `MJDToJD`, `JDToMJD`, `DayOfWeek`, `DayOfYearGregorian`, `DayOfYearJulian`, `DayOfYear`, `DayOfYearToCalendar`, `DayOfYearToCalendarGregorian`, `DayOfYearToCalendarJulian`
- **Constants:** `GREGORIAN0JD`
- **`Calendar` class members:** `year`, `month`, `day`, `getDate()`, `getTime()`, `toISOString()`, `isGregorian()`, `fromDate(date: Date)`, `toDate()`, `toYear()`, `fromYear(year: number)`, `isLeapYear()`, `toJD()`, `fromJD(jd: number)`, `fromJDE(jde: number)`, `toJDE()`, `midnight()`, `noon()`, `deltaT(td: boolean)`, `dayOfWeek()`, `dayOfYear()`
- **`CalendarJulian` class members:** `toJD()`, `fromJD(jd: number)`, `isLeapYear()`, `dayOfYear()`, `toGregorian()`
- **`CalendarGregorian` class members:** `toJD()`, `fromJD(jd: number)`, `isLeapYear()`, `dayOfYear()`, `toJulian()`
- **Operational notes:** Explicit Gregorian/Julian classes are safer for historical civil dates. JavaScript Date is UTC and millisecond-limited.

### `jupiter`

Physical ephemeris of Jupiter. **Availability:** root namespace and subpath.

- **Functions:** `physical`, `physical2`

### `jupitermoons`

Apparent positions of the four Galilean satellites. **Availability:** root namespace and subpath.

- **Functions:** `positions`, `e5`
- **Constants:** `io`, `europa`, `ganymede`, `callisto`

### `kepler`

Kepler-equation solvers, anomaly and orbital radius. **Availability:** root namespace and subpath.

- **Functions:** `trueAnomaly`, `radius`, `kepler1`, `kepler2`, `kepler2a`, `kepler2b`, `kepler3`, `kepler4`
- **Operational notes:** Some solvers throw on maximum iterations; choose a robust solver for high eccentricity.

### `line`

Three-body straight-line timing and angular error. **Availability:** root namespace and subpath.

- **Functions:** `time`, `angle`, `error`, `angleError`
- **Operational notes:** Requires five-row ephemerides and only resolves an event represented by the sample interval.

### `mars`

Physical ephemeris of Mars. **Availability:** root namespace and subpath.

- **Functions:** `physical`

### `moon`

Physical lunar ephemeris, libration, topocentric corrections and selenographic solar events. **Availability:** root namespace and subpath.

- **Classes:** `Moon`
- **Functions:** `physical`, `sunAltitude`, `sunrise`, `sunset`
- **Constants:** `selenographic`
- **`Moon` class members:** `jde: number`, `Δψ: number`, `F: number`, `Ω: number`, `ε: number`, `sε: number`, `cε: number`, `ρ: number`, `σ: number`, `τ: number`, `lib(λ: number, β: number): [number, number]`, `optical(λ: number, β: number): [number, number, number]`, `physical(A: number, b_: number): [number, number]`, `pa(λ: number, β: number, b: number)`, `sun(λ: number, β: number, Δ: number, earth: Planet): [number, number]`

### `moonillum`

Lunar phase angle from equatorial or ecliptic coordinates. **Availability:** root namespace and subpath.

- **Functions:** `phaseAngleEquatorial`, `phaseAngleEquatorial2`, `phaseAngleEcliptic`, `phaseAngleEcliptic2`, `phaseAngle3`

### `moonmaxdec`

Northern and southern maximum lunar declination. **Availability:** root namespace and subpath.

- **Functions:** `north`, `south`
- **Interfaces:** `MaximumDeclination`
- **`MaximumDeclination` interface members:** `jde: number`, `dec: number`

### `moonnode`

Lunar ascending and descending node passages. **Availability:** root namespace and subpath.

- **Functions:** `ascending`, `descending`

### `moonphase`

Mean and corrected principal lunar phases. **Availability:** root namespace and subpath.

- **Functions:** `meanNew`, `meanFirst`, `meanFull`, `meanLast`, `newMoon`, `first`, `full`, `last`
- **Constants:** `meanLunarMonth`

### `moonposition`

Geocentric lunar position, distance, parallax and node/perigee arguments. **Availability:** root namespace and subpath.

- **Functions:** `parallax`, `position`, `node`, `perigee`, `trueNode`
- **Operational notes:** Longitude/latitude are mean-equinox-of-date and exclude nutation; distance is km.

### `nearparabolic`

Near-parabolic orbit position calculations. **Availability:** root namespace and subpath.

- **Classes:** `Elements`
- **`Elements` class members:** `timeP: number`, `pDis: number`, `ecc: number`, `anomalyDistance(jde: number)`
- **Operational notes:** Use for eccentricity near one. Invalid perihelion distance/elements can produce non-finite results.

### `node`

Ascending/descending node passages for elliptic and parabolic orbits. **Availability:** root namespace and subpath.

- **Functions:** `ellipticAscending`, `ellipticDescending`, `el`, `parabolicAscending`, `parabolicDescending`, `pa`

### `nutation`

Nutation, mean obliquity and right-ascension correction. **Availability:** root namespace and subpath.

- **Functions:** `nutation`, `approxNutation`, `meanObliquity`, `meanObliquityLaskar`, `nutationInRA`

### `parabolic`

Parabolic orbit position calculations. **Availability:** root namespace and subpath.

- **Classes:** `Elements`
- **`Elements` class members:** `timeP: number`, `pDis: number`, `anomalyDistance(jde: number)`

### `parallactic`

Parallactic angle and ecliptic/horizon geometry. **Availability:** root namespace and subpath.

- **Functions:** `parallacticAngle`, `parallacticAngleOnHorizon`, `eclipticAtHorizon`, `eclipticAtEquator`, `diurnalPathAtHorizon`
- **Operational notes:** Pole, zenith and degenerate horizon geometry can be singular.

### `parallax`

Geocentric-to-topocentric corrections. **Availability:** root namespace and subpath.

- **Functions:** `horizontal`, `topocentric`, `topocentric2`, `topocentric3`, `topocentricEcliptical`
- **Operational notes:** Requires a consistent distance unit and observer model. Topocentric correction without distance is not meaningful.

### `perihelion`

Planetary perihelion/aphelion estimates and VSOP-refined extrema. **Availability:** root namespace and subpath.

- **Functions:** `perihelion`, `aphelion`, `perihelion2`, `aphelion2`
- **Constants:** `mercury`, `venus`, `earth`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `embary`
- **Types:** `PlanetCode`, `Extremum`, `ExtremumCallback`
- **Operational notes:** Only supported planet identifiers are accepted; unsupported names throw `RangeError`.

### `planetary`

Conjunctions, oppositions, elongations and stations from planetary phenomena series. **Availability:** root namespace and subpath.

- **Functions:** `mean`, `sum`, `ms`, `mercuryInfConj`, `mercurySupConj`, `venusInfConj`, `marsOpp`, `sumA`, `msa`, `jupiterOpp`, `saturnOpp`, `saturnConj`, `uranusOpp`, `neptuneOpp`, `el`, `mercuryEastElongation`, `mercuryWestElongation`, `marsStation2`
- **Operational notes:** Functions are specialised series for named phenomena, not arbitrary-body searches.

### `planetelements`

Mean orbital elements for Mercury through Neptune. **Availability:** root namespace and subpath.

- **Classes:** `Elements`
- **Functions:** `mean`, `inc`, `node`
- **Constants:** `mercury`, `venus`, `earth`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`
- **Interfaces:** `ElementsInit`
- **Types:** `PlanetName`
- **`ElementsInit` interface members:** `lon?: number`, `axis?: number`, `ecc?: number`, `inc?: number`, `node?: number`, `peri?: number`
- **`Elements` class members:** `lon: number`, `axis: number`, `ecc: number`, `inc: number`, `node: number`, `peri: number`

### `planetposition`

Typed VSOP87 planet model and FK5 conversion. **Availability:** root namespace and subpath.

- **Classes:** `Planet`
- **Functions:** `toFK5`
- **Interfaces:** `VSOP87Planet`
- **Types:** `VSOPType`, `VSOPTerm`, `VSOPSeries`
- **`VSOP87Planet` interface members:** `name?: string`, `type?: VSOPType`, `L: VSOPSeries`, `B: VSOPSeries`, `R: VSOPSeries`
- **`Planet` class members:** `name: string`, `type: VSOPType`, `position2000(jde: number): Coord`, `position(jde: number): Coord`
- **Operational notes:** `position2000` and `position` differ by reference epoch. Planet data must contain valid VSOP L/B/R series.

### `pluto`

Heliocentric and astrometric Pluto positions. **Availability:** root namespace and subpath.

- **Functions:** `heliocentric`, `astrometric`

### `precess`

Equatorial/ecliptic precession and proper motion. **Availability:** root namespace and subpath.

- **Classes:** `Precessor`, `EclipticPrecessor`
- **Functions:** `approxAnnualPrecession`, `mn`, `approxPosition`, `position`, `eclipticPosition`, `properMotion`, `properMotion3D`
- **`Precessor` class members:** `ζ: number`, `z: number`, `sθ: number`, `cθ: number`, `precess(eqFrom: Equatorial)`
- **`EclipticPrecessor` class members:** `π: number`, `p: number`, `sη: number`, `cη: number`, `precess(eclFrom: Ecliptic)`, `reduceElements(eFrom: Elements)`
- **Operational notes:** Approximate methods have limited spans; include proper motion for stars and use full classes over long intervals.

### `refraction`

Atmospheric-refraction formulae. **Availability:** root namespace and subpath.

- **Functions:** `gt15True`, `gt15Apparent`, `bennett`, `bennett2`, `saemundsson`
- **Operational notes:** Near-horizon results are atmosphere-dependent and become ill-conditioned at/below the horizon.

### `rise`

Rise, transit and set calculations and planet wrapper. **Availability:** root namespace and subpath.

- **Classes:** `PlanetRise`
- **Functions:** `refraction`, `hourAngle`, `approxTimes`, `times`
- **Constants:** `errorAboveHorizon`, `errorBelowHorizon`, `meanRefraction`, `stdh0`, `stdh0Stellar`, `Stdh0Stellar`, `stdh0Solar`, `Stdh0Solar`, `stdh0LunarMean`, `Stdh0LunarMean`, `stdh0Lunar`, `Stdh0Lunar`
- **Interfaces:** `RiseObj`, `PlanetRiseOptions`, `PlanetRiseResult`
- **Types:** `RiseTimes`
- **`RiseObj` interface members:** `rise: number`, `transit: number`, `set: number`
- **`PlanetRiseOptions` interface members:** `date?: boolean`, `refraction?: number`
- **`PlanetRiseResult` interface members:** `rise: number | Date`, `transit: number | Date`, `set: number | Date`
- **`PlanetRise` class members:** `opts: PlanetRiseOptions`, `refraction: number`, `jd: number`, `lat: number`, `lon: number`, `jde: number`, `ΔT: number`, `earth: Planet`, `planet: Planet`, `approxTimes()`, `times()`, `_toArr(body: readonly { ra: number; dec: number }[], p: 'ra' | 'dec'): number[]`, `_rsToJD(rs: RiseObj): PlanetRiseResult`, `_toJD(secs: number): number | Date`
- **Operational notes:** Longitude conventions are west-positive. Three-point RA/Dec tables are required. Circumpolar cases throw coded errors.

### `saturnmoons`

Apparent positions of the major Saturnian satellites. **Availability:** root namespace and subpath.

- **Classes:** `Qs`
- **Functions:** `positions`
- **Constants:** `mimas`, `enceladus`, `tethys`, `dione`, `rhea`, `titan`, `hyperion`, `iapetus`
- **`Qs` class members:** `t1: number`, `t2: number`, `t3: number`, `t4: number`, `t5: number`, `t6: number`, `t7: number`, `t8: number`, `t9: number`, `t10: number`, `t11: number`, `W0: number`, `W1: number`, `W2: number`, `W3: number`, `W4: number`, `W5: number`, `W6: number`, `W7: number`, `W8: number`, `s1: number`, `c1: number`, `s2: number`, `c2: number`, `e1: number`, `sW0: number`, `s3W0: number`, `s5W0: number`, `sW1: number`, `sW2: number`, `sW3: number`, `cW3: number`, `sW4: number`, `cW4: number`, `sW7: number`, `cW7: number`, `mimas()`, `enceladus()`, `tethys()`, `dione()`, `rhea()`, `subr(λʹ: number, p: number, e: number, a: number, Ω: number, i: number)`, `titan()`, `hyperion()`, `iapetus()`

### `saturnring`

Saturn ring geometry and photometric helper values. **Availability:** root namespace and subpath.

- **Functions:** `ring`, `ub`

### `semidiameter`

Angular semidiameters and asteroid size estimates. **Availability:** subpath only.

- **Functions:** `semidiameter`, `saturnApparentPolar`, `moonTopocentric`, `moonTopocentric2`, `asteroidDiameter`, `asteroid`
- **Constants:** `Sun`, `Mercury`, `VenusSurface`, `VenusCloud`, `Mars`, `JupiterEquatorial`, `JupiterPolar`, `SaturnEquatorial`, `SaturnPolar`, `Uranus`, `Neptune`, `Pluto`, `Moon`
- **Operational notes:** Distance units vary by function; read the producing/consuming API before combining values.

### `sexagesimal`

Angle, hour-angle, right-ascension and time formatting/conversion. **Availability:** root namespace and subpath.

- **Classes:** `Angle`, `HourAngle`, `RA`, `Time`
- **Functions:** `DMSToDeg`, `degToDMS`
- **Constants:** `angleFromDeg`, `angleFromMin`, `angleFromSec`, `degFromAngle`, `secFromAngle`, `secFromHourAngle`
- **`Angle` class members:** `angle`, `setDMS(neg: boolean, d: number, m: number, s: number)`, `setAngle(angle: number)`, `rad()`, `deg()`, `toDMS()`, `toString(precision?: number)`, `toDegString(precision?: number)`
- **`HourAngle` class members:** `setDMS(neg: boolean, h: number, m: number, s: number)`, `hour()`, `deg()`, `toString(precision: number)`
- **`RA` class members:** `hour()`
- **`Time` class members:** `time`, `setHMS(neg: boolean, h: number, m: number, s: number)`, `sec()`, `min()`, `hour()`, `day()`, `rad()`, `toHMS(): [boolean, number, number, number]`, `toString(precision: number)`
- **Operational notes:** RA, hour angle and generic angle are semantically different even though each is stored numerically.

### `sidereal`

Mean and apparent Greenwich sidereal time. **Availability:** root namespace and subpath.

- **Functions:** `JDToCFrac`, `mean`, `mean0UT`, `apparent`, `apparent0UT`
- **Constants:** `iau82`
- **Operational notes:** Results are seconds of time in `[0, 86400)`.

### `solar`

Low-precision and VSOP87 solar coordinates. **Availability:** root namespace and subpath.

- **Functions:** `trueLongitude`, `meanAnomaly`, `eccentricity`, `radius`, `apparentLongitude`, `true2000`, `trueEquatorial`, `apparentEquatorial`, `trueVSOP87`, `apparentVSOP87`, `apparentEquatorialVSOP87`, `aberration`
- **Operational notes:** VSOP functions require an Earth `Planet`. Some low-precision angles are intentionally unnormalised.

### `solardisk`

Solar-disk physical ephemeris and rotation cycles. **Availability:** root namespace and subpath.

- **Functions:** `ephemeris`, `cycle`

### `solarxyz`

Rectangular solar coordinates in several epochs. **Availability:** root namespace and subpath.

- **Functions:** `position`, `longitudeJ2000`, `positionJ2000`, `xyz`, `positionB1950`, `positionEquinox`

### `solstice`

Equinoxes, solstices and arbitrary solar longitude. **Availability:** root namespace and subpath.

- **Functions:** `march`, `june`, `september`, `december`, `march2`, `june2`, `september2`, `december2`, `longitude`
- **Operational notes:** Fast variants have bounded high-accuracy ranges; VSOP-backed variants are preferable outside them.

### `stellar`

Combined magnitudes, brightness ratios and absolute magnitude. **Availability:** root namespace and subpath.

- **Functions:** `sum`, `sumN`, `ratio`, `difference`, `absoluteByParallax`, `absoluteByDistance`

### `sundial`

Planar sundial geometry. **Availability:** root namespace and subpath.

- **Functions:** `general`, `equatorial`, `horizontal`, `vertical`

### `sunrise`

Sunrise, sunset, twilight, night and golden-hour events. **Availability:** root namespace and subpath.

- **Classes:** `Sunrise`
- **`Sunrise` class members:** `date: Calendar`, `jde: number`, `lat: number`, `lon: number`, `refraction: number | undefined`, `_calcNoon(jde: number)`, `_calcRiseOrSet(jde: number, h0: number, isSet: boolean): number`, `_calcPolarDayNight(h0: number, isSet: boolean, step: number): Calendar | undefined`, `_calc(h0: number, isSet: boolean): Calendar | undefined`, `noon()`, `rise()`, `set()`, `riseEnd()`, `setStart()`, `dawn()`, `dusk()`, `nauticalDawn()`, `nauticalDusk()`, `nightStart()`, `nightEnd()`, `goldenHourStart()`, `goldenHourEnd()`
- **Operational notes:** Latitude is documented inside roughly ±89.6°. Polar events may return a date away from the requested day or `undefined`.

### `vsop87`

Node-only parser/loader for raw VSOP87 files. **Availability:** subpath only.

- **Classes:** `VSOP`
- **Interfaces:** `VSOPOptions`
- **Types:** `VSOPPlanetName`, `VSOPCoordinate`, `VSOPData`, `LoadCallback`
- **`VSOPOptions` interface members:** `type?: string`
- **`VSOP` class members:** `planet: VSOPPlanetName`, `dirname: string`, `type: string`, `load(cb: LoadCallback): void`, `loadSync(): void`, `parse(source: string): void`, `getData(): Readonly<VSOPData>`
- **Operational notes:** Node-only because it reads the filesystem. Invalid planet names and malformed headers throw.
