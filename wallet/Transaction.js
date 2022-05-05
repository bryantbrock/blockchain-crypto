const uuid = require('uuid/v1')
const {verifySignature, REWARD_INPUT, MINER_REWARD} = require('../config')

class Transaction {
  constructor({senderWallet, recipient, amount}) {
    this.id = uuid()
    this.output = this.createOutput({senderWallet, recipient, amount})
    this.input = this.createInput({senderWallet, output: this.output})
  }

  createOutput({senderWallet, recipient, amount}) {
    const output = {}

    output[recipient] = amount
    output[senderWallet.publicKey] = senderWallet.balance - amount

    return output
  }

  createInput({senderWallet, output}) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(output)
    }
  }

  update({senderWallet, recipient, amount}) {
    if (amount > this.output[senderWallet.publicKey]) {
      throw new Error('New amount exceeds wallet balance')
    }

    if (!this.output[recipient]) {
      this.output[recipient] = amount
    } else {
      this.output[recipient] += amount
    }

    this.output[senderWallet.publicKey] -= amount
    this.input = this.createInput({senderWallet, output: this.output})
  }

  static validateTransaction(transaction) {
    const {input: {address, amount, signature}, output} = transaction
    const outputTotal = Object.values(output).reduce((acc, outputAmount) => acc + outputAmount)

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`)
      return false
    }

    if (!verifySignature({publicKey: address, data: output, signature})) {
      console.error(`Invalid signature from ${address}`)
      return false
    }

    return true
  }

  static createRewardTransaction({miner}) {
    return {
      id: uuid(),
      input: REWARD_INPUT,
      output: {
        [miner]: MINER_REWARD
      }
    }
  }
}

module.exports = {Transaction}