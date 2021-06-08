const {STARTING_BALANCE} = require('./utils/config')
const {ec} = require('./utils/elliptic')
const {cryptoHash} = require('../core/cryptoHash')

class Wallet {
  constructor(){
    this.balance = STARTING_BALANCE
    this.keyPair = ec.genKeyPair()
    this.publicKey = this.keyPair.getPublic().encode('hex')
  }

  sign(data){
    return this.keyPair.sign(cryptoHash(data))
  }
}

module.exports = Wallet