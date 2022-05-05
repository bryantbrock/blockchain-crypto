const {Transaction} = require('./Transaction')

class Pool {
  constructor() {
    this.transactions = {}
  }

  setTransaction(transaction) {
    if (Transaction.validateTransaction(transaction)) {
      this.transactions[transaction.id] = transaction
    }
  }

  clear() {
    this.transactions = {}
  }

  clearBlockchainTransactions({chain}) {
    chain.forEach(block => {
      for (let transaction of block.data) {
        if (this.transactions[transaction.id]) {
          delete this.transactions[transaction.id]
        }
      }
    })
  }

  setTransactions(transactions) {
    this.transactions = transactions
  }

  getValidTransactions() {
    return Object
      .values(this.transactions)
      .filter(transaction => Transaction.validateTransaction(transaction))
  }
}

module.exports = {Pool}