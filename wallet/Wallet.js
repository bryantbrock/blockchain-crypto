const {STARTING_BALANCE} = require('../config')
const {ec} = require('../utils/elliptic')
const {cryptoHash} = require('../utils/cryptoHash')
const {Transaction} = require('./Transaction')

class Wallet {
  constructor(){
    this.balance = STARTING_BALANCE
    this.keyPair = ec.genKeyPair()
    this.publicKey = this.keyPair.getPublic().encode('hex')
  }

  sign(data){
    return this.keyPair.sign(cryptoHash(data))
  }

  createTransaction({amount, recipient, chain}) {
    if (chain) {
      this.balance = Wallet.calculateBalance({chain, address: this.publicKey})
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds wallet balance')
    }

    return new Transaction({senderWallet: this, recipient, amount})
  }

  static calculateBalance({chain, address}) {
    let hasTransacted = false
    let outputsTotal = 0

    for (let i=chain.length-1; i > 0; i--) {
      const block = chain[i]

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasTransacted = true
        }

        if (transaction.output[address]) {
          outputsTotal += transaction.output[address]
        }
      }

      if (hasTransacted) {
        break
      }
    }

    return hasTransacted ? outputsTotal : STARTING_BALANCE + outputsTotal
  }
}

module.exports = {Wallet}