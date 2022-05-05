const {Blockchain} = require('../Blockchain')
const {Block} = require('../Block')
const {cryptoHash} = require('../../utils/cryptoHash')

describe('Blockchain', () => {
  let blockchain
  let newChain
  let originalChain

  beforeEach(() => {
    blockchain = new Blockchain()
    newChain = new Blockchain()
    originalChain = blockchain.chain
  })

  it('contains a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true)
  })

  it('starts with genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis())
  })

  it('adds new block to chain', () => {
    blockchain.addBlock({data: 'foo bar'})
    expect(blockchain.chain[blockchain.chain.length-1].data).toEqual('foo bar')
  })

  describe('isValidChain()', () => {
    describe('when the chain does not start with genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = {data: 'fake-block'}

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
      })
    })

    describe('when the chain starts with genesis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({data: 'bears'})
        blockchain.addBlock({data: 'beets'})
        blockchain.addBlock({data: 'battlestar galactica'})
      })

      describe('and last hash referrence has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-lastHash'

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })

      describe('and chain contains block with invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'broken-data'

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('retruns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length-1]
          const lastHash = lastBlock.hash
          const timestamp = Date.now()
          const nonce = 0
          const data = []
          const difficulty = lastBlock.difficulty - 3
          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data)
          const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty, data})

          blockchain.chain.push(badBlock)

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })

      describe('and chain doesn\'t contain invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
        })
      })
    })
  })

  describe('replaceChain()', () => {
    let errorMock
    let logMock

    beforeEach(() => {
      errorMock = jest.fn()
      logMock = jest.fn()

      global.console.error = errorMock
      global.console.log = logMock
    })

    describe('when the new chain is not longer', () => {
      beforeEach(() => {
        newChain.chain[0] = {new: 'chain'}
        blockchain.replaceChain(newChain.chain)
      })

      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain)
      })

      it('logs an error', () => {
        expect(errorMock).toHaveBeenCalled()
      })
    })

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({data: 'bears'})
        newChain.addBlock({data: 'beets'})
        newChain.addBlock({data: 'battlestar galactica'})
      })

      describe('and the chain is invalid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'fake-hash'
          blockchain.replaceChain(newChain.chain)
        })

        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain)
        })

        it('logs an error', () => {
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the chain is valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain)
        })

        it('replaces the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain)
        })

        it('logs the chain replacement', () => {
          expect(logMock).toHaveBeenCalled()
        })
      })
    })
  })
})
