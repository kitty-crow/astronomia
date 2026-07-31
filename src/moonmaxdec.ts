/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module moonmaxdec
 */
/**
 * Moonmaxdec: Chapter 52, Maximum Declinations of the Moon
 */

import base from './base.ts'

/**
 * North computes the maximum northern declination of the Moon near a given date.
 *
 * Argument year is a decimal year specifying a date near the event.
 *
 * Returned is the jde of the event nearest the given date and the declination
 * of the Moon at that time.
 */
export function north (y: number): MaximumDeclination { // (y float64)  (jde, δ float64)
  return max(y, nc)
}

/**
 * South computes the maximum southern declination of the Moon near a given date.
 *
 * Argument year is a decimal year specifying a date near the event.
 *
 * Returned is the jde of the event nearest the given date and the declination
 * of the Moon at that time.
 */
export function south (y: number): MaximumDeclination { // (y float64)  (jde, δ float64)
  return max(y, sc)
}

const p = Math.PI / 180
const ck = 1 / 1336.86

interface MaxDecCoefficients {
  readonly D: number
  readonly m: number
  readonly m_: number
  readonly f: number
  readonly JDE: number
  readonly s: 1 | -1
  readonly tc: readonly number[]
  readonly dc: readonly number[]
}

export interface MaximumDeclination {
  readonly jde: number
  readonly dec: number
}

/**
 * @private
 */
function max (y: number, c: MaxDecCoefficients): MaximumDeclination { // (y float64, c *mc)  (jde, δ float64)
  let k = (y - 2000.03) * 13.3686 // (52.1) p. 367
  k = Math.floor(k + 0.5)
  const T = k * ck
  const D = base.horner(T, c.D, 333.0705546 * p / ck, -0.0004214 * p, 0.00000011 * p)
  const m = base.horner(T, c.m, 26.9281592 * p / ck, -0.0000355 * p, -0.0000001 * p)
  const m_ = base.horner(T, c.m_, 356.9562794 * p / ck, 0.0103066 * p, 0.00001251 * p)
  const f = base.horner(T, c.f, 1.4467807 * p / ck, -0.002069 * p, -0.00000215 * p)
  const E = base.horner(T, 1, -0.002516, -0.0000074)
  const jde = base.horner(T, c.JDE, 27.321582247 / ck, 0.000119804, -0.000000141) +
    base.at(c.tc, 0) * Math.cos(f) +
    base.at(c.tc, 1) * Math.sin(m_) +
    base.at(c.tc, 2) * Math.sin(2 * f) +
    base.at(c.tc, 3) * Math.sin(2 * D - m_) +
    base.at(c.tc, 4) * Math.cos(m_ - f) +
    base.at(c.tc, 5) * Math.cos(m_ + f) +
    base.at(c.tc, 6) * Math.sin(2 * D) +
    base.at(c.tc, 7) * Math.sin(m) * E +
    base.at(c.tc, 8) * Math.cos(3 * f) +
    base.at(c.tc, 9) * Math.sin(m_ + 2 * f) +
    base.at(c.tc, 10) * Math.cos(2 * D - f) +
    base.at(c.tc, 11) * Math.cos(2 * D - m_ - f) +
    base.at(c.tc, 12) * Math.cos(2 * D - m_ + f) +
    base.at(c.tc, 13) * Math.cos(2 * D + f) +
    base.at(c.tc, 14) * Math.sin(2 * m_) +
    base.at(c.tc, 15) * Math.sin(m_ - 2 * f) +
    base.at(c.tc, 16) * Math.cos(2 * m_ - f) +
    base.at(c.tc, 17) * Math.sin(m_ + 3 * f) +
    base.at(c.tc, 18) * Math.sin(2 * D - m - m_) * E +
    base.at(c.tc, 19) * Math.cos(m_ - 2 * f) +
    base.at(c.tc, 20) * Math.sin(2 * (D - m_)) +
    base.at(c.tc, 21) * Math.sin(f) +
    base.at(c.tc, 22) * Math.sin(2 * D + m_) +
    base.at(c.tc, 23) * Math.cos(m_ + 2 * f) +
    base.at(c.tc, 24) * Math.sin(2 * D - m) * E +
    base.at(c.tc, 25) * Math.sin(m_ + f) +
    base.at(c.tc, 26) * Math.sin(m - m_) * E +
    base.at(c.tc, 27) * Math.sin(m_ - 3 * f) +
    base.at(c.tc, 28) * Math.sin(2 * m_ + f) +
    base.at(c.tc, 29) * Math.cos(2 * (D - m_) - f) +
    base.at(c.tc, 30) * Math.sin(3 * f) +
    base.at(c.tc, 31) * Math.cos(m_ + 3 * f) +
    base.at(c.tc, 32) * Math.cos(2 * m_) +
    base.at(c.tc, 33) * Math.cos(2 * D - m_) +
    base.at(c.tc, 34) * Math.cos(2 * D + m_ + f) +
    base.at(c.tc, 35) * Math.cos(m_) +
    base.at(c.tc, 36) * Math.sin(3 * m_ + f) +
    base.at(c.tc, 37) * Math.sin(2 * D - m_ + f) +
    base.at(c.tc, 38) * Math.cos(2 * (D - m_)) +
    base.at(c.tc, 39) * Math.cos(D + f) +
    base.at(c.tc, 40) * Math.sin(m + m_) * E +
    base.at(c.tc, 41) * Math.sin(2 * (D - f)) +
    base.at(c.tc, 42) * Math.cos(2 * m_ + f) +
    base.at(c.tc, 43) * Math.cos(3 * m_ + f)
  const δ = 23.6961 * p - 0.013004 * p * T +
    base.at(c.dc, 0) * Math.sin(f) +
    base.at(c.dc, 1) * Math.cos(2 * f) +
    base.at(c.dc, 2) * Math.sin(2 * D - f) +
    base.at(c.dc, 3) * Math.sin(3 * f) +
    base.at(c.dc, 4) * Math.cos(2 * (D - f)) +
    base.at(c.dc, 5) * Math.cos(2 * D) +
    base.at(c.dc, 6) * Math.sin(m_ - f) +
    base.at(c.dc, 7) * Math.sin(m_ + 2 * f) +
    base.at(c.dc, 8) * Math.cos(f) +
    base.at(c.dc, 9) * Math.sin(2 * D + m - f) * E +
    base.at(c.dc, 10) * Math.sin(m_ + 3 * f) +
    base.at(c.dc, 11) * Math.sin(D + f) +
    base.at(c.dc, 12) * Math.sin(m_ - 2 * f) +
    base.at(c.dc, 13) * Math.sin(2 * D - m - f) * E +
    base.at(c.dc, 14) * Math.sin(2 * D - m_ - f) +
    base.at(c.dc, 15) * Math.cos(m_ + f) +
    base.at(c.dc, 16) * Math.cos(m_ + 2 * f) +
    base.at(c.dc, 17) * Math.cos(2 * m_ + f) +
    base.at(c.dc, 18) * Math.cos(m_ - 3 * f) +
    base.at(c.dc, 19) * Math.cos(2 * m_ - f) +
    base.at(c.dc, 20) * Math.cos(m_ - 2 * f) +
    base.at(c.dc, 21) * Math.sin(2 * m_) +
    base.at(c.dc, 22) * Math.sin(3 * m_ + f) +
    base.at(c.dc, 23) * Math.cos(2 * D + m - f) * E +
    base.at(c.dc, 24) * Math.cos(m_ - f) +
    base.at(c.dc, 25) * Math.cos(3 * f) +
    base.at(c.dc, 26) * Math.sin(2 * D + f) +
    base.at(c.dc, 27) * Math.cos(m_ + 3 * f) +
    base.at(c.dc, 28) * Math.cos(D + f) +
    base.at(c.dc, 29) * Math.sin(2 * m_ - f) +
    base.at(c.dc, 30) * Math.cos(3 * m_ + f) +
    base.at(c.dc, 31) * Math.cos(2 * (D + m_) + f) +
    base.at(c.dc, 32) * Math.sin(2 * (D - m_) - f) +
    base.at(c.dc, 33) * Math.cos(2 * m_) +
    base.at(c.dc, 34) * Math.cos(m_) +
    base.at(c.dc, 35) * Math.sin(2 * f) +
    base.at(c.dc, 36) * Math.sin(m_ + f)
  return { jde, dec: c.s * δ }
}

/**
 * north coefficients
 */
const nc: MaxDecCoefficients = {
  D: 152.2029 * p,
  m: 14.8591 * p,
  m_: 4.6881 * p,
  f: 325.8867 * p,
  JDE: 2451562.5897,
  s: 1,
  tc: [
    0.8975,
    -0.4726,
    -0.1030,
    -0.0976,
    -0.0462,
    -0.0461,
    -0.0438,
    0.0162,
    -0.0157,
    0.0145,
    0.0136,
    -0.0095,
    -0.0091,
    -0.0089,
    0.0075,
    -0.0068,
    0.0061,
    -0.0047,
    -0.0043,
    -0.004,
    -0.0037,
    0.0031,
    0.0030,
    -0.0029,
    -0.0029,
    -0.0027,
    0.0024,
    -0.0021,
    0.0019,
    0.0018,
    0.0018,
    0.0017,
    0.0017,
    -0.0014,
    0.0013,
    0.0013,
    0.0012,
    0.0011,
    -0.0011,
    0.001,
    0.001,
    -0.0009,
    0.0007,
    -0.0007
  ],
  dc: [
    5.1093 * p,
    0.2658 * p,
    0.1448 * p,
    -0.0322 * p,
    0.0133 * p,
    0.0125 * p,
    -0.0124 * p,
    -0.0101 * p,
    0.0097 * p,
    -0.0087 * p,
    0.0074 * p,
    0.0067 * p,
    0.0063 * p,
    0.0060 * p,
    -0.0057 * p,
    -0.0056 * p,
    0.0052 * p,
    0.0041 * p,
    -0.004 * p,
    0.0038 * p,
    -0.0034 * p,
    -0.0029 * p,
    0.0029 * p,
    -0.0028 * p,
    -0.0028 * p,
    -0.0023 * p,
    -0.0021 * p,
    0.0019 * p,
    0.0018 * p,
    0.0017 * p,
    0.0015 * p,
    0.0014 * p,
    -0.0012 * p,
    -0.0012 * p,
    -0.001 * p,
    -0.001 * p,
    0.0006 * p
  ]
}

/**
 * south coefficients
 */
const sc: MaxDecCoefficients = {
  D: 345.6676 * p,
  m: 1.3951 * p,
  m_: 186.21 * p,
  f: 145.1633 * p,
  JDE: 2451548.9289,
  s: -1,
  tc: [
    -0.8975,
    -0.4726,
    -0.1030,
    -0.0976,
    0.0541,
    0.0516,
    -0.0438,
    0.0112,
    0.0157,
    0.0023,
    -0.0136,
    0.011,
    0.0091,
    0.0089,
    0.0075,
    -0.003,
    -0.0061,
    -0.0047,
    -0.0043,
    0.004,
    -0.0037,
    -0.0031,
    0.0030,
    0.0029,
    -0.0029,
    -0.0027,
    0.0024,
    -0.0021,
    -0.0019,
    -0.0006,
    -0.0018,
    -0.0017,
    0.0017,
    0.0014,
    -0.0013,
    -0.0013,
    0.0012,
    0.0011,
    0.0011,
    0.001,
    0.001,
    -0.0009,
    -0.0007,
    -0.0007
  ],
  dc: [
    -5.1093 * p,
    0.2658 * p,
    -0.1448 * p,
    0.0322 * p,
    0.0133 * p,
    0.0125 * p,
    -0.0015 * p,
    0.0101 * p,
    -0.0097 * p,
    0.0087 * p,
    0.0074 * p,
    0.0067 * p,
    -0.0063 * p,
    -0.0060 * p,
    0.0057 * p,
    -0.0056 * p,
    -0.0052 * p,
    -0.0041 * p,
    -0.004 * p,
    -0.0038 * p,
    0.0034 * p,
    -0.0029 * p,
    0.0029 * p,
    0.0028 * p,
    -0.0028 * p,
    0.0023 * p,
    0.0021 * p,
    0.0019 * p,
    0.0018 * p,
    -0.0017 * p,
    0.0015 * p,
    0.0014 * p,
    0.0012 * p,
    -0.0012 * p,
    0.001 * p,
    -0.001 * p,
    0.0037 * p
  ]
}

export default {
  north,
  south
}
