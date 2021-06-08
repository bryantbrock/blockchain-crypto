const {Block} = require("./Block")
const {cryptoHash} = require("./cryptoHash")

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock({data}) {
    this.chain.push(
      Block.mineBlock({data, lastBlock: this.chain[this.chain.length-1]})
    )
  }

  replaceChain(chain) {
    if (chain.length <= this.chain.length) {
      console.error('Incoming chain must be longer.')
      return
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('Incoming chain must be valid.')
      return
    }

    console.log('Incoming chain set as new chain.')
    this.chain = chain
  }

  static isValidChain(chain) {
    // Use 'stringify' to deep compare two instances of a func
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