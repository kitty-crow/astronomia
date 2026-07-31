import assert from 'assert'

const float = (num: number) => ({
  toFixed: (precision: number) => {
    assert.ok(typeof num === 'number')
    return parseFloat(num.toFixed(precision), 10)
  }
})
export default float
