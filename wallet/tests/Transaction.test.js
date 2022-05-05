const {Transaction} = require('../Transaction');
const {Wallet} = require('../Wallet');
const {Blockchain} = require('../../core/Blockchain')
const {verifySignature, REWARD_INPUT, MINER_REWARD} = require('../../config');

describe('Transaction', () => {
  let transaction
  let senderWallet
  let recipient
  let amount

  beforeEach(() => {
    senderWallet = new Wallet()
    recipient = 'recipient-public-key'
    amount = 50

    transaction = new Transaction({senderWallet, recipient, amount})
  })

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id')
  })

  describe('output', () => {
    it('has an `output`', () => {
      expect(transaction).toHaveProperty('output')
    })

    it('it outputs the amount to the recipient', () => {
      expect(transaction.output[recipient]).toEqual(amount)
    })

    it('outputs the remaining value for the `senderWallet`', () => {
      expect(transaction.output[senderWallet.publicKey])
        .toEqual(senderWallet.balance - amount)
    })
  })

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input')
    })

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp')
    })

    it('it sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance)
    })

    it('it sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey)
    })

    it('signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.output,
          signature: transaction.input.signature,
        })
      ).toBe(true)
    })
  })

  describe('validateTransaction()', () => {
    let errorMock

    beforeEach(() => {
      errorMock = jest.fn()

      global.console.error = errorMock
    })

    describe('when the transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validateTransaction(transaction)).toBe(true)
      })
    })

    describe('when the transaction is invalid', () => {
      describe('and a transaction output value is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.output[senderWallet.publicKey] = 999999

          expect(Transaction.validateTransaction(transaction)).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the transaction signature is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.input.signature = new Wallet().sign('data')

          expect(Transaction.validateTransaction(transaction)).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })
    })
  })

  describe('update()', () => {
    describe('and the next amount exceeds the `output`s sender balance', () => {
      it('throws an error', () => {
        const nextRecipient = 'next-foo-recipient'
        const nextAmount = 999999

        expect(
          () => transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount})
        ).toThrow('New amount exceeds wallet balance')
      })
    })

    describe('and the next amount does not exceed the `output`s sender balance', () => {
      let originalSignature
      let originalSenderOuput
      let nextRecipient
      let nextAmount

      beforeEach(() => {
        originalSignature = transaction.input.signature
        originalSenderOuput = transaction.output[senderWallet.publicKey]
        nextRecipient = 'next-foo-recipient'
        nextAmount = 50

        transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount})
      })

      it('outputs the amount to the next recipient', () => {
        expect(transaction.output[nextRecipient]).toEqual(nextAmount)
      })

      it('subtracts the amount from the sender output amount', () => {
        expect(transaction.output[senderWallet.publicKey]).toEqual(originalSenderOuput - nextAmount)
      })

      it('maintains a total output value that matches the input amount', () => {
        expect(
          Object.values(transaction.output).reduce((acc, outputAmount) => acc + outputAmount)
        ).toEqual(transaction.input.amount)
      })

      it('re-signs the transaction', () => {
        expect(transaction.input.signature).not.toEqual(originalSignature)
      })

      describe('and another update for the same recipient', () => {
        let addedAmount

        beforeEach(() => {
          addedAmount = 80

          transaction.update({senderWallet, recipient: nextRecipient, amount: addedAmount})
        })

        it('adds to the recipient amount', () => {
          expect(transaction.output[nextRecipient]).toEqual(nextAmount + addedAmount)
        })

        it('subtracts the amount from the original sender output amount', () => {
          expect(transaction.output[senderWallet.publicKey]).toEqual(originalSenderOuput - nextAmount - addedAmount)
        })
      })
    })

  })

  describe('createRewardTransaction()', () => {
    let rewardTransaction
    let minerWallet

    beforeEach(() => {
      minerWallet = new Wallet()
      rewardTransaction = Transaction.createRewardTransaction({ miner: minerWallet.publicKey })
    })

    it('creates a miner\'s reward transaction', () => {
      expect(rewardTransaction.input).toEqual(REWARD_INPUT)
    })

    it('creates a miner\'s reward transaction', () => {
      expect(rewardTransaction.input).toEqual(REWARD_INPUT)
      expect(rewardTransaction.output[minerWallet.publicKey]).toEqual(MINER_REWARD)
    })
  })
})