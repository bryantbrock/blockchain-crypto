const {ec} = require('./elliptic')
const {cryptoHash} = require('../../core/cryptoHash')

const STARTING_BALANCE = 1000

const verifySignature = ({publicKey, data, signature}) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')

  return keyFromPublic.verify(cryptoHash(data), signature)
}

module.exports = {STARTING_BALANCE, verifySignature}