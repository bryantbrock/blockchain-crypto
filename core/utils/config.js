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

module.exports = {GENESIS_DATA, MINE_RATE}