const {cryptoHash} = require('../cryptoHash')

describe('cryptoHash()', () => {
  const hash = "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"

  it('generates a SHA256 hashed output', () => {
    expect(cryptoHash('foo')).toEqual(hash)
  })

  it('generates the same SHA256 hashed output with any number of inputs in any order', () => {
    expect(cryptoHash('foo', 'bar')).toEqual(cryptoHash('bar', 'foo'))
  })
})
