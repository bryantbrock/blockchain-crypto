const {ec} = require('./utils/elliptic')
const {cryptoHash} = require('./utils/cryptoHash')

const MINE_RATE = 1000 // In seconds, so 1 sec
const INITIAL_DIFFICULTY = 3
const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '---',
  hash: 'gen-hash',
  data: [],
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
}
const STARTING_BALANCE = 1000
const MINER_REWARD = 50
const REWARD_INPUT = {
  address: '**__authorized_rewards_address__**'
}

const verifySignature = ({publicKey, data, signature}) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')

  return keyFromPublic.verify(cryptoHash(data), signature)
}

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  MINER_REWARD,
  REWARD_INPUT,
  STARTING_BALANCE,
  verifySignature
}