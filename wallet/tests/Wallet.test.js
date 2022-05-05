const {Wallet} = require('../Wallet')
const {Transaction} = require('../Transaction')
const {verifySignature, STARTING_BALANCE} = require('../../config')
const {Blockchain} = require('../../core/Blockchain')

describe('Wallet', () => {
  let wallet

  beforeEach(() => {
    wallet = new Wallet()
  })

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance')
  })

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey')
  })

  describe('signing data', () => {
    const data = 'foobar'

    it('verifies a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true)
    })

    it('does not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false)
    })
  })

  describe('createTransaction()', () => {
    describe('and the amount exceeds the wallet balance', () => {
      it('throws an error', () => {
        const amount = 999999
        const recipient = 'foo-recipient'

        expect(
          () => wallet.createTransaction({amount, recipient})
        ).toThrow('Amount exceeds wallet balance')
      })
    })

    describe('and the amount is contained within the wallet', () => {
      let transaction
      let amount
      let recipient

      beforeEach(() => {
        amount = 50
        recipient = 'foo-recipient'
        transaction = wallet.createTransaction({amount, recipient})
      })

      it('creates an instance of a `Transaction`', () => {
        expect(transaction instanceof Transaction).toBe(true)
      })

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey)
      })

      it('outputs the amount to the recipient', () => {
        expect(transaction.output[recipient]).toEqual(amount)
      })
    })

    describe('and a chain is passed', () => {
      it('calls `Wallet.calculateBalance`', () => {
        const calculateBalanceMock = jest.fn()
        const calculateBalanceOrig = Wallet.calculateBalance
        Wallet.calculateBalance = calculateBalanceMock

        wallet.createTransaction({
          recipient: 'foo',
          amount: 10,
          chain: new Blockchain().chain
        })

        expect(calculateBalanceMock).toHaveBeenCalled()
        Wallet.calculateBalance = calculateBalanceOrig
      })
    })
  })

  describe('calculateBalance()', () => {
    let blockchain

    beforeEach(() => {
      blockchain = new Blockchain()
    })

    describe('and there are no outputs for the wallet', () => {
      it('returns the `STARTING_BALANCE`', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(STARTING_BALANCE)
      })
    })

    describe('and there are outputs adding to the wallet balance', () => {
      let transactionOne
      let transactionTwo

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({amount: 50, recipient: wallet.publicKey})
        transactionTwo = new Wallet().createTransaction({amount: 50, recipient: wallet.publicKey})

        blockchain.addBlock({data: [transactionOne, transactionTwo]})
      })

      it('adds the sum of all outputs to the wallet balance', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(
          STARTING_BALANCE
          + transactionOne.output[wallet.publicKey]
          + transactionTwo.output[wallet.publicKey]
        )
      })

      describe('and the wallet has created a transaction', () => {
        let createdTransaction

        beforeEach(() => {
          createdTransaction = wallet.createTransaction({recipient: 'foo', amount: 50})
          blockchain.addBlock({data: [createdTransaction]})
        })

        it('returns the output amount of the recent transaction', () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })
          ).toEqual(
            createdTransaction.output[wallet.publicKey]
          )
        })

        describe('and there are outputs next to and after the created transaction', () => {
          let createdBlockTransaction
          let nextBlockTransaction

          beforeEach(() => {
            createdTransaction = wallet.createTransaction({
              recipient: 'foo\'s-brother',
              amount: 60
            })

            createdBlockTransaction = Transaction.createRewardTransaction({miner: wallet.publicKey})
            blockchain.addBlock({data: [createdBlockTransaction, createdTransaction]})

            nextBlockTransaction = new Wallet().createTransaction({recipient: wallet.publicKey, amount: 120})
            blockchain.addBlock({data: [nextBlockTransaction]})
          })

          it('includes the output amounts in the returned balance', () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey,
              })
            ).toEqual(
              createdTransaction.output[wallet.publicKey]
              + createdBlockTransaction.output[wallet.publicKey]
              + nextBlockTransaction.output[wallet.publicKey]
            )
          })
        })
      })
    })
  })
})
