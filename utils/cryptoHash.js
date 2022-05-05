const crypto = require('crypto')

module.exports = {
  cryptoHash: (...inputs) => crypto
    .createHash('sha256')
    .update(
      inputs
        .map(input => JSON.stringify(input))
        .sort()
        .join(' ')
    )
    .digest('hex')
}