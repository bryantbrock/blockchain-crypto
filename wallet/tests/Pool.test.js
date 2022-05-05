const {Pool} = require('../Pool')
const {Transaction} = require('../Transaction')
const {Wallet} = require('../Wallet')
const {Blockchain} = require('../../core/Blockchain')

describe('Pool', () => {
  let pool
  let transaction
  let senderWallet

  beforeEach(() => {
    pool = new Pool()
    senderWallet = new Wallet()
    transaction = new Transaction({
      senderWallet,
      recipient: 'foo-recipient',
      amount: 50
    })
  })

  describe('setTransaction()', () => {
    it('adds a transaction', () =>{
      pool.setTransaction(transaction)

      expect(pool.transactions[transaction.id]).toBe(transaction)
    })
  })

  describe('getValidTransactions()', () => {
    let validTransactions
    let errorMock

    beforeEach(() => {
      validTransactions = []
      errorMock = jest.fn()
      global.console.error = errorMock

      for (let i=0; i<10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: 'any-recipient',
          amount: 30
        })

        if (i % 3 === 0) {
          transaction.input.amount = 999999
        } else if (i % 3 === 1) {
          transaction.input.signature = new Wallet().sign('foo')
        } else {
          validTransactions.push(transaction)
        }

        pool.setTransaction(transaction)
      }
    })

    it('returns valid transactions', () => {
      expect(pool.getValidTransactions()).toEqual(validTransactions)
    })

    it('logs errors for the invalid transactions', () => {
      pool.getValidTransactions()
      expect(errorMock).toHaveBeenCalled()
    })
  })

  describe('clear()', () => {
    it('clears the transaction pool', () => {
      pool.clear()
      expect(pool.transactions).toEqual({})
    })
  })

  describe('clearBlockchainTransactions()', () => {
    it('clears the transaction pool of any blockchain transactions', () => {
      const blockchain = new Blockchain()
      const expectedPool = {}

      for (i=0;i<6;i++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'foo',
          amount: 20,
          chain: blockchain.chain
        })

        pool.setTransaction(transaction)

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction]})
        } else {
          expectedPool[transaction.id] = transaction
        }
      }

      pool.clearBlockchainTransactions({ chain: blockchain.chain })
      expect(pool.transactions).toEqual(expectedPool)
    })
  })
})