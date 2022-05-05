const {cryptoHash} = require('../cryptoHash')

describe('cryptoHash()', () => {
  it('produces a SHA-256 hashed output', () => {
    const generatedHash = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b'

    expect(cryptoHash('foo')).toEqual(generatedHash)
  })

  it('produces the same hash with the same input arguments in any order', () => {
    expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('two', 'one', 'three'))
  })

  it('produces a unique hash when the properties have changes on an object', () => {
    const foo = {}
    const originalHash = cryptoHash(foo)

    foo.a = 'a'

    expect(cryptoHash(foo)).not.toEqual(originalHash)
  })
})