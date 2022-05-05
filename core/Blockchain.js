const {Block} = require('./Block')
const {cryptoHash} = require('../utils/cryptoHash')
const {REWARD_INPUT, MINER_REWARD} = require('../config')
const {Transaction} = require('../wallet/Transaction')
const {Wallet} = require('../wallet/Wallet')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock({data}) {
    this.chain.push(
      Block.mineBlock({data, lastBlock: this.chain[this.chain.length-1]})
    )
  }

  replaceChain(chain, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('Incoming chain must be longer.')
      return
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('Incoming chain must be valid.')
      return
    }

    if (onSuccess) {
      onSuccess()
    }

    console.log('Incoming chain set as new chain.')
    this.chain = chain
  }

  validateTransactionData({chain}) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i]
      const transactionSet = new Set()

      let rewardTransactionCount = 0

      for(let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1

          if (rewardTransactionCount > 1) {
            console.error('Too many miner rewards per block')
            return false
          }

          if (Object.values(transaction.output)[0] !== MINER_REWARD) {
            console.error(`Miner rewards exceeds the reward set at ${MINER_REWARD}`)
            return false
          }
        } else {
          if (!Transaction.validateTransaction(transaction)) {
            console.error('Invalid transaction')
            return false
          }

          const actualBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          })

          if (transaction.input.amount !== actualBalance) {
            console.error('Invalid input amount')
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error('Identical transactions found in a single block')
            return false
          } else {
            transactionSet.add(transaction)
          }
        }
      }
    }

    return true
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false
    }

    for(let i=1; i<chain.length; i++) {
      const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i]
      const validLastHash = chain[i-1].hash
      const lastDifficulty = chain[i-1].difficulty

      if (validLastHash !== lastHash) {
        return false
      }

      const validHash = cryptoHash(
        timestamp, lastHash, data, nonce, difficulty
      )

      if (validHash !== hash) {
        return false
      }

      if (Math.abs(lastDifficulty - difficulty) > 1) {
        return false
      }
    }

    return true
  }
}

module.exports = {Blockchain}