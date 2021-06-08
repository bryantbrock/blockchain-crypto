const {GENESIS_DATA, MINE_RATE} = require("./utils/config")
const {cryptoHash} = require("./cryptoHash")
const hexToBinary = require('hex-to-binary')

class Block {
  constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
    this.timestamp = timestamp
    this.lastHash = lastHash
    this.hash = hash
    this.data = data
    this.nonce = nonce
    this.difficulty = difficulty
  }

  // static allows you to not have
  // to call constructor beforehand
  static genesis() {
    return new this(GENESIS_DATA)
  }

  static mineBlock({lastBlock, data}) {
    const lastHash = lastBlock.hash

    let hash
    let timestamp
    let nonce = 0
    let {difficulty} = lastBlock

    do {
      nonce = nonce + 1
      timestamp = Date.now()
      difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp})
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)

    } while (hexToBinary(hash)
      .substring(0, difficulty) !== '0'.repeat(difficulty)
    )

    return new this({hash, timestamp, lastHash, data, difficulty, nonce})
  }

  static adjustDifficulty({originalBlock, timestamp}) {
    const {difficulty} = originalBlock

    if (difficulty < 1) {
      return 1
    }

    const difference = timestamp - originalBlock.timestamp

    return difference > MINE_RATE ?
      difficulty - 1 :
      difficulty + 1
  }
}

module.exports = {Block}