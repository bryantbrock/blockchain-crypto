const crypto = require('crypto')

module.exports = {
  cryptoHash: (...inputs) => crypto
    .createHash('sha256')
    .update(inputs.sort().join(' '))
    .digest('hex')
}