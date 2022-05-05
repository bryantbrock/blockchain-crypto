const {Wallet} = require('../wallet/Wallet')
const {Transaction} = require('../wallet/Transaction')
const {Blockchain} = require('../core/Blockchain')

describe('Integration Tests', () => {
  describe('validateTransactionData()', () => {
    let wallet
    let blockchain
    let otherBlockchain
    let transaction
    let rewardTransaction

    let errorMock

    beforeEach(() => {
      wallet = new Wallet()
      blockchain = new Blockchain()
      otherBlockchain = new Blockchain()
      transaction = new Transaction({senderWallet: wallet, recipient: 'foo', amount: 65})
      rewardTransaction = Transaction.createRewardTransaction({miner: wallet.publicKey})

      errorMock = jest.fn()
      global.console.error = errorMock
    })

    describe('and the transaction data is valid', () => {
      it('returns true', () => {
        otherBlockchain.addBlock({data: [transaction, rewardTransaction]})

        expect(blockchain.validateTransactionData({chain: otherBlockchain.chain})).toBe(true)
        expect(errorMock).not.toHaveBeenCalled()
      })
    })

    describe('and the transaction data is invalid', () => {
      describe('and has multiple rewards', () => {
        it('returns false and logs an error', () => {
          otherBlockchain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]})

          expect(blockchain.validateTransactionData({chain: otherBlockchain.chain})).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the transaction data has at least one malformed output value', () => {
        describe('and the transaction is not a reward transaction', () => {
          it('returns false and logs an error', () => {
            transaction.output[wallet.publicKey] = 999999
            otherBlockchain.addBlock({data: [transaction, rewardTransaction]})

            expect(blockchain.validateTransactionData({chain: otherBlockchain.chain})).toBe(false)
            expect(errorMock).toHaveBeenCalled()
          })
        })

        describe('and the transaction is a reward transaction', () => {
          it('returns false and logs an error', () => {
            rewardTransaction.output[wallet.publicKey] = 999999
            otherBlockchain.addBlock({data: [transaction, rewardTransaction]})

            expect(blockchain.validateTransactionData({chain: otherBlockchain.chain})).toBe(false)
            expect(errorMock).toHaveBeenCalled()
          })
        })
      })

      describe('and the transaction data has at least one malformed input', () => {
        it('returns false and logs an error', () => {
          wallet.balance = 9000

          const badOutput = {
            [wallet.publicKey]: 8500,
            'foo-recipient': 500
          }
          const badTransaction = {
            input: {
              timestamp: Date.now(),
              amount: wallet.balance,
              address: wallet.publicKey,
              signature: wallet.sign(badOutput)
            },
            output: badOutput,
          }

          otherBlockchain.addBlock({data: [badTransaction, rewardTransaction]})

          expect(blockchain.validateTransactionData({chain: otherBlockchain.chain})).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the block contains multiple identical transactions', () => {
        it('returns false and logs an error', () => {
          otherBlockchain.addBlock({data: [transaction, transaction, transaction]})

          expect(blockchain.validateTransactionData({chain: otherBlockchain.chain})).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })
    })
  })
})